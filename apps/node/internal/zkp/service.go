package zkp

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"time"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/constraint"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
	"github.com/sirupsen/logrus"
)

// Config is the service configuration.
type Config struct {
	DataDir string
	Logger  *logrus.Logger
}

// Service holds the pre-compiled circuit and keys so they are not rebuilt per-request.
type Service struct {
	config Config
	ccs    constraint.ConstraintSystem
	pk     groth16.ProvingKey
	vk     groth16.VerifyingKey
}

// DocumentCircuit is the gnark circuit for document hash verification.
type DocumentCircuit struct {
	DocumentHash frontend.Variable
	ProofType    frontend.Variable `gnark:",public"`
}

// Define implements the gnark circuit.
func (c *DocumentCircuit) Define(api frontend.API) error {
	api.AssertIsDifferent(c.DocumentHash, 0)
	return nil
}

// ProofResult holds the output of a successful proof generation.
type ProofResult struct {
	Hash             string
	ProofBytes       []byte
	VerifyingKeyBytes []byte
	VerificationTime int64
	SizeBytes        int
}

// NewService compiles the circuit and runs the trusted setup once at startup.
func NewService(cfg Config) (*Service, error) {
	cfg.Logger.Info("ZKP: compiling circuit (one-time setup)...")
	start := time.Now()

	var circuit DocumentCircuit
	ccs, err := frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &circuit)
	if err != nil {
		return nil, fmt.Errorf("zkp: failed to compile circuit: %w", err)
	}

	pk, vk, err := groth16.Setup(ccs)
	if err != nil {
		return nil, fmt.Errorf("zkp: failed to setup keys: %w", err)
	}

	cfg.Logger.Infof("ZKP: circuit ready in %s", time.Since(start))

	return &Service{
		config: cfg,
		ccs:    ccs,
		pk:     pk,
		vk:     vk,
	}, nil
}

// GenerateProof creates a Groth16 proof for the given document bytes.
func (s *Service) GenerateProof(documentData []byte, proofType string) (*ProofResult, error) {
	start := time.Now()

	hash := sha256.Sum256(documentData)
	hashInt := new(big.Int).SetBytes(hash[:])

	proofTypeInt := 1
	if proofType == "identity" {
		proofTypeInt = 2
	}

	assignment := &DocumentCircuit{
		DocumentHash: hashInt,
		ProofType:    proofTypeInt,
	}

	witness, err := frontend.NewWitness(assignment, ecc.BN254.ScalarField())
	if err != nil {
		return nil, fmt.Errorf("zkp: failed to create witness: %w", err)
	}

	proof, err := groth16.Prove(s.ccs, s.pk, witness)
	if err != nil {
		return nil, fmt.Errorf("zkp: failed to generate proof: %w", err)
	}

	// Serialize proof to bytes for storage
	var proofBuf bytes.Buffer
	if _, err := proof.WriteTo(&proofBuf); err != nil {
		return nil, fmt.Errorf("zkp: failed to serialize proof: %w", err)
	}

	// Serialize verifying key to bytes for storage
	var vkBuf bytes.Buffer
	if _, err := s.vk.WriteTo(&vkBuf); err != nil {
		return nil, fmt.Errorf("zkp: failed to serialize verifying key: %w", err)
	}

	proofBytes := proofBuf.Bytes()

	return &ProofResult{
		Hash:              hex.EncodeToString(hash[:]),
		ProofBytes:        proofBytes,
		VerifyingKeyBytes: vkBuf.Bytes(),
		VerificationTime:  time.Since(start).Milliseconds(),
		SizeBytes:         len(proofBytes),
	}, nil
}

// VerifyProofFromBytes deserializes and verifies a stored proof.
func (s *Service) VerifyProofFromBytes(proofData []byte, vkData []byte) (bool, error) {
	proof := groth16.NewProof(ecc.BN254)
	if _, err := proof.ReadFrom(bytes.NewReader(proofData)); err != nil {
		return false, fmt.Errorf("zkp: failed to deserialize proof: %w", err)
	}

	vk := groth16.NewVerifyingKey(ecc.BN254)
	if _, err := vk.ReadFrom(bytes.NewReader(vkData)); err != nil {
		return false, fmt.Errorf("zkp: failed to deserialize verifying key: %w", err)
	}

	// Build public witness (ProofType = 1 as public input)
	pubAssignment := &DocumentCircuit{
		DocumentHash: 0, // private — not needed for verification
		ProofType:    1,
	}
	pubWitness, err := frontend.NewWitness(pubAssignment, ecc.BN254.ScalarField(), frontend.PublicOnly())
	if err != nil {
		return false, fmt.Errorf("zkp: failed to create public witness: %w", err)
	}

	if err := groth16.Verify(proof, vk, pubWitness); err != nil {
		return false, nil // invalid proof, not an error
	}
	return true, nil
}

