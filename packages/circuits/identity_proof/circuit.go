// Package identity_proof provides ZK circuit logic for identity verification
package identity_proof

import (
	"github.com/consensys/gnark/frontend"
)

// IdentityCircuit defines the circuit for proving identity
// without revealing personal details
type IdentityCircuit struct {
	// Private inputs (witness)
	IdentityHash frontend.Variable `gnark:",private"`
	Secret       frontend.Variable `gnark:",private"`
	BiometricHash frontend.Variable `gnark:",private"`

	// Public inputs
	AuthorityHash frontend.Variable `gnark:",public"`
	IssueDate     frontend.Variable `gnark:",public"`
	RegionCode    frontend.Variable `gnark:",public"` // For Manipur region verification
}

// Define defines the circuit constraints
func (c *IdentityCircuit) Define(api frontend.API) error {
	// Verify identity hash is non-zero
	api.AssertIsDifferent(c.IdentityHash, 0)

	// Verify secret is valid (non-zero)
	api.AssertIsDifferent(c.Secret, 0)

	// Verify authority hash is non-zero (valid issuing authority)
	api.AssertIsDifferent(c.AuthorityHash, 0)

	// Verify region code is valid for Manipur (example: 14)
	// This ensures the ID was issued in the correct region
	manipurCode := api.Constant(14)
	api.AssertIsEqual(c.RegionCode, manipurCode)

	// Additional constraints can be added:
	// - Age verification (birthdate check)
	// - Document type validation
	// - Authority signature verification

	return nil
}
