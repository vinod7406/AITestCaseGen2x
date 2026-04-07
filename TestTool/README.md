# Keyword Driven Test Engine 🚀

A **Keyword Driven Testing Tool** that lets QA engineers visually build and execute automated browser tests using simple keywords — **no code required**.

- Select an **Action** (GOTO, CLICK, TYPE, WAIT, ASSERT_TEXT)
- Provide a **Locator** (CSS selector or XPath)
- Provide a **Value** (URL, input data, expected text)
- Click **Run Test Script** → Playwright executes it live in a real Chromium browser!

---

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm (comes with Node.js)

---

## 🚀 Getting Started

### 1. Clone & Install Backend
```bash
cd TestTool/backend
npm install
npx playwright install chromium
node src/index.js
```
Backend runs on **http://localhost:5002**

### 2. Install & Run Frontend
```bash
cd TestTool/frontend
npm install
npm run dev -- --port 5176
```
Frontend runs on **http://localhost:5176** (or next available port)

---

## ⚙️ Supported Keywords

| Keyword       | Locator Required | Value Required | Description                     |
|---------------|:----------------:|:--------------:|---------------------------------|
| `GOTO`        | ❌               | ✅ (URL)        | Navigate browser to a URL       |
| `CLICK`       | ✅               | ❌              | Click on an element             |
| `TYPE`        | ✅               | ✅ (text)       | Type text into an input field   |
| `WAIT`        | ❌               | ✅ (ms)         | Wait for specified milliseconds |
| `ASSERT_TEXT` | ✅               | ✅ (text)       | Assert element contains text    |

---

## 🏗️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express, Playwright
- **Browser**: Chromium (headless: false for live execution)
