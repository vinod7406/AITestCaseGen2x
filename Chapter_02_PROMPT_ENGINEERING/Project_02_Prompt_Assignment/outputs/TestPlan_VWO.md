# Test Plan: VWO.com Login Dashboard

**Role/Author:** QA Engineer (15 Years Experience)  
**Project:** VWO Login Dashboard (`app.vwo.com`)  
**Date:** March 2026

---

## Objective
The primary objective of this Test Plan is to outline the testing strategy, scope, environments, and deliverables for the new VWO Login Dashboard. This plan ensures secure, rapid, and accessible user authentication—specifically validating username/password inputs, "Remember Me" functionality, security protocols, and sub-2-second performance targets outlined in the PRD.

## Scope
The features and functionality of the VWO Login interface that will be tested include:
- **Functional Check:** Standard Login (username/password), "Remember Me" behaviors, Auto-focus, Password Management (Reset, strength indicators).
- **Interface Design:** Responsive behavior across device viewports, load states, and clickable labels.
- **Accessibility:** Screen Reader compatibility, Keyboard navigation, and High Contrast Modes (WCAG 2.1 AA).
- **Security & Compliance:** Encryption algorithms, Rate Limiting (brute force), GDPR adherence, Session Security token management.
- **Performance:** Sub-2-second page load times and capability to handle thousands of concurrent users.

## Inclusions
- Login Page (`app.vwo.com`)
- Dashboard Page Transition (Post-successful authentication)
- Forgot Password / Password Reset Flows
- Error Messaging and Prompt Validation

## Exclusion
- General Marketing / Pricing Pages
- Support Page
- Support Widget - ZOHO chat
- Deep post-authentication module testing (only routing to Dashboard is in scope here).

## Test Environments
Testing will be conducted across multiple progressive environments to ensure high availability and stability.

| Name | Env URL |
|------|---------|
| QA | `qa.vwo.com` |
| Pre Prod | `preprod.vwo.com` |
| UAT | `uat.vwo.com` |
| Prod | `app.vwo.com` |

**Hardware & OS/Browser Matrix:**
- **Windows 10/11:** Chrome, Firefox, and Edge
- **Mac OS:** Safari, Chrome
- **Android Mobile OS:** Chrome
- **iPhone Mobile/iOS:** Safari

## Defect Reporting Procedure
Defects identifying deviation from the PRD, rendering problems, or security concerns will be tracked systematically.
- **Reporting Steps:** Defects will be logged providing clear reproduction steps, screenshots/logs, expected vs. actual results, and exact browser matrices.
- **Triage Process:** Defects will be grouped by Severity (Critical, High, Medium, Low) and reviewed over a daily triage cadence. 
- **Tools used:** **JIRA Bug Tracking Tool**

**Defect Process POC:**
- **New Frontend:** Devesh
- **Backend:** Sonal
- **Dev Ops:** Prajeeth

## Test Strategy
Following a structured, context-driven testing approach suited for high-risk authentication zones:

**Step 1: Test Design & Prioritization**
Test design techniques leveraged will include:
- *Equivalence Class Partition & Boundary Value Analysis* (Email formatting, minimum/maximum characters for passwords).
- *State Transition Testing* (Evaluating locked out user states after failed attempts).
- *Error Guessing & Exploratory Testing* (Security injections, double submissions).

**Step 2: Execution & Cycles**
- **Smoke & Sanity Testing:** Build validation covering core functional pathways; build rejection upon critical login failures.
- **In-depth Testing:** Systematic functional execution, Mobile responsive checks, Accessibility validations, and Load Testing.
- Status and defect leakage will be reported via end-of-day summary emails.

**Step 3: Best Practices (15-Year SME Alignment)**
- *Shift-Left Testing:* Early API/Token logic reviews before UI integration.
- *End to End Flow Testing:* Full lifecycle authentication flows (Login to Dashboard to Logout).
- *Performance Focus:* Utilizing the three-point estimates and monitoring sub-2-second load KPIs closely.

## Test Schedule
Estimated to take **2 Sprints** to test the Application thoroughly across functional, accessibility, and enterprise features.

| Task | Dates / Duration |
|------|-------------------|
| Creating Test Plan | Sprint 1 (Days 1-2) |
| Test Case Creation | Sprint 1 (Days 3-5) |
| Test Case Execution & Defect Logging | Sprint 2 |
| Summary Reports Submission Date | End of Sprint 2 |

## Test Deliverables
- Test Plan Document (This document)
- Detailed Test Cases & Execution Matrix
- Defect Reports / Bug Logs
- Formal Test Summary Report

## Entry and Exit Criteria

### Requirement Analysis
**Entry Criteria:**
- Testing team receives the Requirements Documents (PRD).
**Exit Criteria:**
- PRD features are evaluated; ambiguities around SSO specifics and Error messages are marked and clarified.

### Test Execution
**Entry Criteria:**
- Test Scenarios and Test Cases Documents are formally signed-off.
- Target application build is stable and deployed to `qa.vwo.com` / `uat.vwo.com`.
**Exit Criteria:**
- Planned test cases have been exhaustively executed.
- Zero open Critical/High defects surrounding the login form execution.
- Vulnerability scenarios effectively mitigated.

### Test Closure
**Entry Criteria:**
- Test Case Reports and final defect statistics are aggregated.
**Exit Criteria:**
- Test Summary Reports compiled and reviewed with the Product team.
- Product Sign-off achieved.

## Tools
To maintain agility and governance, the following standard tools will be utilized:
- **JIRA Bug Tracking Tool**
- **Mind map Tool**
- **Snipping Screenshot Tool**
- **Word and Excel documents**
- *[Needs Clarification: Dedicated Performance/Load Testing software pending final architectural review]*

## Risks and Mitigations
| Risk | Mitigation |
|------|------------|
| **Non-Availability of a Resource** | Implement Backup Resource Planning; cross-train QA across UI, API, and Load disciplines. |
| **Build URL is not working** | Testers shift focus to API specification testing or test data arrangement. |
| **Less time for Testing** | Utilize Risk-Based methodologies targeting P0 scenarios; dynamically ramp up resources based on client needs. |
| **Third-Party Integrations Drop (SSO)** | Ensure robust mock services are available to avoid complete functional blockers. |

## Approvals
The QA team will deliver governance documents for Client/Stakeholder approval:
- **Test Plan**
- **Test Scenarios**
- **Test Cases**
- **Reports**

*Testing Phase 2 (Execution) will securely lock its entry gate until the above approvals are confirmed.*
