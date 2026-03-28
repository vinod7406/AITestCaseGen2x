# Test Cases Spreadsheet (VWO Login)
Converted from XLSX format requirements.

| TC_ID | Scenario/TID | Priority | Test Summary | Pre-condition | Test Steps | Expected Result | Actual Result | Status | Automation (Yes/No) |
|---|---|---|---|---|---|---|---|---|---|
| TC_001 | TS_001 | P0 | Validate successful login with valid credentials | User is on app.vwo.com login page | 1. Navigate to app.vwo.com<br>2. Enter valid email in 'Enter email ID'<br>3. Enter valid password in 'Enter password'<br>4. Click 'Sign in' | System authenticates user and redirects immediately to the Dashboard. | [NEEDS CLARIFICATION] | Pass/Fail | Yes |
| TC_002 | TS_001 | P1 | Validate 'Remember me' session persistence | User is on app.vwo.com login page | 1. Enter valid email and password<br>2. Check 'Remember me' checkbox<br>3. Click 'Sign in'<br>4. Re-navigate to URL in new session | User is automatically logged in without credentials requested. | [NEEDS CLARIFICATION] | Pass/Fail | Yes |
| TC_003 | TS_002 | P0 | Validate login failure with empty credentials | User is on app.vwo.com login page | 1. Leave Email field blank<br>2. Leave Password field blank<br>3. Click 'Sign in' | System prevents login showing actionable error message `[Needs Clarification]`. | [NEEDS CLARIFICATION] | Pass/Fail | Yes |
| TC_004 | TS_002 | P0 | Validate login failure with invalid email format (blur) | User is on app.vwo.com login page | 1. Enter text without '@' or domain into Email field<br>2. Click outside the input field (Blur) | System displays a visual validation error `[Needs Clarification]` immediately. | [NEEDS CLARIFICATION] | Pass/Fail | Yes |
| TC_005 | TS_002 | P0 | Validate login failure with invalid password | User account exists | 1. Enter valid email<br>2. Enter incorrect password<br>3. Click 'Sign in' | System fails authentication and displays error: `[Needs Clarification]`. | [NEEDS CLARIFICATION] | Pass/Fail | Yes |
| TC_006 | TS_003 | P1 | Validate brute force protection (Rate Limiting) | Valid user account exists | 1. Repeatedly attempt login with invalid passwords | System throttles or blocks subsequent requests after security threshold. | [NEEDS CLARIFICATION] | Pass/Fail | No |
| TC_007 | TS_004 | P2 | Validate auto-focus on email field on load | Page rendering complete | 1. Open app.vwo.com in browser | The cursor is focused on the 'Enter email ID' field by default. | [NEEDS CLARIFICATION] | Pass/Fail | Yes |

---
## Self-Validation Check (Anti-Hallucination):
- **Did I invent features?** No, every element (Email, Password, Remember Me, Submit) is from the screenshots and restricted user request.
- **Did I assume behavior?** No, error strings and session logic details use `[Needs Clarification]` where the PRD/UI was silent.
- **Is it traceable?** Yes, mapping to the spreadsheet format's observed headers (Priority levels P0-P2, TC_ID, TID/Scenario links, etc).
