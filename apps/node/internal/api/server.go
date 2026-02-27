package api

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/lairik-pulse/node/internal/ipfs"
	"github.com/lairik-pulse/node/internal/p2p"
	"github.com/lairik-pulse/node/internal/zkp"
	"github.com/sirupsen/logrus"
)

type Config struct {
	Port     int
	P2PNode  *p2p.Node
	IPFSNode *ipfs.Node
	ZKP      *zkp.Service
	Logger   *logrus.Logger
}

type Server struct {
	config Config
	router *gin.Engine
	server *http.Server
	upgrader websocket.Upgrader
}

func NewServer(cfg Config) *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())

	s := &Server{
		config: cfg,
		router: router,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins in development
			},
		},
	}

	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	// Health check
	s.router.GET("/health", s.handleHealth)

	// P2P endpoints
	s.router.GET("/p2p/status", s.handleP2PStatus)
	s.router.GET("/p2p/peers", s.handleP2PPeers)
	s.router.GET("/p2p/ws", s.handleP2PWebSocket)

	// IPFS endpoints
	s.router.POST("/ipfs/add", s.handleIPFSAdd)
	s.router.GET("/ipfs/get/:cid", s.handleIPFSGet)

	// ZKP endpoints
	s.router.POST("/zkp/generate", s.handleZKPGenerate)
	s.router.POST("/zkp/verify", s.handleZKPVerify)

	// Document vault endpoints
	s.router.POST("/vault/documents", s.handleAddDocument)
	s.router.GET("/vault/documents", s.handleListDocuments)
	s.router.GET("/vault/documents/:id", s.handleGetDocument)
	s.router.DELETE("/vault/documents/:id", s.handleDeleteDocument)
}

func (s *Server) Start() error {
	s.config.Logger.Infof("API server starting on port %d", s.config.Port)

	s.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", s.config.Port),
		Handler: s.router,
	}

	return s.server.ListenAndServe()
}

func (s *Server) Stop() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.server.Shutdown(ctx)
}

func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"version":   "1.0.0",
	})
}

func (s *Server) handleP2PStatus(c *gin.Context) {
	peers := s.config.P2PNode.Peers()
	peerList := make([]gin.H, len(peers))
	for i, p := range peers {
		peerList[i] = gin.H{
			"id":        p.String(),
			"address":   s.getPeerAddress(p),
			"connected": true,
		}
	}
	
	c.JSON(http.StatusOK, gin.H{
		"connected": true,
		"node_id":   s.config.P2PNode.ID(),
		"peer_count": len(peers),
		"peers":     peerList,
	})
}

func (s *Server) handleP2PPeers(c *gin.Context) {
	peers := s.config.P2PNode.Peers()
	peerList := make([]gin.H, len(peers))
	for i, p := range peers {
		peerList[i] = gin.H{
			"id":        p.String(),
			"address":   s.getPeerAddress(p),
			"connected": true,
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"peers": peerList,
		"count": len(peers),
	})
}

func (s *Server) getPeerAddress(peerID interface{}) string {
	// Convert peer ID to string and return a formatted address
	if id, ok := peerID.(interface{ String() string }); ok {
		return "/ip4/192.168.1." + fmt.Sprintf("%d", len(id.String())%255) + "/tcp/4001"
	}
	return "/ip4/127.0.0.1/tcp/4001"
}

func (s *Server) handleP2PWebSocket(c *gin.Context) {
	conn, err := s.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		s.config.Logger.Errorf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	s.config.Logger.Info("WebSocket client connected for P2P updates")

	// Send initial status
	initialStatus := gin.H{
		"type": "status",
		"payload": gin.H{
			"connected":  true,
			"node_id":    s.config.P2PNode.ID(),
			"peer_count": len(s.config.P2PNode.Peers()),
		},
		"timestamp": time.Now().Unix(),
	}
	conn.WriteJSON(initialStatus)

	// Send peer list
	peers := s.config.P2PNode.Peers()
	peerList := make([]gin.H, len(peers))
	for i, p := range peers {
		peerList[i] = gin.H{
			"id":        p.String(),
			"address":   s.getPeerAddress(p),
			"connected": true,
		}
	}
	
	peerUpdate := gin.H{
		"type": "peers",
		"payload": gin.H{
			"peers": peerList,
			"count": len(peers),
		},
		"timestamp": time.Now().Unix(),
	}
	conn.WriteJSON(peerUpdate)

	// Keep connection alive and send periodic updates
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Send heartbeat
			heartbeat := gin.H{
				"type":      "ping",
				"payload":   gin.H{"timestamp": time.Now().Unix()},
				"timestamp": time.Now().Unix(),
			}
			if err := conn.WriteJSON(heartbeat); err != nil {
				s.config.Logger.Warnf("WebSocket write error: %v", err)
				return
			}
			
		default:
			// Check for client messages
			_, _, err := conn.ReadMessage()
			if err != nil {
				s.config.Logger.Info("WebSocket client disconnected")
				return
			}
		}
	}
}

func (s *Server) handleIPFSAdd(c *gin.Context) {
	// TODO: Implement file upload and IPFS add
	c.JSON(http.StatusOK, gin.H{"cid": "placeholder"})
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

func (s *Server) handleZKPGenerate(c *gin.Context) {
	var req struct {
		DocumentID string `json:"document_id"`
		ProofType  string `json:"proof_type"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Get document data and generate proof
	c.JSON(http.StatusOK, gin.H{
		"proof_hash": "0x...",
		"type":       req.ProofType,
	})
}

func (s *Server) handleZKPVerify(c *gin.Context) {
	var req struct {
		Proof string `json:"proof"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Verify proof
	c.JSON(http.StatusOK, gin.H{"valid": true})
}

func (s *Server) handleAddDocument(c *gin.Context) {
	// TODO: Add document to local vault
	c.JSON(http.StatusOK, gin.H{"id": "doc-id"})
}

func (s *Server) handleListDocuments(c *gin.Context) {
	// TODO: List documents from local vault
	c.JSON(http.StatusOK, gin.H{"documents": []interface{}{}})
}

func (s *Server) handleGetDocument(c *gin.Context) {
	id := c.Param("id")
	// TODO: Get document by ID
	c.JSON(http.StatusOK, gin.H{"id": id})
}

func (s *Server) handleDeleteDocument(c *gin.Context) {
	id := c.Param("id")
	// TODO: Delete document
	c.JSON(http.StatusOK, gin.H{"deleted": id})
}

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
