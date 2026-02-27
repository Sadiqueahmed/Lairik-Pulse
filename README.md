# Lairik-Pulse

**Offline-Mesh Verification & Recovery for Manipur**

A privacy-preserving, offline-first document verification system using Zero-Knowledge Proofs, P2P mesh networking, and IPFS storage. Designed for disaster recovery scenarios where internet connectivity is unreliable or unavailable.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Go 1.21+ (for backend)
- Docker & Docker Compose (optional, for infrastructure)

### Option 1: Full Development Stack (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure (IPFS, PostgreSQL)
cd infrastructure && docker-compose up -d

# 3. In a new terminal, start the Go backend
cd apps/node
./scripts/setup.sh        # First time setup
go run cmd/main.go        # Start the node

# 4. In another terminal, start the Next.js frontend
npm run dev               # Starts at http://localhost:3000
```

### Option 2: Frontend Only (Mock Mode)

```bash
# Install and start just the web app
npm install
npm run dev

# Frontend will run with mock data (no backend required)
# Access at http://localhost:3000
```

### Option 3: Docker Everything

```bash
# Build and run all services
cd infrastructure
docker-compose up --build

# Access frontend at http://localhost:3000
# API at http://localhost:8080
```

## 📁 Project Structure

```
lairik-pulse/
├── apps/
│   ├── web/              # Next.js 15 PWA (Frontend)
│   └── node/             # Go backend (P2P, ZKP, IPFS)
├── packages/
│   ├── circuits/         # ZK-SNARK circuits (gnark)
│   ├── database/         # SQLite schemas
│   └── shared-types/     # TypeScript/Go type definitions
├── infrastructure/       # Docker Compose, mesh configs
└── .github/workflows/    # CI/CD
```

## 🔧 Development Commands

```bash
# Root level (Turborepo)
npm run dev          # Start all apps in dev mode
npm run build        # Build all apps
npm run lint         # Lint all apps

# Frontend only
cd apps/web
npm run dev          # Next.js dev server
npm run build        # Production build

# Backend only
cd apps/node
go run cmd/main.go   # Run Go node
go test ./...        # Run tests
```

## 🌐 Architecture

### Frontend (Next.js 15 PWA)
- **Offline-first**: Service worker with next-pwa
- **State**: Zustand for local-first state management
- **UI**: Tailwind CSS with custom Lairik theme
- **Tabs**: Vault (documents), Mesh (P2P status), Verify (ZKP)

### Backend (Go)
- **P2P**: libp2p with mDNS discovery for local mesh
- **ZKP**: gnark with Groth16 for privacy-preserving verification
- **Storage**: IPFS for content-addressed document storage
- **API**: Gin REST API for frontend communication
- **NLP**: Meiteilon language support (llama.cpp)

### Infrastructure
- **IPFS Kubo**: Content-addressed storage
- **PostgreSQL**: Metadata indexing
- **Docker**: Containerized deployment

## 🔐 Security Features

- **Zero-Knowledge Proofs**: Verify documents without revealing contents
- **Local Encryption**: Argon2 + AES-GCM for document vault
- **P2P Mesh**: Direct device-to-device communication (no ISP required)
- **Private Network**: Swarm key protection for mesh isolation

## 📱 PWA Features

- Works offline after first load
- Installable on mobile/desktop
- Background sync when connectivity returns
- Local document vault with encryption

## 🆘 For Manipur Recovery

This system is specifically designed for:
- **Offline camps**: No internet required for verification
- **Privacy**: ZK proofs protect sensitive documents
- **Resilience**: Distributed mesh survives infrastructure damage
- **Local language**: Meiteilon (Manipuri) NLP support

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Contact: lairik-pulse@example.com

---

**Built with ❤️ for Manipur's recovery**
