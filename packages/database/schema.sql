-- Lairik-Pulse Database Schema
-- SQLite schema for local document storage

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    hash TEXT NOT NULL UNIQUE,
    cid TEXT,
    encrypted BOOLEAN DEFAULT 0,
    content BLOB,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Document metadata table
CREATE TABLE IF NOT EXISTS document_metadata (
    document_id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    tags TEXT, -- JSON array
    custom TEXT, -- JSON object
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- ZK Proofs table
CREATE TABLE IF NOT EXISTS proofs (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    proof_hash TEXT NOT NULL,
    proof_type TEXT NOT NULL,
    proof_data BLOB,
    verification_time_ms INTEGER,
    size_bytes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Peers table for mesh network
CREATE TABLE IF NOT EXISTS peers (
    id TEXT PRIMARY KEY,
    addresses TEXT, -- JSON array
    last_seen DATETIME,
    status TEXT DEFAULT 'inactive',
    trust_score REAL DEFAULT 0.0
);

-- Mesh messages table
CREATE TABLE IF NOT EXISTS mesh_messages (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    from_peer TEXT NOT NULL,
    to_peer TEXT,
    payload BLOB,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered BOOLEAN DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(hash);
CREATE INDEX IF NOT EXISTS idx_documents_cid ON documents(cid);
CREATE INDEX IF NOT EXISTS idx_proofs_document ON proofs(document_id);
CREATE INDEX IF NOT EXISTS idx_peers_status ON peers(status);
CREATE INDEX IF NOT EXISTS idx_mesh_messages_timestamp ON mesh_messages(timestamp);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_documents_timestamp 
AFTER UPDATE ON documents
BEGIN
    UPDATE documents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
