package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/lairik-pulse/node/internal/api"
	"github.com/lairik-pulse/node/internal/database"
	"github.com/lairik-pulse/node/internal/ipfs"
	"github.com/lairik-pulse/node/internal/nlp"
	"github.com/lairik-pulse/node/internal/p2p"
	"github.com/lairik-pulse/node/internal/zkp"
	"github.com/sirupsen/logrus"
)

var (
	_         = flag.String("config", "", "Path to config file")
	port      = flag.Int("port", 8080, "API server port")
	p2pPort   = flag.Int("p2p-port", 0, "P2P port (0 for random)")
	dataDir   = flag.String("data", "./data", "Data directory")
)

func main() {
	flag.Parse()

	log := logrus.New()
	log.SetLevel(logrus.InfoLevel)
	log.SetFormatter(&logrus.TextFormatter{FullTimestamp: true})
	log.Info("Starting Lairik-Pulse Node...")

	// Create data directory
	if err := os.MkdirAll(*dataDir, 0755); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ── Database ──────────────────────────────────────────────────────
	db, err := database.Open(*dataDir, log)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// ── P2P Node ─────────────────────────────────────────────────────
	p2pNode, err := p2p.NewNode(ctx, p2p.Config{
		Port:    *p2pPort,
		DataDir: *dataDir,
		Logger:  log,
	})
	if err != nil {
		log.Fatalf("Failed to create P2P node: %v", err)
	}

	// ── IPFS ─────────────────────────────────────────────────────────
	ipfsNode, err := ipfs.NewNode(ctx, ipfs.Config{
		RepoPath: fmt.Sprintf("%s/ipfs", *dataDir),
		Logger:   log,
	})
	if err != nil {
		log.Fatalf("Failed to create IPFS node: %v", err)
	}

	// ── ZKP (compiles circuit at startup) ─────────────────────────────
	zkpService, err := zkp.NewService(zkp.Config{
		DataDir: *dataDir,
		Logger:  log,
	})
	if err != nil {
		log.Fatalf("Failed to create ZKP service: %v", err)
	}

	// ── NLP ───────────────────────────────────────────────────────────
	nlpService := nlp.NewService()

	// ── API Server ────────────────────────────────────────────────────
	apiServer := api.NewServer(api.Config{
		Port:     *port,
		P2PNode:  p2pNode,
		IPFSNode: ipfsNode,
		ZKP:      zkpService,
		DB:       db,
		NLP:      nlpService,
		Logger:   log,
	})

	// Start background services
	go func() {
		if err := p2pNode.Start(); err != nil {
			log.Errorf("P2P node error: %v", err)
		}
	}()

	go func() {
		if err := ipfsNode.Start(); err != nil {
			log.Errorf("IPFS node error: %v", err)
		}
	}()

	go func() {
		if err := apiServer.Start(); err != nil {
			log.Fatalf("API server error: %v", err)
		}
	}()

	log.Infof("Lairik-Pulse Node running on port %d", *port)
	log.Infof("P2P Node ID: %s", p2pNode.ID())
	log.Info("Press Ctrl+C to stop")

	// Wait for shutdown signal
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	log.Info("Shutting down...")
	apiServer.Stop()
	ipfsNode.Stop()
	p2pNode.Stop()
	log.Info("Shutdown complete")
}

