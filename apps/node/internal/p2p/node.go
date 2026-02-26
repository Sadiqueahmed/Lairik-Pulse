package p2p

import (
	"context"
	"fmt"

	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/p2p/discovery/mdns"
	"github.com/libp2p/go-libp2p/p2p/security/noise"
	"github.com/libp2p/go-libp2p/p2p/transport/tcp"
	"github.com/sirupsen/logrus"
)

type Config struct {
	Port    int
	DataDir string
	Logger  *logrus.Logger
}

type Node struct {
	host   host.Host
	config Config
	ctx    context.Context
	cancel context.CancelFunc
}

func NewNode(ctx context.Context, cfg Config) (*Node, error) {
	nodeCtx, cancel := context.WithCancel(ctx)

	// Create libp2p host
	h, err := libp2p.New(
		libp2p.ListenAddrStrings(fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", cfg.Port)),
		libp2p.Security(noise.ID, noise.New),
		libp2p.Transport(tcp.NewTCPTransport),
		libp2p.NATPortMap(),
		libp2p.EnableRelay(),
	)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to create host: %w", err)
	}

	node := &Node{
		host:   h,
		config: cfg,
		ctx:    nodeCtx,
		cancel: cancel,
	}

	return node, nil
}

func (n *Node) Start() error {
	n.config.Logger.Infof("P2P node starting with ID: %s", n.host.ID().String())
	n.config.Logger.Infof("Listening on: %v", n.host.Addrs())

	// Setup mDNS discovery
	mdnsService := mdns.NewMdnsService(n.host, "lairik-pulse", &discoveryNotifee{n: n})
	if err := mdnsService.Start(); err != nil {
		return fmt.Errorf("failed to start mDNS: %w", err)
	}

	// Keep the node running
	<-n.ctx.Done()
	return nil
}

func (n *Node) Stop() error {
	n.cancel()
	return n.host.Close()
}

func (n *Node) ID() string {
	return n.host.ID().String()
}

func (n *Node) Peers() []peer.ID {
	return n.host.Network().Peers()
}

type discoveryNotifee struct {
	n *Node
}

func (d *discoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
	d.n.config.Logger.Infof("Discovered peer: %s", pi.ID.String())
	
	// Connect to discovered peer
	if err := d.n.host.Connect(d.n.ctx, pi); err != nil {
		d.n.config.Logger.Warnf("Failed to connect to peer %s: %v", pi.ID.String(), err)
	} else {
		d.n.config.Logger.Infof("Connected to peer: %s", pi.ID.String())
	}
}
