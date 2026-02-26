package types

import (
	"time"
)

type Document struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Size      int64     `json:"size"`
	Hash      string    `json:"hash"`
	CID       string    `json:"cid,omitempty"`
	Encrypted bool      `json:"encrypted"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Metadata  Metadata  `json:"metadata"`
}

type Metadata struct {
	Title       string            `json:"title,omitempty"`
	Description string            `json:"description,omitempty"`
	Tags        []string          `json:"tags,omitempty"`
	Custom      map[string]string `json:"custom,omitempty"`
}

type DocumentProof struct {
	DocumentID       string    `json:"document_id"`
	ProofHash        string    `json:"proof_hash"`
	ProofType        string    `json:"proof_type"`
	VerificationTime int64     `json:"verification_time_ms"`
	Size             int       `json:"size_bytes"`
	CreatedAt        time.Time `json:"created_at"`
}

type PeerInfo struct {
	ID        string    `json:"id"`
	Addresses []string  `json:"addresses"`
	LastSeen  time.Time `json:"last_seen"`
	Status    string    `json:"status"`
}

type MeshMessage struct {
	Type      string    `json:"type"`
	From      string    `json:"from"`
	To        string    `json:"to,omitempty"`
	Payload   []byte    `json:"payload"`
	Timestamp time.Time `json:"timestamp"`
}
