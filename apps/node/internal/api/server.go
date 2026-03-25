package api

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/lairik-pulse/node/internal/database"
	"github.com/lairik-pulse/node/internal/ipfs"
	"github.com/lairik-pulse/node/internal/nlp"
	"github.com/lairik-pulse/node/internal/p2p"
	"github.com/lairik-pulse/node/internal/zkp"
	cryptopkg "github.com/lairik-pulse/node/pkg/crypto"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/sirupsen/logrus"
)

// Config holds all dependencies for the API server.
type Config struct {
	Port     int
	P2PNode  *p2p.Node
	IPFSNode *ipfs.Node
	ZKP      *zkp.Service
	DB       *database.DB
	NLP      *nlp.Service
	Logger   *logrus.Logger
}

// Server is the HTTP/WebSocket server.
type Server struct {
	config   Config
	router   *gin.Engine
	server   *http.Server
	upgrader websocket.Upgrader
	enc      *cryptopkg.EncryptionService
}

// NewServer creates and configures the server.
func NewServer(cfg Config) *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())

	s := &Server{
		config: cfg,
		router: router,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
		enc: cryptopkg.NewEncryptionService("lairik-pulse-vault-key"),
	}

	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	// Health
	s.router.GET("/health", s.handleHealth)

	// P2P
	s.router.GET("/p2p/status", s.handleP2PStatus)
	s.router.GET("/p2p/peers", s.handleP2PPeers)
	s.router.GET("/p2p/ws", s.handleP2PWebSocket)

	// IPFS
	s.router.POST("/ipfs/add", s.handleIPFSAdd)
	s.router.GET("/ipfs/get/:cid", s.handleIPFSGet)

	// ZKP
	s.router.POST("/zkp/generate", s.handleZKPGenerate)
	s.router.POST("/zkp/verify", s.handleZKPVerify)

	// Document vault
	s.router.POST("/vault/documents", s.handleAddDocument)
	s.router.GET("/vault/documents", s.handleListDocuments)
	s.router.GET("/vault/documents/:id", s.handleGetDocument)
	s.router.DELETE("/vault/documents/:id", s.handleDeleteDocument)

	// NLP
	s.router.POST("/nlp/translate", s.handleNLPTranslate)
	s.router.POST("/nlp/summarize", s.handleNLPSummarize)
}

// Start begins listening.
func (s *Server) Start() error {
	s.config.Logger.Infof("API server starting on port %d", s.config.Port)
	s.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", s.config.Port),
		Handler: s.router,
	}
	return s.server.ListenAndServe()
}

// Stop gracefully shuts down the server.
func (s *Server) Stop() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.server.Shutdown(ctx)
}

// ──────────────────────────────────────────────
// Health
// ──────────────────────────────────────────────

func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"version":   "1.0.0",
	})
}

// ──────────────────────────────────────────────
// P2P
// ──────────────────────────────────────────────

func (s *Server) handleP2PStatus(c *gin.Context) {
	peers := s.config.P2PNode.Peers()
	peerList := s.buildPeerList(peers)
	c.JSON(http.StatusOK, gin.H{
		"connected":  true,
		"node_id":    s.config.P2PNode.ID(),
		"peer_count": len(peers),
		"peers":      peerList,
	})
}

func (s *Server) handleP2PPeers(c *gin.Context) {
	peers := s.config.P2PNode.Peers()
	c.JSON(http.StatusOK, gin.H{
		"peers": s.buildPeerList(peers),
		"count": len(peers),
	})
}

func (s *Server) handleP2PWebSocket(c *gin.Context) {
	conn, err := s.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		s.config.Logger.Errorf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()
	s.config.Logger.Info("WebSocket client connected")

	// Send initial status
	conn.WriteJSON(gin.H{
		"type":      "status",
		"payload":   gin.H{"connected": true, "node_id": s.config.P2PNode.ID(), "peer_count": len(s.config.P2PNode.Peers())},
		"timestamp": time.Now().Unix(),
	})

	// Send initial peer list
	conn.WriteJSON(gin.H{
		"type":      "peers",
		"payload":   gin.H{"peers": s.buildPeerList(s.config.P2PNode.Peers()), "count": len(s.config.P2PNode.Peers())},
		"timestamp": time.Now().Unix(),
	})

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	quit := make(chan struct{})

	// Read goroutine — avoids spin-loop
	go func() {
		defer close(quit)
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				s.config.Logger.Info("WebSocket client disconnected")
				return
			}
		}
	}()

	for {
		select {
		case <-quit:
			return
		case <-ticker.C:
			peers := s.config.P2PNode.Peers()
			if err := conn.WriteJSON(gin.H{
				"type":      "peers",
				"payload":   gin.H{"peers": s.buildPeerList(peers), "count": len(peers)},
				"timestamp": time.Now().Unix(),
			}); err != nil {
				return
			}
		}
	}
}

func (s *Server) buildPeerList(peers []peer.ID) []gin.H {
	list := make([]gin.H, len(peers))
	for i, p := range peers {
		list[i] = gin.H{
			"id":        p.String(),
			"connected": true,
		}
	}
	return list
}

// ──────────────────────────────────────────────
// IPFS
// ──────────────────────────────────────────────

