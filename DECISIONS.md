---

## `DECISIONS.md`

```md
# Decisions

This file records important architecture and product decisions.

---

## 2026-05-12 — Use separated retriever and embedder services

### Context

spark-tutor needs user-facing RAG retrieval and admin-only knowledge ingestion.

### Decision

The system separates:

- Retriever backend for normal user interactions
- Embedder backend for admin-only ingestion and embedding

### Consequences

- Normal users do not need access to ingestion features.
- Admin functionality can be secured separately.
- Deployment is slightly more complex.
- Documentation and Docker Compose must clearly describe service roles.

---

## 2026-05-12 — Scope RAG retrieval by training/class ID

### Context

Users belong to a specific training/class. Knowledge base content must be restricted to matching training/class material.

### Decision

Every RAG retrieval must include the authenticated user’s training/class ID as a mandatory filter.

### Consequences

- Users cannot retrieve content from other classes.
- Ingestion must tag content with training/class IDs.
- Tests must verify cross-class isolation.

---

## 2026-05-12 — Use workflow routing before prompt generation

### Context

spark-tutor supports multiple AI learning behaviors.

### Decision

Every user prompt must first pass through a workflow-routing step before workflow-specific prompt construction.

### Consequences

- Prompt behavior remains modular.
- New workflows can be added later.
- Workflow decisions should be persisted or logged for debugging.

---

## 2026-05-12 — Start with simple auth, later support SSO

### Context

The first test phase needs login, logout, and password change, but no public registration.

### Decision

The first version uses manually created users with local authentication. SSO will be added later.

### Consequences

- User model must not assume public sign-up.
- User-to-training/class mapping is manually managed first.
- Auth design must allow future SSO identity mapping.

---

## 2026-05-12 — Use Docker Compose as the primary local runtime

### Context

The system includes multiple services and local model runners.

### Decision

Local development and test deployments use Docker Compose.

### Consequences

- Service boundaries must be explicit.
- README must document local startup.
- CI should validate Docker Compose configuration.