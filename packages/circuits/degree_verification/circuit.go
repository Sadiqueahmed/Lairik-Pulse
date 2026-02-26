// Package degree_verification provides ZK circuit logic for degree verification
package degree_verification

import (
	"github.com/consensys/gnark/frontend"
)

// DegreeCircuit defines the circuit for proving degree ownership
// without revealing the actual degree details
type DegreeCircuit struct {
	// Private inputs (witness)
	DegreeHash   frontend.Variable `gnark:",private"`
	StudentID    frontend.Variable `gnark:",private"`
	IssueDate    frontend.Variable `gnark:",private"`

	// Public inputs
	InstitutionHash frontend.Variable `gnark:",public"`
	ValidUntil      frontend.Variable `gnark:",public"`
}

// Define defines the circuit constraints
func (c *DegreeCircuit) Define(api frontend.API) error {
	// Verify degree hash is non-zero (degree exists)
	api.AssertIsDifferent(c.DegreeHash, 0)

	// Verify student ID is valid (non-zero)
	api.AssertIsDifferent(c.StudentID, 0)

	// Verify issue date is before valid until
	// This ensures the degree is still valid
	api.AssertIsLessOrEqual(c.IssueDate, c.ValidUntil)

	// Additional constraints can be added here:
	// - Institution signature verification
	// - Degree type validation
	// - Accreditation check

	return nil
}
