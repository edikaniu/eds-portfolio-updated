# Security Guidelines for Ed’s Portfolio Website

**Purpose**
These guidelines provide a comprehensive security framework tailored for Ed’s personal portfolio website. They outline best practices to protect sensitive data, ensure reliable service, and maintain user trust.

---
## 1. Security Objectives

- **Confidentiality**: Protect any user-submitted data (e.g., contact form entries) from unauthorized access.
- **Integrity**: Ensure content and communications are not tampered with in transit or at rest.
- **Availability**: Minimize downtime and defend against denial-of-service attacks.
- **Privacy**: Avoid exposing visitor information or internal system details.

---
## 2. Threat Model & Key Risks

1. **API Misuse**: Abuse of `/api/notify-question` could lead to spam, DoS, or injection attacks.
2. **Cross-Site Scripting (XSS)**: Malicious code injection via dynamic content or user inputs.
3. **Cross-Site Request Forgery (CSRF)**: Unauthorized form submissions to the contact endpoint.
4. **Sensitive Data Exposure**: Leakage of environment variables, secrets, or stack traces.
5. **Man-in-the-Middle (MitM) Attacks**: Unencrypted traffic that can be intercepted.
6. **Dependency Vulnerabilities**: Known CVEs in third-party libraries.

---
## 3. Secure Architecture & Design Principles

1. **Least Privilege**:  
   - API routes run with minimal permissions.  
   - Environment variables only contain non-sensitive defaults in public repos.
2. **Defense in Depth**:  
   - Multiple controls (input validation, rate limiting, HTTPS, CSP) layered together.
3. **Fail Securely**:  
   - On error, return generic messages (e.g., "Submission failed, please retry.") without stack traces.
4. **Secure Defaults**:  
   - Enforce HTTPS, `HttpOnly` & `Secure` cookies, and restrictive CORS by default.
5. **Keep It Simple**:  
   - Avoid overly complex custom cryptography; rely on battle-tested libraries.

---
## 4. Input Validation & Output Encoding

- **Server-Side Validation**  
  • Validate all fields on `/api/notify-question`:  
    – `name`: alphabetic, length limits (e.g., 2–100 chars).  
    – `email`: valid email regex, length ≤ 254.  
    – `message`: sanitize to remove HTML tags, length limits (e.g., ≤ 2000 chars).  
- **Injection Protection**  
  • Use parameterized queries or safe string concatenation when interacting with any data store or email service.  
- **XSS Mitigation**  
  • Escape or HTML-encode any user-submitted content rendered back to clients.  
  • Employ a strong Content Security Policy (CSP) restricting scripts to self and approved CDNs.

---
## 5. API & Form Security

1. **CSRF Protection**  
   - Implement anti-CSRF tokens or a same-site cookie policy (`SameSite=Strict`) for form submissions.  
   - Alternatively, require a custom header (e.g., `X-CSRF-Token`) on POST requests.
2. **Rate Limiting & Throttling**  
   - Limit requests (e.g., 5 submissions per IP per hour) to prevent spam/DoS.  
   - Use an in-memory store (Redis) or Vercel Edge functions for ephemeral counters.
3. **Spam & Bot Mitigation**  
   - Add a honeypot field or integrate reCAPTCHA/v3 to block automated submissions.
4. **Input Sanitization**  
   - Use a library like `validator.js` to normalize and sanitize email and text fields.

---
## 6. Authentication & Access Control

- **Static Content**: Publicly accessible; no authentication required.
- **Admin Interface (Future)**:  
  • If adding a CMS or admin panel, enforce:  
    – Strong password policies with bcrypt/Argon2 hashing and unique salts.  
    – Multi-factor authentication (MFA).  
    – Role-based access control (RBAC) for content creation vs. site administration.

---
## 7. Transport & Data Protection

- **HTTPS Only**  
  • Enforce HSTS (`Strict-Transport-Security`) with a preload directive.
- **Encryption in Transit**  
  • TLS 1.2+ with strong cipher suites; disable obsolete protocols (SSLv3/TLSv1.0–1.1).
- **Secrets Management**  
  • Store API keys or SMTP credentials in environment variables or a vault (e.g., Vercel Secrets).
  
---
## 8. Security Headers & Client-Side Controls

- **HTTP Security Headers**  
  • Content-Security-Policy: restrict scripts, styles, fonts to trusted sources.  
  • X-Frame-Options: `DENY` to prevent clickjacking.  
  • X-Content-Type-Options: `nosniff` to prevent MIME-based attacks.  
  • Referrer-Policy: `no-referrer-when-downgrade` or `strict-origin-when-cross-origin`.  
  • Permissions-Policy: disable unnecessary APIs (e.g., geolocation, camera).
- **Secure Cookies**  
  • Set `HttpOnly`, `Secure`, and `SameSite=Strict` (or `Lax`).

---
## 9. Dependency Management

- **Vulnerability Scanning**  
  • Integrate SCA tools (GitHub Dependabot, Snyk) to identify CVEs.  
- **Lockfile & Pinning**  
  • Use `package-lock.json` or `yarn.lock` to pin exact versions.
- **Minimal Footprint**  
  • Audit dependencies; remove unused packages to reduce attack surface.

---
## 10. Infrastructure & Deployment

- **Environment Isolation**  
  • Separate builds for development, staging, production.  
  • Use distinct environment variables per environment.
- **Secure Configuration**  
  • Disable verbose error logging in production.  
  • Restrict administrative dashboards and Vercel project settings to authorized users.
- **TLS & DNS**  
  • Automate certificate management (Let’s Encrypt via Vercel).  
  • Enforce DNSSEC where supported.

---
## 11. Monitoring, Logging & Incident Response

- **Error Monitoring**  
  • Integrate Sentry or LogRocket for client/server error tracking (sanitize PII).
- **Access Logs & Alerts**  
  • Monitor API endpoint usage; set alerts for traffic spikes or abnormal patterns.
- **Incident Playbook**  
  • Define steps for breach detection, containment, recovery, and notification.

---
## 12. Maintenance & Continuous Improvement

- **Regular Updates**  
  • Patch Next.js, React, and dependencies promptly.  
- **Security Testing**  
  • Schedule quarterly vulnerability scans and annual penetration tests.  
- **Documentation & Reviews**  
  • Keep this guideline up to date as the codebase evolves.  
  • Perform code reviews with a focus on security controls.

---
## Conclusion
By following these guidelines—embedding security from design to deployment—Ed’s portfolio will remain resilient against common threats, preserve visitor trust, and ensure a safe, fast, and reliable user experience.