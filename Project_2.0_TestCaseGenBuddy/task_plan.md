# Task Plan — VinodTestGen2.0

> Status: ✅ BLUEPRINT APPROVED  
> Created: 2026-03-14  
> Last Updated: 2026-03-14 16:05

---

## 📌 Project Summary

A local-first, LLM-powered Test Case Generator web application. Users paste Jira requirements, select test case types, and the app generates structured test cases in a table/grid format using one of 6 supported LLM providers. Also supports general chat/Q&A. Dark mode UI with persistent history and CSV export.

---

## 🏗️ Blueprint

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React JS — plain JavaScript only (no TypeScript). Vite as build tool |
| Backend | Node.js + TypeScript + Express |
| Storage | Local JSON files (settings, history) |
| Default LLM | Ollama (`gemma3:1b`) |

### App Structure

```
Project_2.0_TestCaseGenBuddy/
├── frontend/                  # React JS + Vite
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Main page + Settings page
│   │   ├── services/          # API calls to backend
│   │   ├── context/           # React Context for state
│   │   ├── assets/            # Icons, fonts
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── backend/                   # Node.js + TypeScript + Express
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # LLM service layer (one per provider)
│   │   ├── utils/             # Helpers, prompt templates
│   │   ├── data/              # Local JSON file storage
│   │   └── index.ts           # Express server entry
│   ├── tsconfig.json
│   └── package.json
├── task_plan.md
├── findings.md
├── progress.md
└── context.md
```

### Pages & Features

#### Page 1: Main View (`/`)
- **Left sidebar — History Panel**
  - List of previous generations (prompt text + output summary)
  - Click to reload a past generation
  - Persisted to local JSON file
- **Center — Output Area**
  - Displays generated test cases in a **table/grid** format
  - Columns: Test Case ID, Test Case Summary, Preconditions, Steps, Expected Result, Type
  - Also handles general chat/Q&A responses (displayed as formatted text)
  - Shows which LLM provider generated the output
- **Bottom — Input Area**
  - Text input / textarea for pasting Jira requirements or asking questions
  - **Test Case Type Checkboxes**: Functional, Non-functional, Edge Cases, Negative
  - **LLM Provider Selector**: Dropdown to pick which LLM to use
  - Submit button

#### Page 2: Settings View (`/settings`)
- **6 LLM Provider Config Sections** (expandable/collapsible):
  - **Ollama**: Base URL, Model name
  - **LM Studio**: Base URL, Model name
  - **Groq**: API Key, Model name
  - **OpenAI**: API Key, Model name
  - **Claude**: API Key, Model name
  - **Gemini**: API Key, Model name
- **Save Button**: Persist settings to local JSON file
- **Test Connection Button**: Ping selected LLM endpoint → show success ✅ or failure ❌
- Back button to return to main view

### API Endpoints (Backend)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/generate` | Generate test cases from requirements |
| POST | `/api/chat` | General Q&A chat with LLM |
| GET | `/api/history` | Fetch all history entries |
| POST | `/api/history` | Save a new history entry |
| DELETE | `/api/history/:id` | Delete a history entry |
| GET | `/api/settings` | Get saved LLM settings |
| PUT | `/api/settings` | Update LLM settings |
| POST | `/api/test-connection` | Test LLM provider connectivity |
| GET | `/api/export/:id` | Export test cases as CSV |

### LLM Service Architecture

Each LLM provider gets its own service class implementing a common interface:
- `OllamaService` — HTTP to local Ollama API
- `LMStudioService` — HTTP to local LM Studio API
- `GroqService` — Groq Cloud API
- `OpenAIService` — OpenAI API
- `ClaudeService` — Anthropic API
- `GeminiService` — Google Gemini API

Common interface: `generateTestCases(prompt, options)` → structured test case array

---

## 📅 Phases & Checklists

### Phase 1: Discovery & Requirements ✅
- [x] Ask and resolve all discovery questions
- [x] Document findings in `findings.md`
- [x] Create blueprint in `task_plan.md`
- [x] **Get blueprint approval from user** ✅ Approved 2026-03-14 16:08

### Phase 2: Project Setup & Architecture ✅
- [x] Initialize frontend (React JS + Vite)
- [x] Initialize backend (Node.js + TypeScript + Express)
- [x] Set up project folder structure
- [x] Set up local JSON file storage utility (Folders created)
- [x] Set up CORS, error handling middleware
- [x] Verify both servers run and communicate

### Phase 3: Backend — Core APIs ✅
- [x] Build settings API (GET/PUT `/api/settings`)
- [x] Build history API (GET/POST/DELETE `/api/history`)
- [x] Build LLM service interface
- [x] Implement Ollama service (default)
- [x] Build test-connection API
- [x] Build generate endpoint with prompt engineering
- [x] Build chat endpoint
- [x] Build CSV export endpoint

### Phase 4: Frontend — UI Shell ✅
- [x] Set up routing (Main + Settings pages)
- [x] Build dark mode design system (colors, typography, spacing)
- [x] Build main layout (sidebar + center + input area)
- [x] Build settings page layout
- [x] Connect to backend APIs

### Phase 5: Frontend — Features ✅
- [x] Build History sidebar component (with Expand/Collapse)
- [x] Build test case table/grid component
- [x] Build input area with checkboxes + LLM selector
- [x] Build Settings page with all 6 provider configs
- [x] Build Save + Test Connection functionality
- [x] Build CSV export button
- [x] Build general chat/Q&A display
- [x] Build animated Top-Middle Toast notification system

### Phase 6: Remaining LLM Integrations ✅
- [x] Implement LM Studio service
- [x] Implement Groq service
- [x] Implement OpenAI service
- [x] Implement Claude service
- [x] Implement Gemini service
- [x] Test each provider end-to-end

### Phase 7: Testing & Polish ✅
- [x] End-to-end testing of all flows
- [x] Error handling & loading states
- [x] UI polish, animations, responsiveness
- [x] Final review

---

## 🎯 Goals
1. A working local-first test case generator with premium dark mode UI
2. 6 LLM providers supported (Ollama default with gemma3:1b)
3. Table/grid test case output with CSV export
4. User-selectable test case types via checkboxes
5. Persistent history and settings via local JSON files
6. General chat/Q&A as secondary feature
7. Test Connection for all providers

---

## 🚫 Out of Scope (v2.0)
- Jira API integration (copy-paste only)
- Side-by-side LLM comparison
- In-UI test case editing
- Multi-user / authentication
- Cloud deployment
- Export formats other than CSV
- Light mode / theme toggle
