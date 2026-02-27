# Lairik-Pulse

**Lairik-Pulse** (ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ) - Offline-Mesh Verification & Recovery for Manipur

A privacy-preserving, offline-first document verification system designed for disaster recovery scenarios in Manipur. Built with Zero-Knowledge Proofs, P2P mesh networking, and IPFS storage.

## 🌟 Features

- **🔐 Zero-Knowledge Verification**: Prove document authenticity without revealing contents
- **📡 Offline-First P2P Mesh**: libp2p-based mesh networking for connectivity without internet
- **🗄️ Decentralized Storage**: IPFS for distributed, resilient document storage
- **🤖 Local AI**: Meiteilon language support with on-device LLM processing
- **🔒 End-to-End Encryption**: All documents encrypted before storage
- **📱 PWA Support**: Works as a Progressive Web App on mobile devices

## 🏗️ Architecture

```
lairik-pulse/
├── apps/
│   ├── web/                    # Next.js 15+ PWA Frontend
│   └── node/                   # Go Backend (libp2p, IPFS, ZKP)
├── packages/
│   ├── circuits/               # ZK-SNARK circuits (gnark)
│   ├── database/               # SQLite schemas
│   └── shared-types/           # Shared TypeScript/Go types
└── infrastructure/             # Docker Compose & configs
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Go 1.21+
- Docker & Docker Compose

### Frontend (Web)

```bash
cd apps/web
npm install
npm run dev
```

### Backend (Node)

```bash
cd apps/node
go mod tidy
go run cmd/main.go
```

### Full Stack (Docker)

```bash
docker-compose -f infrastructure/docker-compose.yml up
```

## 🎨 Manipur-Inspired Design

The UI features traditional Manipur colors:
- **Forest Green** (`#0f4c3a`): Representing the lush hills
- **Traditional Gold** (`#d4af37`): Symbolizing cultural heritage
- **Textile Red** (`#c41e3a`): From traditional Manipuri fabrics

Meetei Mayek script support: **ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ**

## 🔧 Tech Stack

### Frontend
- Next.js 15+ (App Router)
- Tailwind CSS
- Zustand (State Management)
- next-pwa (PWA support)

### Backend
- Go 1.21
- libp2p (P2P networking)
- Kubo/IPFS (Decentralized storage)
- gnark (Zero-Knowledge proofs)
- Gin (REST API)

### Infrastructure
- Docker & Docker Compose
- SQLite (local database)
- OrbitDB (decentralized database)

## 📖 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [ZKP Circuits](./docs/zkp.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Manipur community for inspiration and requirements
- libp2p team for excellent P2P networking tools
- ConsenSys/gnark for ZK-SNARK implementation
- IPFS community for decentralized storage

---

**Built with ❤️ for Manipur's resilience**
