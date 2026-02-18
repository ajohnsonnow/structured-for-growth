# ADR-0002: JWT with Refresh Token Rotation for Session Management

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-06-15 |
| **Decision Makers** | Core team |
| **P-ID** | P3.2.3 |

## Context

The original auth system used a single JWT with a 7-day expiry. This created several security gaps:

1. **No revocation** — a stolen token is valid for 7 days.
2. **No session termination** — NIST SP 800-171 control 3.1.11 requires session termination after inactivity.
3. **No replay detection** — if a refresh token is intercepted, the attacker can use it indefinitely.

## Decision

Implement a **dual-token architecture**:

- **Access token** — short-lived JWT (15 minutes). Contains user claims. Stateless verification.
- **Refresh token** — long-lived opaque token (7 days). Stored as SHA-256 hash in the database. Supports rotation and family-based replay detection.

Key behaviors:
- Login issues both tokens.
- `/auth/refresh` rotates the refresh token (old one is revoked, new one issued in the same family).
- If a revoked refresh token is replayed, the entire token family is revoked (compromised session detection).
- Password change revokes all refresh tokens for the user.
- `/auth/logout` revokes the refresh token.

## Consequences

### Positive

- Stolen access tokens are only valid for 15 minutes.
- Refresh token rotation detects replay attacks.
- Administrators can force-logout users by revoking their token families.
- Satisfies NIST SP 800-171 controls 3.1.11, 3.5.3, and 3.13.9.

### Negative

- Clients must implement token refresh logic (intercept 401, call `/auth/refresh`, retry).
- Database writes on every refresh (one INSERT + one UPDATE).
- Slightly more complex auth flow.

### Risks

- Clock skew between client and server could cause premature access token expiry. Mitigated by the `expiresIn` field in the response.
- If the client fails to store the new refresh token after rotation, the session is lost.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Single long-lived JWT (current) | Simple | No revocation, NIST non-compliant |
| Session cookies (server-side sessions) | Full revocation control | Requires session store, doesn't work well for API clients |
| OAuth 2.0 / OpenID Connect (external IdP) | Standards-based, MFA delegation | Over-engineered for current scale, adds external dependency |

## References

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [NIST SP 800-63B § 7 — Session Management](https://pages.nist.gov/800-63-3/sp800-63b.html#sec7)
- [Auth0 — Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
