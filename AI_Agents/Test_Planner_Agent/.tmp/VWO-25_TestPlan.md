# Test Plan – VWO‑25  
**Title:** Product Requirements Document – VWO Login Dashboard  
**Prepared By:** QA Architecture Team  
**Date:** 2026‑03‑28  
**Version:** 1.0  

---  

## 1. Objectives  

| # | Objective |
|---|-----------|
| 1 | Validate that the login dashboard meets **functional** requirements (authentication, password reset, SSO, social login, remember‑me, UI behavior). |
| 2 | Verify **security** controls: encryption, rate limiting, session handling, MFA, GDPR/CCPA compliance, OWASP authentication guidelines. |
| 3 | Confirm **performance** targets: page load ≤ 2 s, support for thousands of concurrent login attempts, 99.9 % availability. |
| 4 | Ensure **accessibility** compliance with WCAG 2.1 AA (ARIA labels, keyboard navigation, high‑contrast mode). |
| 5 | Assess **usability** and **branding** (responsive design, light/dark theme, visual feedback, error handling). |
| 6 | Record **metrics** for success criteria (login success rate ≥ 95 %, user‑satisfaction ≥ 90 %). |

---  

## 2. Scope  

| In‑Scope | Out‑Of‑Scope |
|----------|--------------|
| • Login page UI (email, password, remember‑me, labels, theme toggle). <br>• Authentication flow (email/password, MFA, SSO, social login). <br>• Password‑reset / recovery flow. <br>• Session management (creation, timeout, logout). <br>• Responsive behavior on desktop, tablet, mobile. <br>• Accessibility features (ARIA, keyboard, high‑contrast). <br>• Security mechanisms (HTTPS, encryption, rate limiting, token handling). <br>• Performance & load testing of the login endpoint. <br>• Analytics event emission (login success/failure). | • Post‑login dashboard functionality. <br>• Backend user‑provisioning processes unrelated to login. <br>• Third‑party SSO provider implementations (only integration points). <br>• Long‑term monitoring/observability (beyond test execution). |

---  

## 3. Test Strategy  

| Test Type | Goal | Tools / Frameworks | Frequency |
|-----------|------|-------------------|-----------|
| **Functional** | Verify all login‑related features work as defined. | Cypress / Selenium WebDriver, TestNG/Jest | Every sprint (regression) |
| **UI/UX** | Validate layout, branding, theme support, loading states. | Cypress visual‑snapshot, Percy, Chromatic | CI on each build |
| **Cross‑Browser / Compatibility** | Ensure consistent behavior on supported browsers/devices. | BrowserStack, Sauce Labs (Chrome, Firefox, Safari, Edge, iOS/Android) | CI & nightly |
| **Accessibility** | Confirm WCAG 2.1 AA compliance. | axe‑core (Cypress), pa11y, manual keyboard testing | CI (automated) + manual audit |
| **Security** | Test encryption, token handling, rate limiting, MFA, SSO, OWASP risks. | OWASP ZAP, Burp Suite, Postman, custom scripts for brute‑force, SSL Labs | Dedicated security sprint |
| **Performance / Load** | Measure page load time, concurrent login capacity, response times. | JMeter, k6, Lighthouse CI | Pre‑release (load) & CI (Lighthouse) |
| **Integration** | Verify analytics events, SSO hand‑off, social‑login callbacks. | Mock servers (WireMock), Cypress network stubbing | CI |
| **Regression** | Ensure new changes do not break existing functionality. | Cypress test suite executed on every merge | CI |
| **Smoke** | Quick sanity check of critical login path after deployment. | Cypress (smoke subset) | Post‑deployment |

### Test Environment  

| Environment | URL | Data | Notes |
|-------------|-----|------|-------|
| **DEV** | https://dev‑app.vwo.com | Test accounts (admin, regular, SSO‑enabled) | Full feature flag set to *on*. |
| **QA** | https://qa‑app.vwo.com | Same set + rate‑limit thresholds lowered for testing | SSL/TLS identical to prod. |
| **Staging/Pre‑Prod** | https://staging‑app.vwo.com | Production‑like data, limited real‑user accounts | Used for load & security testing. |
| **Production** | https://app.vwo.com | Real user data (read‑only for analytics verification) | Not used for destructive tests. |

---  

## 4. Entry / Exit Criteria  

### Entry Criteria  

| Requirement | Met? |
|-------------|------|
| PRD (VWO‑25) approved and baseline requirements signed‑off | ✅ |
| Test environment(s) provisioned & stable (HTTPS enforced) | ✅ |
| Test data (valid/invalid credentials, MFA tokens, SSO metadata) created | ✅ |
| Automation framework installed, CI pipelines passing baseline health checks | ✅ |
| Test case review completed and baseline coverage ≥ 90 % | ✅ |
| Security test tools configured (ZAP scan baseline) | ✅ |

### Exit Criteria  

