# Findings — VinodTestGen2.0

> Created: 2026-03-14  
> Last Updated: 2026-03-14 17:15

---

## Technical Discoveries & Fixes
- **Local Connectivity**: Discovered that some Node.js environments have trouble resolving `localhost` for local services like Ollama. Switched default configurations to `127.0.0.1` for improved reliability.
- **LLM Prompting**: Optimization was required to ensure LLMs respect multiple test case type selections (Functional, Non-Functional, Edge, Negative) simultaneously. Added explicit category counts to the system prompt.

---

## Discovery Answers (All Complete ✅)

### Core Purpose & Scope
- **Primary use case**: Generate test cases from pasted Jira requirements
- **Secondary use case**: General chat/Q&A — respond based on user input (not just test cases)
- **Jira input method**: Copy-paste directly into the input field (no API integration)
- **Test case output format**: Grid / Table structure (rows & columns)
- **Test case editing**: No — read-only after generation
- **Export**: CSV format only

### LLM Providers (All 6 Confirmed)
| Provider | Status | Notes |
|----------|--------|-------|
| Ollama | ✅ Default | Model: `gemma3:1b` |
| LM Studio | ✅ | — |
| Groq | ✅ | — |
| OpenAI | ✅ | — |
| Claude | ✅ | — |
| Gemini | ✅ | — |

- **Usage mode**: One LLM at a time (no side-by-side comparison)
- **Default**: Ollama with `gemma3:1b`

### UI & UX
- **Settings panel**: Separate page (own route)
- **Test Connection button**: Ping LLM endpoint → show success/failure
- **Theme**: Dark mode
- **History panel**: Stores prompt text + generated output, persisted to local file
- **Test case types**: User picks via checkboxes (functional, non-functional, edge cases, etc.)

### Tech Stack
- **Frontend**: React JS (JavaScript, not TypeScript)
- **Backend**: Node.js + TypeScript + Express
- **Database**: Local file (JSON on disk)

---

## From Design Wireframe
- **Main View**:
  - Left sidebar: "History" panel (previous generations)
  - Center: Large output area — test cases in table/grid format
  - Bottom: Input field — "Ask here TC for Requirement"
- **Settings Page**:
  - Ollama Setting, LM Studio Setting, Groq Setting
  - OpenAI API keys, Claude API keys, Gemini API keys
  - Save Button + Test Connection button

---

## Constraints Summary
- No Jira API integration — pure copy/paste
- Local-first: Ollama default, all data stored locally as JSON files
- Dark mode only (no theme toggle)
- One LLM at a time (no multi-LLM comparison)
- No in-UI editing of generated test cases
- Export to CSV only
- Frontend is React JS (not TypeScript), Backend is Node.js + TypeScript
