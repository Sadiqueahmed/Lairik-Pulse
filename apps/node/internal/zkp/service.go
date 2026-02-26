package zkp

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"time"

	"github.com/consensys/gnark/backend"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
	"github.com/sirupsen/logrus"
)

type Config struct {
	DataDir string
	Logger  *logrus.Logger
}

type Service struct {
	config Config
}

type DocumentCircuit struct {
	DocumentHash frontend.Variable
	ProofType    frontend.Variable `gnark:",public"`
}

func (c *DocumentCircuit) Define(api frontend.API) error {
	// Verify document hash is non-zero (simplified verification)
	api.AssertIsDifferent(c.DocumentHash, 0)
	return nil
}

type ProofResult struct {
	Hash             string
	Proof            groth16.Proof
	ProofBytes       []byte
	VerifyingKey     groth16.VerifyingKey
	VerificationTime int64
	Size             int
}

func NewService(cfg Config) (*Service, error) {
	return &Service{
		config: cfg,
	}, nil
}

func (s *Service) GenerateProof(documentData []byte, proofType string) (*ProofResult, error) {
	start := time.Now()

	// Create document hash
	hash := sha256.Sum256(documentData)
	hashInt := new(big.Int).SetBytes(hash[:])

	// Build circuit
	var circuit DocumentCircuit
	ccs, err := frontend.Compile(r1cs.NewBuilder, &circuit)
	if err != nil {
		return nil, fmt.Errorf("failed to compile circuit: %w", err)
	}

	// Setup proving and verifying keys
	pk, vk, err := groth16.Setup(ccs)
	if err != nil {
		return nil, fmt.Errorf("failed to setup keys: %w", err)
	}

	// Create witness
	assignment := &DocumentCircuit{
		DocumentHash: hashInt,
		ProofType:    1, // Simplified: 1 for degree, 2 for identity
	}

	witness, err := frontend.NewWitness(assignment, backend.GROTH16)
	if err != nil {
		return nil, fmt.Errorf("failed to create witness: %w", err)
	}

	// Generate proof
	proof, err := groth16.Prove(ccs, pk, witness)
	if err != nil {
		return nil, fmt.Errorf("failed to generate proof: %w", err)
	}

	// Serialize proof for size calculation
	proofBytes := make([]byte, 0)
	// Note: In production, use proper serialization
	// This is a simplified version for demonstration

	verificationTime := time.Since(start).Milliseconds()

	return &ProofResult{
		Hash:             hex.EncodeToString(hash[:]),
		Proof:            proof,
		ProofBytes:       proofBytes,
		VerifyingKey:     vk,
		VerificationTime: verificationTime,
		Size:             192, // Typical Groth16 proof size
	}, nil
}

func (s *Service) VerifyProof(proof groth16.Proof, vk groth16.VerifyingKey, publicInputs []byte) (bool, error) {
	// Verify the proof
	err := groth16.Verify(proof, vk, publicInputs)
	if err != nil {
		return false, fmt.Errorf("proof verification failed: %w", err)
	}
	return true, nil
}
