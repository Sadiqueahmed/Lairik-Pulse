// Package nlp provides natural language processing for Meiteilon (Manipuri)
package nlp

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"
)

// Service handles NLP operations for document processing
type Service struct {
	enabled bool
	model   string
}

// NewService creates a new NLP service
func NewService() *Service {
	return &Service{
		enabled: false, // Disabled by default until model is loaded
		model:   "llama-3-meiteilon",
	}
}

// TranslationRequest represents a translation request
type TranslationRequest struct {
	Text       string `json:"text"`
	FromLang   string `json:"from_lang"`
	ToLang     string `json:"to_lang"`
	DocumentID string `json:"document_id,omitempty"`
}

// TranslationResponse represents a translation response
type TranslationResponse struct {
	OriginalText     string  `json:"original_text"`
	TranslatedText   string  `json:"translated_text"`
	Confidence       float64 `json:"confidence"`
	ProcessingTimeMs int64   `json:"processing_time_ms"`
}

// SummarizeRequest represents a document summarization request
type SummarizeRequest struct {
	Content  string `json:"content"`
	MaxWords int    `json:"max_words"`
	Language string `json:"language"`
}

// SummarizeResponse represents a summarization response
type SummarizeResponse struct {
	Summary          string  `json:"summary"`
	OriginalLength   int     `json:"original_length"`
	SummaryLength    int     `json:"summary_length"`
	Confidence       float64 `json:"confidence"`
	ProcessingTimeMs int64   `json:"processing_time_ms"`
}

// Translate performs language translation
// Currently returns mock translations for development
func (s *Service) Translate(ctx context.Context, req TranslationRequest) (*TranslationResponse, error) {
	start := time.Now()

	if !s.enabled {
		log.Println("Warning: NLP service not enabled, returning mock translation")
	}

	// Mock translation for development
	// In production, this would use llama.cpp or similar
	var translated string
	var confidence float64

	switch {
	case req.FromLang == "meiteilon" && req.ToLang == "english":
		translated = s.mockMeiteilonToEnglish(req.Text)
		confidence = 0.85
	case req.FromLang == "english" && req.ToLang == "meiteilon":
		translated = s.mockEnglishToMeiteilon(req.Text)
		confidence = 0.82
	default:
		translated = req.Text // Passthrough for unsupported pairs
		confidence = 1.0
	}

	return &TranslationResponse{
		OriginalText:     req.Text,
		TranslatedText:   translated,
		Confidence:       confidence,
		ProcessingTimeMs: time.Since(start).Milliseconds(),
	}, nil
}

// Summarize generates a document summary
func (s *Service) Summarize(ctx context.Context, req SummarizeRequest) (*SummarizeResponse, error) {
	start := time.Now()

	if !s.enabled {
		log.Println("Warning: NLP service not enabled, returning mock summary")
	}

	// Mock summarization
	words := strings.Fields(req.Content)
	originalLength := len(words)

	// Simple extractive summary (first N words)
	summaryWords := req.MaxWords
	if summaryWords > originalLength {
		summaryWords = originalLength
	}

	summary := strings.Join(words[:summaryWords], " ")
	if originalLength > summaryWords {
		summary += "..."
	}

	return &SummarizeResponse{
		Summary:          summary,
		OriginalLength:   originalLength,
		SummaryLength:    summaryWords,
		Confidence:       0.75,
		ProcessingTimeMs: time.Since(start).Milliseconds(),
	}, nil
}

// Enable enables the NLP service with a loaded model
func (s *Service) Enable(modelPath string) error {
	// In production, this would load the LLM model
	s.enabled = true
	s.model = modelPath
	log.Printf("NLP service enabled with model: %s", modelPath)
	return nil
}

// IsEnabled returns whether the service is enabled
func (s *Service) IsEnabled() bool {
	return s.enabled
}

// Mock translation functions for development
func (s *Service) mockMeiteilonToEnglish(text string) string {
	// Common Meiteilon phrases and their English translations
	translations := map[string]string{
		"ꯀꯩꯅꯣ":         "Hello",
		"ꯊꯥꯒꯠꯆꯔꯤ":     "Thank you",
		"ꯏꯟꯗꯤꯔꯤꯇꯤ":    "Identity card",
		"ꯗꯤꯒ꯭ꯔꯤ":      "Degree",
		"ꯁꯔꯠꯤꯐꯤꯀꯦꯠ":  "Certificate",
		"ꯃꯅꯤꯄꯨꯔ":      "Manipur",
	}

	if translated, ok := translations[text]; ok {
		return translated
	}

	// Return placeholder for unknown text
	return fmt.Sprintf("[Translation: %s]", text)
}

func (s *Service) mockEnglishToMeiteilon(text string) string {
	// Reverse mapping
	translations := map[string]string{
		"Hello":        "ꯀꯩꯅꯣ",
		"Thank you":    "ꯊꯥꯒꯠꯆꯔꯤ",
		"Identity":     "ꯏꯟꯗꯤꯔꯤꯇꯤ",
		"Degree":       "ꯗꯤꯒ꯭ꯔꯤ",
		"Certificate":  "ꯁꯔꯠꯤꯐꯤꯀꯦꯠ",
		"Manipur":      "ꯃꯅꯤꯄꯨꯔ",
	}

	if translated, ok := translations[text]; ok {
		return translated
	}

	return fmt.Sprintf("[ꯔꯣꯟꯕꯥ: %s]", text)
}
