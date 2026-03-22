# Bug Report: Login Error Message

## Title
Error message "You are not allowed to log in." displayed with invalid credentials

---

## Environment
| Field | Value |
|-------|-------|
| Application URL | app.vw.com |
| Browser | Chrome |
| Browser Version | 145 |
| Operating System | Windows 11 Desktop |
| Network | [NEEDS CLARIFICATION] |
| Test Environment | [NEEDS CLARIFICATION] |

---

## Priority
[NEEDS CLARIFICATION] — Select one:
- [ ] P0 (Critical/Blocker)
- [ ] P1 (High)
- [ ] P2 (Medium)
- [ ] P3 (Low)

---

## Severity
Select one:
- [ ] Low
- [ ] Medium
- [ ] High
- [x] Critical

---

## Pre-conditions
[NEEDS CLARIFICATION] — e.g. User has an active internet connection.

---

## Steps to Reproduce
1. Navigate to app.vw.com
2. Enter an invalid username
3. Enter an invalid password
4. Click the submit button

---

## Expected Result
The system should display a clear message indicating: "Your email, password, IP address or location did not match"

---

## Actual Result
Error message displayed: **"You are not allowed to log in."**

This error message is confusing and contradicts the expected standardized login failure message.

---

## Issue Description
When submitting the login form with invalid credentials, the error message "You are not allowed to log in." appears. This message is unclear and could imply various scenarios:
- Account restrictions/locked
- Permissions denied
- IP blocked

Instead of simply indicating that the credentials do not match, the currently displayed message does not help the user understand why their login specifically failed.

---

## Evidence Required
- [x] Screenshot of error message
- [ ] Chrome console logs (F12 > Console tab)
- [ ] Network tab logs from failed login request

---

## Additional Observations
- Remember me checkbox is visible on the login page
- Social login options are available on the login page
- [NEEDS CLARIFICATION] — Does this error appear for ALL invalid login attempts, or only certain usernames?

---

## Questions for Clarification
1. What should the Priority (P0-P3) be?
2. Are there any specific pre-conditions to document?
3. What is the test environment (Production/Staging/Dev)?
4. Can you provide Chrome console logs and Network tab logs?

---

**Report Created:** 22 March 2026
**Status:** [OPEN - Pending Clarifications]
