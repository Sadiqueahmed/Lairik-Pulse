#!/bin/bash

# Lairik-Pulse Node Setup Script
# For Manipur Recovery Context

set -e

echo "🌿 Setting up Lairik-Pulse Node..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed. Please install Go 1.21+ first.${NC}"
    exit 1
fi

GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
echo -e "${GREEN}✓ Go version: $GO_VERSION${NC}"

# Create data directory
DATA_DIR="${DATA_DIR:-./data}"
mkdir -p "$DATA_DIR"
echo -e "${GREEN}✓ Created data directory: $DATA_DIR${NC}"

# Download Go dependencies
echo "📦 Downloading Go dependencies..."
go mod download
echo -e "${GREEN}✓ Dependencies downloaded${NC}"

# Generate swarm key for private network (if not exists)
SWARM_KEY_FILE="$DATA_DIR/swarm.key"
if [ ! -f "$SWARM_KEY_FILE" ]; then
    echo "🔑 Generating swarm key for private network..."
    cat > "$SWARM_KEY_FILE" <<EOF
/key/swarm/psk/1.0.0/
/base16/
$(openssl rand -hex 32)
EOF
    echo -e "${GREEN}✓ Generated swarm key: $SWARM_KEY_FILE${NC}"
else
    echo -e "${YELLOW}⚠ Swarm key already exists: $SWARM_KEY_FILE${NC}"
fi

# Create default config if not exists
CONFIG_FILE="$DATA_DIR/config.yaml"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "⚙️  Creating default configuration..."
    cat > "$CONFIG_FILE" <<EOF
# Lairik-Pulse Node Configuration
node:
  name: "lairik-node-$(hostname)"
  region: "manipur"
  
p2p:
  port: 0  # Random port
  bootstrap_peers: []
  
api:
  port: 8080
  cors_origins:
    - "http://localhost:3000"
    
ipfs:
  api_url: "http://localhost:5001"
  
zkp:
  circuit_dir: "./circuits"
  
nlp:
  enabled: false
  model_path: ""
EOF
    echo -e "${GREEN}✓ Created default config: $CONFIG_FILE${NC}"
else
    echo -e "${YELLOW}⚠ Config already exists: $CONFIG_FILE${NC}"
fi

# Initialize SQLite database
DB_FILE="$DATA_DIR/lairik.db"
if [ ! -f "$DB_FILE" ]; then
    echo "🗄️  Initializing SQLite database..."
    # Database will be initialized by the application on first run
    touch "$DB_FILE"
    echo -e "${GREEN}✓ Created database file: $DB_FILE${NC}"
else
    echo -e "${YELLOW}⚠ Database already exists: $DB_FILE${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "To start the node:"
echo "  go run cmd/main.go"
echo ""
echo "Or with custom config:"
echo "  DATA_DIR=./data API_PORT=8080 go run cmd/main.go"
echo ""
