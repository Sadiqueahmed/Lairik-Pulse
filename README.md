# Lairik-Pulse

**Offline-Mesh Verification & Recovery for Manipur**

Lairik-Pulse is a privacy-first, offline-capable document verification system designed for crisis recovery scenarios. It combines peer-to-peer mesh networking, zero-knowledge proofs, and decentralized storage to enable secure document verification without relying on centralized infrastructure.

## 🌟 Key Features

- **🔒 Zero-Knowledge Proofs**: Verify documents without revealing their contents using ZK-SNARKs (Groth16 via gnark)
- **📡 Mesh Networking**: Peer-to-peer communication using libp2p with mDNS/DHT discovery
- **📦 Decentralized Storage**: IPFS integration for content-addressed document storage
- **🔐 Local-First Encryption**: AES-256-GCM encryption with Argon2 key derivation
- **📱 PWA Support**: Works offline as a Progressive Web App
- **🗣️ Meiteilon Support**: Built for Manipur with local language considerations

## 🏗️ Architecture

```
lairik-pulse/
├── apps/
│   ├── web/          # Next.js 15+ PWA Frontend
│   └── node/         # Go Backend (libp2p, IPFS, ZKP)
├── packages/
│   ├── circuits/     # ZK Circuits (Circom/gnark)
│   ├── database/     # SQLite schemas
│   └── shared-types/ # Shared TypeScript/Go types
└── infrastructure/   # Docker Compose, configs
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Go 1.21+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/lairik-pulse.git
cd lairik-pulse

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Running with Docker

```bash
cd infrastructure
docker-compose up
```

This starts:
- IPFS node (port 5001)
- Go backend node (port 8080)
- PostgreSQL database (port 5432)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15+** (App Router)
- **Tailwind CSS** for styling
- **Zustand** for state management
- **next-pwa** for offline capabilities
- **WebSockets/gRPC-Web** for real-time communication

### Backend
- **Go 1.21+**
- **libp2p** for P2P networking
- **gnark** for ZK-SNARK circuits
- **Gin** for REST API
- **IPFS** for decentralized storage
- **SQLite** for local database

## 📖 Usage

### Document Vault

Upload documents to your local encrypted vault. Documents are:
1. Encrypted locally using AES-256-GCM
2. Optionally pinned to IPFS for redundancy
3. Indexed with searchable metadata

### Mesh Network

Join the peer-to-peer mesh to:
- Discover nearby nodes automatically
- Share documents directly with peers
- Propagate messages through the network
- Maintain connectivity without internet

### ZK Verification

Generate zero-knowledge proofs to:
- Prove document authenticity without revealing contents
- Share verification credentials with authorities
- Maintain privacy while establishing trust

## 🔐 Security

- **Encryption**: All documents are encrypted before storage
- **ZK Proofs**: Groth16 protocol for efficient verification
- **P2P Security**: Noise protocol for encrypted peer communication
- **Local-First**: No data leaves your device unless explicitly shared

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built for the people of Manipur during crisis recovery. Special thanks to:
- The libp2p and IPFS communities
- ConsenSys for gnark
- All contributors and testers

---

**Made with ❤️ for Manipur**