func (s *Server) handleIPFSAdd(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing file field: " + err.Error()})
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read file: " + err.Error()})
		return
	}

	cid, err := s.config.IPFSNode.Add(data)
	if err != nil {
		// IPFS may not be running in dev
		s.config.Logger.Warnf("IPFS add failed (is IPFS daemon running?): %v", err)
		c.JSON(http.StatusOK, gin.H{"cid": "", "name": header.Filename, "warning": "IPFS not available"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cid": cid, "name": header.Filename})
}

func (s *Server) handleIPFSGet(c *gin.Context) {
	cid := c.Param("cid")
	data, err := s.config.IPFSNode.Get(cid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/octet-stream", data)
}

// ──────────────────────────────────────────────
// ZKP
// ──────────────────────────────────────────────

func (s *Server) handleZKPGenerate(c *gin.Context) {
	var req struct {
		DocumentID string `json:"document_id" binding:"required"`
		ProofType  string `json:"proof_type"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.ProofType == "" {
		req.ProofType = "degree"
	}

	// Fetch document from DB
	doc, err := s.config.DB.GetDocument(req.DocumentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found: " + err.Error()})
		return
	}

	// Use content as witness data; fall back to hash bytes if content not stored
	witnessData := doc.Content
	if len(witnessData) == 0 {
		witnessData = []byte(doc.Hash)
	}

	result, err := s.config.ZKP.GenerateProof(witnessData, req.ProofType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "proof generation failed: " + err.Error()})
		return
	}

	// Persist proof
	proofRecord := database.ProofRecord{
		ID:               uuid.New().String(),
		DocumentID:       req.DocumentID,
		ProofHash:        result.Hash,
		ProofType:        req.ProofType,
		ProofData:        result.ProofBytes,
		VerifyingKey:     result.VerifyingKeyBytes,
		VerificationTime: result.VerificationTime,
		SizeBytes:        result.SizeBytes,
		CreatedAt:        time.Now(),
	}
	if err := s.config.DB.SaveProof(proofRecord); err != nil {
		s.config.Logger.Warnf("failed to save proof: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"proof_hash":        result.Hash,
		"type":              req.ProofType,
		"verification_time": result.VerificationTime,
		"size_bytes":        result.SizeBytes,
	})
}

func (s *Server) handleZKPVerify(c *gin.Context) {
	var req struct {
		ProofHash string `json:"proof_hash" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Lookup proof from DB
	proof, err := s.config.DB.GetProofByHash(req.ProofHash)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "proof not found: " + err.Error()})
		return
	}

	valid, err := s.config.ZKP.VerifyProofFromBytes(proof.ProofData, proof.VerifyingKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "verification error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":      valid,
		"proof_hash": req.ProofHash,
		"proof_type": proof.ProofType,
	})
}

// ──────────────────────────────────────────────
// Document Vault
// ──────────────────────────────────────────────

func (s *Server) handleAddDocument(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing file: " + err.Error()})
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "read error: " + err.Error()})
		return
	}

	// Compute hash
	hash := cryptopkg.Hash(data)

	// Encrypt content
	encrypted, err := s.enc.Encrypt(data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "encryption failed: " + err.Error()})
		return
	}

	// Optional: pin to IPFS
	cid := ""
	if s.config.IPFSNode != nil {
		if c, ipfsErr := s.config.IPFSNode.Add(data); ipfsErr == nil {
			cid = c
		}
	}

	doc := database.DocumentRecord{
		ID:        uuid.New().String(),
		Name:      header.Filename,
		Type:      header.Header.Get("Content-Type"),
		Size:      int64(len(data)),
		Hash:      hash,
		CID:       cid,
		Encrypted: true,
		Content:   encrypted,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.config.DB.AddDocument(doc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":         doc.ID,
		"name":       doc.Name,
		"hash":       doc.Hash,
		"cid":        doc.CID,
		"size":       doc.Size,
		"encrypted":  true,
		"created_at": doc.CreatedAt,
	})
}

func (s *Server) handleListDocuments(c *gin.Context) {
	docs, err := s.config.DB.ListDocuments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result := make([]gin.H, len(docs))
	for i, d := range docs {
		result[i] = gin.H{
			"id":         d.ID,
			"name":       d.Name,
			"type":       d.Type,
			"size":       d.Size,
			"hash":       d.Hash,
			"cid":        d.CID,
			"encrypted":  d.Encrypted,
			"created_at": d.CreatedAt,
		}
	}
	c.JSON(http.StatusOK, gin.H{"documents": result, "count": len(result)})
}

func (s *Server) handleGetDocument(c *gin.Context) {
	id := c.Param("id")
	doc, err := s.config.DB.GetDocument(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	// Decrypt for download
	plaintext, err := s.enc.Decrypt(doc.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "decryption failed"})
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", doc.Name))
	c.Data(http.StatusOK, doc.Type, plaintext)
}

func (s *Server) handleDeleteDocument(c *gin.Context) {
	id := c.Param("id")
	if err := s.config.DB.DeleteDocument(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": id})
}

// ──────────────────────────────────────────────
// NLP
// ──────────────────────────────────────────────

func (s *Server) handleNLPTranslate(c *gin.Context) {
	var req nlp.TranslationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := s.config.NLP.Translate(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (s *Server) handleNLPSummarize(c *gin.Context) {
	var req nlp.SummarizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := s.config.NLP.Summarize(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
