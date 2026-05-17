# Project Digilio: AI-Agentic ERP Task List

This document outlines the development tasks for building the Digilio ERP system, categorized by phases and features.

## Phase 0: Project Setup & Infrastructure
- [x] Initialize Frontend: Next.js with TypeScript, Tailwind CSS, and Shadcn UI.
- [x] Initialize Backend: FastAPI project structure with Python.
- [x] Database Setup:
    - [x] Configure PostgreSQL with `pgvector` extension.
    - [x] Setup Redis for session management.
    - [x] Setup Meilisearch for master data search.
- [x] Dockerization: Create `docker-compose.yml` for local development environment (Postgres, Redis, Meilisearch, Ollama, MinIO).
- [x] LLM Integration: Setup connection to Ollama/vLLM for local LLM development.

## Phase 1: Core Layout & UI Foundation (Split Workspace)
- [x] Implement Split Layout (75:25 ratio).
- [x] Build Command Center Sidebar (Right side, 25%).
- [x] Build Workspace Area (Left side, 75%).
- [x] Implement Multi-Tab/Multi-Session Management in Workspace.
- [x] Setup Global State Management using Zustand (Tab state, UI context, AI session).

## Phase 2: Omni-Command Center & NLP Foundation
- [x] Create Floating/Sidebar Prompt Input.
- [x] Implement Basic NLP Pipeline in Backend:
    - [x] Intent Recognition (e.g., CREATE_PO, VIEW_REPORT).
    - [x] Entity Extraction (Vendor, Product, Qty, Price).
- [x] Connect Frontend Prompt to Backend NLP via WebSockets/API.
- [x] Display AI "Thought Process" in the Command Center.

## Phase 3: Agentic UI Engine (Auto-Navigation & Ghost Filling)
- [x] Implement Schema-Driven UI:
    - [x] Define JSON Schema format for ERP forms (e.g., Purchase Order, Sales).
    - [x] Create a dynamic form renderer based on JSON Schema.
- [x] Implement Auto-Navigation:
    - [x] Backend maps intent to URL/Route.
    - [x] Frontend handles programmatic redirects.
- [x] Implement "Ghost Filling":
    - [x] AI populates form fields based on extracted entities.
    - [x] Add visual highlights (blue highlight) for AI-filled fields.
    - [x] Allow manual user override for all fields.

## Phase 4: Database & Business Logic (Backend)
- [x] Implement Tenant-Specific Schema logic in PostgreSQL.
- [x] Build CRUD APIs for core modules (Sales, Inventory, Accounting, Purchase - SIAP).
- [x] Implement Rule Engine for dynamic validation (e.g., Mandatory fields, Hard Budgeting).
- [x] Setup Audit Trail logging for all AI-driven actions.

## Phase 5: Digital Guardrails & Security
- [x] Implement AI-Aware RBAC (Permission Layer).
- [x] Implement Validation Gatekeepers (Non-AI validation of JSON Blueprints).
- [x] Setup "No-Shell Policy" for LLM Tool-Calling.
- [x] Implement Logic for User Confirmation/Validation before "Save".

## Phase 6: Knowledge Base (RAG) & OCR
- [x] Knowledge Ingestion Pipeline:
    - [x] Implement PDF/Markdown indexing into Vector DB (Postgres + pgvector).
    - [x] Setup RAG retrieval for SOPs and Business Rules.
- [x] OCR Integration:
    - [x] Setup PaddleOCR and MinIO.
    - [x] Implement "Drag-and-Drop to Form" OCR pipeline.

## Phase 7: AI Onboarding & Dynamic Blueprint
- [x] Develop AI Business Consultant Agent:
    - [x] Interactive onboarding conversation logic.
    - [x] Generation of initial JSON Blueprint based on user needs.
- [x] Blueprint Editor (Developer Mode):
    - [x] Visual interface to view/edit JSON Blueprints.
- [x] Data Migration Agent:
    - [x] CSV/Excel mapping tool using AI.

## Phase 8: Multimodal & Voice-to-Action
- [ ] Integrate Whisper (Local) for Voice-to-Text conversion.
- [ ] Connect Voice pipeline to Omni-Command Center NLP.

## Phase 9: Environment Management & Lifecycle
- [ ] Implement "Sandbox" Mode vs "Production" Mode logic.
- [ ] Blueprint Versioning (Draft -> Apply to Production).
- [ ] Setup Staging/Shadow environment for testing Blueprint changes.

## Phase 10: Connectivity & Integration
- [ ] Standard Webhook system for 3rd party integrations.
- [ ] Automated API Endpoint generation from Blueprints.
