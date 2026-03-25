package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
)

// DB wraps the SQLite connection and provides repository methods.
type DB struct {
	conn   *sql.DB
	logger *logrus.Logger
}

// Open creates (or opens) the SQLite database at dataDir/lairik.db and runs migrations.
func Open(dataDir string, logger *logrus.Logger) (*DB, error) {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data dir: %w", err)
	}

	dbPath := filepath.Join(dataDir, "lairik.db")
	conn, err := sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite: %w", err)
	}

	db := &DB{conn: conn, logger: logger}
	if err := db.migrate(); err != nil {
		conn.Close()
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	logger.Infof("SQLite database opened at %s", dbPath)
	return db, nil
}

// Close closes the underlying database connection.
func (db *DB) Close() error {
	return db.conn.Close()
}

// migrate applies the embedded schema.
func (db *DB) migrate() error {
	schema := `
CREATE TABLE IF NOT EXISTS documents (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	type TEXT NOT NULL,
	size INTEGER NOT NULL,
	hash TEXT NOT NULL UNIQUE,
	cid TEXT,
	encrypted INTEGER DEFAULT 0,
	content BLOB,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_metadata (
	document_id TEXT PRIMARY KEY,
	title TEXT,
	description TEXT,
	tags TEXT,
	custom TEXT,
	FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS proofs (
	id TEXT PRIMARY KEY,
	document_id TEXT NOT NULL,
	proof_hash TEXT NOT NULL,
	proof_type TEXT NOT NULL,
	proof_data BLOB,
	verifying_key BLOB,
	verification_time_ms INTEGER,
	size_bytes INTEGER,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS peers (
	id TEXT PRIMARY KEY,
	addresses TEXT,
	last_seen DATETIME,
	status TEXT DEFAULT 'inactive',
	trust_score REAL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS mesh_messages (
	id TEXT PRIMARY KEY,
	type TEXT NOT NULL,
	from_peer TEXT NOT NULL,
	to_peer TEXT,
	payload BLOB,
	timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
	delivered INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(hash);
CREATE INDEX IF NOT EXISTS idx_documents_cid ON documents(cid);
CREATE INDEX IF NOT EXISTS idx_proofs_document ON proofs(document_id);
CREATE INDEX IF NOT EXISTS idx_peers_status ON peers(status);

CREATE TRIGGER IF NOT EXISTS update_documents_timestamp
AFTER UPDATE ON documents
BEGIN
	UPDATE documents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
`
	_, err := db.conn.Exec(schema)
	return err
}

// ─── Document Repository ───────────────────────────────────────────────────

// DocumentRecord mirrors the documents table row.
type DocumentRecord struct {
	ID        string
	Name      string
	Type      string
	Size      int64
	Hash      string
	CID       string
	Encrypted bool
	Content   []byte
	CreatedAt time.Time
	UpdatedAt time.Time
}

// AddDocument inserts a document into the database.
func (db *DB) AddDocument(doc DocumentRecord) error {
	_, err := db.conn.Exec(`
		INSERT INTO documents (id, name, type, size, hash, cid, encrypted, content, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		doc.ID, doc.Name, doc.Type, doc.Size, doc.Hash,
		doc.CID, boolToInt(doc.Encrypted), doc.Content,
		doc.CreatedAt, doc.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("AddDocument: %w", err)
	}
	return nil
}

// GetDocument retrieves a document by ID including its content.
func (db *DB) GetDocument(id string) (*DocumentRecord, error) {
	row := db.conn.QueryRow(`
		SELECT id, name, type, size, hash, COALESCE(cid,''), encrypted, content, created_at, updated_at
		FROM documents WHERE id = ?`, id)
	return scanDocument(row)
}

// ListDocuments returns all document records (without content blobs).
func (db *DB) ListDocuments() ([]DocumentRecord, error) {
	rows, err := db.conn.Query(`
		SELECT id, name, type, size, hash, COALESCE(cid,''), encrypted, NULL, created_at, updated_at
		FROM documents ORDER BY created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("ListDocuments: %w", err)
	}
	defer rows.Close()

	var docs []DocumentRecord
	for rows.Next() {
		doc, err := scanDocument(rows)
		if err != nil {
			return nil, err
		}
		docs = append(docs, *doc)
	}
	return docs, rows.Err()
}

