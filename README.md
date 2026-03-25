<div align="center">

# 🌿 Lairik-Pulse 
## ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ

**Offline-First Recovery Platform for Manipur**  
*Secure document verification using Zero-Knowledge Proofs and peer-to-peer mesh networking*

[![Vercel](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)](https://lairik-pulse.vercel.app)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

### 🖥️ Live Application Preview

<a href="https://lairik-pulse.vercel.app/">
  <img src="https://api.microlink.io?url=https%3A%2F%2Flairik-pulse.vercel.app&screenshot=true&meta=false&embed=screenshot.url" alt="Lairik Pulse Live Preview" width="100%" />
</a>

> [!IMPORTANT]
> **[Click here to open the Interactive Live Demo](https://lairik-pulse.vercel.app/)**

---

## 📖 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Team](#-team)

---

## 🎯 Problem Statement

### The Challenge in Manipur

Manipur, a state in Northeast India, faces unique challenges:

- **Internet Blackouts**: Frequent internet shutdowns during conflicts leave citizens unable to access critical documents
- **Document Verification**: Students and job seekers cannot verify credentials when online services are unavailable
- **Identity Crisis**: Displaced persons lose access to identity proofs during emergencies
- **Privacy Concerns**: Traditional verification exposes sensitive personal information
- **Infrastructure Dependency**: Centralized systems fail when connectivity is disrupted

**Real Impact:**
- Students unable to submit exam applications
- Job seekers missing opportunities due to unverifiable credentials
- Families unable to prove identity for relief services
- Critical documents trapped in inaccessible cloud storage

---

## 💡 Solution Overview

**Lairik-Pulse** (ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ) is a **decentralized, offline-first document verification platform** designed specifically for crisis scenarios.

### Core Philosophy

> *"Verification without Internet, Privacy without Compromise"*

### Key Innovations

1. **Zero-Knowledge Proofs (ZKP)**: Prove document authenticity without revealing content
2. **Mesh Networking**: Peer-to-peer connectivity without internet infrastructure  
3. **Offline-First Design**: Full functionality without connectivity
4. **Cultural Integration**: Native Meitei Mayek (ꯃꯩꯇꯩꯏ ꯃꯌꯦꯛ) language support
5. **Privacy-Preserving**: Cryptographic verification without data exposure

---

## ⚙️ How It Works

### System Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Uploads   │────▶│  Document Vault  │────▶│  ZKP Generation │
│    Document     │     │  (Encrypted)     │     │  (Proof Created)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                              ┌───────────────────────────┘
                              ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Peer Discovery │◀────│   Mesh Network   │◀────│  Proof Sharing  │
│   (mDNS/DHT)    │     │  (libp2p/Gossip) │     │  (Offline P2P)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌──────────────────┐
│  Verification   │────▶│  ZKP Validation  │
│   Request       │     │  (Groth16/gnark) │
└─────────────────┘     └──────────────────┘
```

### Step-by-Step Process

#### 1. Document Upload & Encryption
```typescript
// User uploads document to vault
const document = await vault.upload(file, {
  encryption: 'AES-256-GCM',
  metadata: {
    type: 'academic_certificate',
    issuer: 'Manipur University',
    date: '2024-01-15'
  }
});
```

#### 2. Zero-Knowledge Proof Generation
```go
// Generate ZK proof without revealing document content
proof, err := zkp.GenerateProof(document, ProveAcademicEligibility{
    MinGPA: 3.5,
    Institution: "Manipur University",
    YearRange: [2020, 2024]
})
```

#### 3. Mesh Network Discovery
```go
// Discover peers in local network
peers, err := p2p.DiscoverPeers(ctx, DiscoveryConfig{
    Protocol: "mDNS",  // Local network discovery
    Fallback: "DHT",   // Distributed hash table
    Timeout: 30 * time.Second
})
```

#### 4. Offline Verification
```typescript
// Verify without internet or revealing document
const isValid = await zkp.verifyProof(proof, {
    publicInputs: {
        requiredGPA: 3.5,
        institutionHash: hash("Manipur University")
    }
});
// Returns: true/false (no document content exposed)
```

---

## 🏗️ Architecture

### Monorepo Structure

```
lairik-pulse/
│
├── apps/
│   ├── web/                    # Next.js 14 Frontend
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   │   ├── vault/      # Document vault UI
│   │   │   │   ├── mesh/       # Mesh network visualizer
│   │   │   │   ├── verify/     # ZKP verification UI
│   │   │   │   └── profile/    # User profile management
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   │   ├── useP2P.ts   # P2P connectivity
│   │   │   │   ├── useZKP.ts   # ZKP operations
│   │   │   │   └── useProfile.ts # Profile management
│   │   │   └── app/            # Next.js app router
│   │   ├── public/
│   │   │   └── sw.js           # Service Worker (PWA)
│   │   └── package.json
│   │
│   └── node/                   # Go Backend
│       ├── cmd/
│       │   └── main.go         # Entry point
│       ├── internal/
│       │   ├── p2p/            # libp2p mesh networking
│       │   ├── zkp/            # gnark ZK-SNARK circuits
│       │   ├── ipfs/           # IPFS integration
│       │   ├── nlp/            # Meiteilon LLM service
│       │   └── api/            # REST/gRPC API
│       ├── pkg/
│       │   ├── crypto/         # Encryption utilities
│       │   └── types/          # Go type definitions
│       └── go.mod
│
├── packages/
│   ├── circuits/               # Shared ZK circuits
│   │   ├── degree_verification/
│   │   └── identity_proof/
│   ├── database/               # SQLite schemas
│   └── shared-types/           # TypeScript/Go shared types
│
└── infrastructure/
    ├── docker-compose.yml      # Local development stack
    └── mesh-config/            # Bootstrap configurations
```

---

## 🛠️ Tech Stack

### Frontend (apps/web)

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework | 14.2.21 |
| **TypeScript** | Type safety | 5.4+ |
| **Tailwind CSS** | Styling | 3.4+ |
| **Zustand** | State management | 4.5+ |
| **Clerk** | Authentication | 5.0+ |
| **next-pwa** | Offline capabilities | 5.6+ |
| **localforage** | Local storage | 1.10+ |

### Backend (apps/node)

| Technology | Purpose | Version |
|------------|---------|---------|
| **Go** | Backend language | 1.21+ |
| **libp2p** | P2P networking | Latest |
| **gnark** | ZK-SNARK circuits | Latest |
| **Gin** | HTTP framework | Latest |
| **IPFS/Kubo** | Decentralized storage | Latest |
| **SQLite** | Local database | Latest |

### Cryptography & Security

- **Zero-Knowledge Proofs**: Groth16 proving system via gnark
- **Encryption**: AES-256-GCM for documents
- **Hashing**: SHA-256 for integrity checks
- **Digital Identity**: Decentralized Identifiers (DIDs)

---

## ✨ Features

### 🔐 Document Vault
- **Encrypted Storage**: AES-256-GCM encryption at rest
- **Offline Access**: Documents available without internet
- **Version Control**: Track document history
- **Secure Sharing**: Granular permission controls

### 🌐 Mesh Network
- **Peer Discovery**: Automatic local network discovery via mDNS
- **Offline Sync**: Synchronize with peers without internet
- **Resilient Routing**: Multi-hop message relay
- **Bandwidth Efficient**: GossipSub protocol for minimal overhead

### ✓ ZKP Verification
- **Privacy-Preserving**: Verify without revealing document content
- **Instant Verification**: Sub-second proof validation
- **Multiple Proof Types**:
  - Academic eligibility
  - Identity verification
  - Age verification
  - Income thresholds

### 👤 User Profiles
- **DID-Based Identity**: Self-sovereign identity
- **Reputation System**: Trust scores from peer interactions
- **Multi-Language**: Meitei Mayek + English support
- **Offline Profiles**: Accessible without connectivity

### 🎨 Cultural Integration
- **Bilingual Interface**: Meitei Mayek primary, English secondary
- **Traditional Colors**: Manipur-inspired color palette
- **Cultural Patterns**: Traditional textile motifs in UI

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- Go 1.21+
- Docker (optional, for local IPFS)

### Quick Start

```bash
# Clone repository
git clone https://github.com/sadique-ahmed/lairik-pulse.git
cd lairik-pulse

# Install dependencies
npm install

# Start development servers
npm run dev

# Or start individually
cd apps/web && npm run dev      # Frontend: http://localhost:3000
cd apps/node && go run cmd/main.go  # Backend: http://localhost:8080
```

### Docker Deployment

```bash
# Start full stack with Docker Compose
docker-compose up -d

# Services:
# - Frontend: http://localhost:3000
# - Go Backend: http://localhost:8080
# - IPFS Node: http://localhost:5001
```

---

## 📖 Usage

### For Users

1. **Sign Up**: Create account with Google or email
2. **Upload Documents**: Add documents to encrypted vault
3. **Generate Proofs**: Create ZK proofs for verification
4. **Connect to Mesh**: Join local peer network
5. **Verify Others**: Validate peer credentials offline

### For Developers

```typescript
// Initialize P2P connection
const { peers, isConnected } = useP2P({
  autoDiscover: true,
  relayEnabled: true
});

// Upload and encrypt document
const { upload, documents } = useVault({
  encryption: true,
  localBackup: true
});

// Generate ZK proof
const { generateProof, verify } = useZKP({
  circuit: 'degree_verification',
  provingSystem: 'groth16'
});
```

---

## 📚 API Documentation

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/p2p/status` | GET | Mesh network status |
| `/api/p2p/peers` | GET | List discovered peers |
| `/api/vault/upload` | POST | Upload encrypted document |
| `/api/vault/documents` | GET | List user documents |
| `/api/zkp/generate` | POST | Generate ZK proof |
| `/api/zkp/verify` | POST | Verify ZK proof |

### WebSocket Events

```typescript
// Real-time peer updates
ws.on('peer:joined', (peer) => {
  console.log(`Peer ${peer.name} joined the mesh`);
});

// Document sharing events
ws.on('document:shared', ({ document, from }) => {
  console.log(`Received document ${document.name} from ${from}`);
});
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/lairik-pulse.git

# Create branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## 👥 Team

**Sadique Ahmed** - Project Lead & Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-@sadique--ahmed-181717?style=flat&logo=github)](https://github.com/sadique-ahmed)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Sadique%20Ahmed-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/sadique-ahmed)

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Manipur Community** for inspiration and cultural guidance
- **libp2p Team** for peer-to-peer networking infrastructure
- **ConsenSys/gnark** for zero-knowledge proof libraries
- **Clerk** for authentication infrastructure

---

## 📞 Contact

For questions or support:

- 📧 Email: [sadiqueahmed40@gmail.com](mailto:sadiqueahmed40@gmail.com)
- 🌐 Portfolio: [https://sadique-ahmed.netlify.app/](https://sadique-ahmed.netlify.app/)
- 💬 Discord: [Join our community]

---

<p align="center">
  <strong>ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ</strong> - Empowering Manipur through decentralized technology
</p>

<p align="center">
  Made with ❤️ for Manipur
</p>
