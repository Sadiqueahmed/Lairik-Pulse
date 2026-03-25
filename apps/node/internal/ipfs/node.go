package ipfs

import (
	"bytes"
	"context"
	"fmt"
	"io"

	shell "github.com/ipfs/go-ipfs-api"
	"github.com/sirupsen/logrus"
)

type Config struct {
	RepoPath string
	Logger   *logrus.Logger
}

type Node struct {
	sh     *shell.Shell
	config Config
	ctx    context.Context
	cancel context.CancelFunc
}

func NewNode(ctx context.Context, cfg Config) (*Node, error) {
	nodeCtx, cancel := context.WithCancel(ctx)

	sh := shell.NewShell("localhost:5001")

	node := &Node{
		sh:     sh,
		config: cfg,
		ctx:    nodeCtx,
		cancel: cancel,
	}

	return node, nil
}

func (n *Node) Start() error {
	n.config.Logger.Info("IPFS node starting...")

	// Test connection
	if !n.sh.IsUp() {
		n.config.Logger.Warn("IPFS daemon not running, will retry...")
	}

	// Keep the node running
	<-n.ctx.Done()
	return nil
}

func (n *Node) Stop() error {
	n.cancel()
	return nil
}

func (n *Node) Add(data []byte) (string, error) {
	if !n.sh.IsUp() {
		return "", fmt.Errorf("IPFS daemon not available")
	}

	cid, err := n.sh.Add(bytes.NewReader(data))
	if err != nil {
		return "", fmt.Errorf("failed to add to IPFS: %w", err)
	}

	return cid, nil
}

func (n *Node) Get(cid string) ([]byte, error) {
	if !n.sh.IsUp() {
		return nil, fmt.Errorf("IPFS daemon not available")
	}

	reader, err := n.sh.Cat(cid)
	if err != nil {
		return nil, fmt.Errorf("failed to get from IPFS: %w", err)
	}

	return io.ReadAll(reader)
}

func (n *Node) Pin(cid string) error {
	if !n.sh.IsUp() {
		return fmt.Errorf("IPFS daemon not available")
	}

	return n.sh.Pin(cid)
}