// DeleteDocument removes a document by ID.
func (db *DB) DeleteDocument(id string) error {
	_, err := db.conn.Exec(`DELETE FROM documents WHERE id = ?`, id)
	return err
}

// UpdateDocumentCID sets the IPFS CID on a document.
func (db *DB) UpdateDocumentCID(id, cid string) error {
	_, err := db.conn.Exec(`UPDATE documents SET cid = ? WHERE id = ?`, cid, id)
	return err
}

// ─── Proof Repository ─────────────────────────────────────────────────────

// ProofRecord mirrors the proofs table row.
type ProofRecord struct {
	ID               string
	DocumentID       string
	ProofHash        string
	ProofType        string
	ProofData        []byte
	VerifyingKey     []byte
	VerificationTime int64
	SizeBytes        int
	CreatedAt        time.Time
}

// SaveProof inserts a generated proof.
func (db *DB) SaveProof(p ProofRecord) error {
	_, err := db.conn.Exec(`
		INSERT INTO proofs (id, document_id, proof_hash, proof_type, proof_data, verifying_key, verification_time_ms, size_bytes, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		p.ID, p.DocumentID, p.ProofHash, p.ProofType,
		p.ProofData, p.VerifyingKey, p.VerificationTime, p.SizeBytes, p.CreatedAt,
	)
	return err
}

// GetProofByHash retrieves a proof record by its hash.
func (db *DB) GetProofByHash(hash string) (*ProofRecord, error) {
	row := db.conn.QueryRow(`
		SELECT id, document_id, proof_hash, proof_type, proof_data, verifying_key, verification_time_ms, size_bytes, created_at
		FROM proofs WHERE proof_hash = ?`, hash)

	p := &ProofRecord{}
	err := row.Scan(&p.ID, &p.DocumentID, &p.ProofHash, &p.ProofType,
		&p.ProofData, &p.VerifyingKey, &p.VerificationTime, &p.SizeBytes, &p.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("GetProofByHash: %w", err)
	}
	return p, nil
}

// ListProofsByDocument returns all proofs for a given document.
func (db *DB) ListProofsByDocument(docID string) ([]ProofRecord, error) {
	rows, err := db.conn.Query(`
		SELECT id, document_id, proof_hash, proof_type, proof_data, verifying_key, verification_time_ms, size_bytes, created_at
		FROM proofs WHERE document_id = ? ORDER BY created_at DESC`, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var proofs []ProofRecord
	for rows.Next() {
		var p ProofRecord
		if err := rows.Scan(&p.ID, &p.DocumentID, &p.ProofHash, &p.ProofType,
			&p.ProofData, &p.VerifyingKey, &p.VerificationTime, &p.SizeBytes, &p.CreatedAt); err != nil {
			return nil, err
		}
		proofs = append(proofs, p)
	}
	return proofs, rows.Err()
}

// ─── Peer Repository ─────────────────────────────────────────────────────

// SavePeer upserts a peer record.
func (db *DB) SavePeer(id, addressesJSON string) error {
	_, err := db.conn.Exec(`
		INSERT INTO peers (id, addresses, last_seen, status)
		VALUES (?, ?, ?, 'active')
		ON CONFLICT(id) DO UPDATE SET addresses = excluded.addresses, last_seen = excluded.last_seen, status = 'active'`,
		id, addressesJSON, time.Now(),
	)
	return err
}

// UpdatePeerStatus updates a peer's status.
func (db *DB) UpdatePeerStatus(id, status string) error {
	_, err := db.conn.Exec(`UPDATE peers SET status = ?, last_seen = ? WHERE id = ?`, status, time.Now(), id)
	return err
}

// ─── Helpers ──────────────────────────────────────────────────────────────

type scanner interface {
	Scan(dest ...any) error
}

func scanDocument(s scanner) (*DocumentRecord, error) {
	doc := &DocumentRecord{}
	var enc int
	err := s.Scan(&doc.ID, &doc.Name, &doc.Type, &doc.Size, &doc.Hash,
		&doc.CID, &enc, &doc.Content, &doc.CreatedAt, &doc.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("scanDocument: %w", err)
	}
	doc.Encrypted = enc != 0
	return doc, nil
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