| Requirement | Met? |
|-------------|------|
| All test cases executed; pass rate ≥ 95 % (critical) & ≥ 90 % overall | ✅ |
| All **Critical** defects resolved and retested; **High** defects either resolved or accepted with risk mitigation | ✅ |
| Performance targets met: <2 s page load, ≤ 1 s average login response under 2 k concurrent users | ✅ |
| Security scan results: no OWASP Top‑10 findings of severity ≥ Medium; rate‑limit enforced; TLS 1.2+ only | ✅ |
| Accessibility audit: 100 % WCAG 2.1 AA compliance for automated checks; manual issues closed | ✅ |
| Regression suite passed on latest build; smoke test green on production rollout | ✅ |
| Test summary report signed off by Product Owner & Security Lead | ✅ |

---  

## 5. Test Cases  

> **Notation** – Priority: **P0** (Critical), **P1** (High), **P2** (Medium), **P3** (Low).  
> Type: **FUNC**, **SEC**, **PERF**, **ACC**, **UI**, **INT**.

| ID | Title | Description | Preconditions | Steps | Expected Result | Priority | Type |
|----|-------|-------------|----------------|-------|-----------------|----------|------|
| TC‑01 | Page Load Time ≤ 2 s | Verify login page loads within performance budget on a standard 5 Mbps connection. | Test device with Chrome, network throttling set to 5 Mbps. | 1. Navigate to `https://app.vwo.com`.<br>2. Measure `DOMContentLoaded` and `load` events via Lighthouse. | Page fully rendered ≤ 2 s; no layout shift > 0.1. | P0 | PERF |
| TC‑02 | UI Elements Presence | Confirm all required UI components are displayed correctly. | None | 1. Open login page.<br>2. Inspect for: Email field, Password field, Remember Me checkbox, Login button, Forgot Password link, Register link, Theme toggle, Loading spinner placeholder. | All elements visible, correctly labelled, and follow VWO branding. | P0 | UI |
| TC‑03 | Email Format Validation | Validate real‑time email format check on blur. | Valid email (`user@example.com`) and invalid strings (`user@`, `user.com`). | 1. Focus Email field.<br>2. Enter invalid email, blur.<br>3. Observe validation message.<br>4. Repeat with valid email. | Invalid input shows error “Enter a valid email address”. Valid input clears error. | P1 | FUNC |
| TC‑04 | Password Strength Indicator | Verify visual feedback for password complexity. | None | 1. Focus Password field.<br>2. Type passwords of varying strength (e.g., `12345`, `Passw0rd!`, `StrongPass#2026`). | Indicator updates (Weak → Medium → Strong) with appropriate color/label. | P1 | UI |
| TC‑05 | Successful Login – Valid Credentials | Authenticate a standard user with correct email/password. | Account `john.doe@acme.com` / `P@ssw0rd!` (MFA disabled). | 1. Enter credentials.<br>2. Click **Login**.<br>3. Observe redirect. | Dashboard loads; session cookie set; analytics event `login_success` emitted. | P0 | FUNC |
| TC‑06 | Failed Login – Invalid Credentials | Verify error handling for wrong password. | Account `john.doe@acme.com` exists. | 1. Enter correct email, wrong password.<br>2. Click **Login**. | Error message “Incorrect email or password.” displayed; no session created. | P0 | FUNC |
| TC‑07 | Remember Me Persistence | Ensure session persists across browser restarts when checkbox selected. | Account with Remember Me enabled. | 1. Check **Remember Me**.<br>2. Login successfully.<br>3. Close browser.<br>4. Re‑open and navigate to `app.vwo.com`. | User is automatically logged in; session token still valid. | P1 | FUNC |
| TC‑08 | Forgot Password Flow | Validate password reset token generation and UI flow. | Email `john.doe@acme.com` registered. | 1. Click **Forgot Password**.<br>2. Submit email.<br>3. Capture reset email (test inbox).<br>4. Follow link, set new password.<br>5. Login with new password. | Reset email received within 5 min, link valid, password change succeeds, user can login. | P0 | FUNC |
| TC‑09 | Multi‑Factor Authentication (MFA) | Verify optional 2FA challenge when enabled for the account. | Account `jane.smith@enterprise.com` with MFA enabled (TOTP). | 1. Login with correct credentials.<br>2. Prompt for OTP displayed.<br>3. Enter valid TOTP.<br>4. Complete login. | User gains access only after correct OTP; wrong OTP shows error. | P1 | SEC |
| TC‑10 | Enterprise SSO – SAML | Confirm successful SSO authentication via SAML IdP. | Test IdP configured, user `sso_user@corp.com` mapped. | 1. Click **SSO** button.<br>2. Redirect to IdP login, authenticate.<br>3. Return to VWO dashboard. | Single sign‑on succeeds; session established without password entry. | P1 | INT |
| TC‑11 | Social Login – Google | Verify login via Google OAuth. | Google test account `test.user@gmail.com`. | 1. Click **Login with Google**.<br>2. Complete Google consent flow.<br>3. Return to VWO. | User logged in; VWO account linked or created; appropriate analytics event recorded. | P2 | INT |
| TC‑12 | Responsive Layout – Mobile | Ensure UI adapts to ≤ 480 px width with touch‑friendly controls. | Mobile device emulator (iPhone X). | 1. Load login page.<br>2. Verify layout (single‑column, input sizes ≥ 44 px, auto‑focus on email). | No horizontal scroll, inputs usable via touch, theme toggle accessible. | P1 | UI |
| TC‑