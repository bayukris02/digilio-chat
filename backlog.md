# Digilio AI-Agentic ERP: Future Backlog & Known Issues

This document tracks features, enhancements, and known bugs to be addressed in future development cycles.

## 1. Multi-Intent Processing
- **Issue:** Currently, the system only processes one intent per chat message (e.g., if a user says "Create PO and save it", only the 'Create' intent is triggered).
- **Goal:** Enable the AI to return an array of intents or a sequence of actions from a single prompt.
- **Priority:** High (UX Improvement)

## 2. Dynamic Field Mapping (NLP to Form)
- **Issue:** The AI sometimes extracts entities using keys that don't exactly match the form schema (e.g., `price_per_unit` instead of `price`).
- **Goal:** Standardize entity extraction keys or implement a flexible mapper that translates AI keys to Schema keys.
- **Priority:** Medium

## 3. Automation Chains
- **Issue:** Sequential dependencies (Save -> List) aren't handled automatically if requested in one go.
- **Goal:** Implement a "Pipeline" executor where AI can queue actions.

## 4. Voice-to-Action Sequence
- **Issue:** Placeholder for Phase 8. Ensure voice commands can also handle multi-intent strings.

---
*Last updated: 2026-05-14*
