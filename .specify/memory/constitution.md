<!--
Sync Impact Report
- Version change: unversioned template → 1.0.0
- Principles: Initial adoption (placeholders replaced with eight core principles)
- Added sections: Repository Context & Stack; Development Workflow & Quality Gates
- Removed sections: none
- Templates: .specify/templates/plan-template.md ✅ | .specify/templates/spec-template.md ✅ |
  .specify/templates/tasks-template.md ✅ | .cursor/commands/*.md ✅ (no constitution-specific edits required)
- Follow-up TODOs: none
-->

# Trade Up Constitution

## Core Principles

### I. Code Quality & Craft

- Code MUST be readable, consistent with project conventions, and free of preventable defects before merge.
- Static analysis, formatting, and type checks applicable to the stack MUST pass in CI for protected branches.
- Public contracts (APIs, DTOs, events, navigation) MUST be explicit; “magic” behavior MUST be documented or removed.
- **Rationale**: Predictable structure reduces regressions and speeds reviews across mobile and API codebases.

### II. Testing Discipline

- Automated tests MUST accompany behavior changes unless the spec or plan records a justified, time-bounded exception.
- Tests MUST be deterministic, isolated, and aligned with the project’s layers (domain, integration, contract, UI as applicable).
- Critical paths (auth, money movement, data loss, permissions) MUST have regression coverage before release.
- **Rationale**: Fast feedback preserves velocity without trading reliability.

### III. Performance & Efficiency

- Features MUST meet declared budgets for latency, memory, frame time, and battery impact; gaps MUST be measured, not assumed.
- Work on hot paths MUST avoid unnecessary re-renders, redundant network calls, and blocking the UI thread.
- Caching, pagination, and background work MUST be used where data or media scales beyond trivial sizes.
- **Rationale**: Mobile users experience performance as part of product quality.

### IV. Security & Privacy

- Secrets MUST NOT be committed; configuration MUST use secure channels and least-privilege access.
- All remote calls that handle identity or sensitive data MUST use TLS and validated server trust as appropriate to the platform.
- Input MUST be validated; output MUST be encoded safely; authorization MUST be enforced server-side with client checks as UX only.
- Data collection, storage, and retention MUST follow documented policies and platform requirements.
- **Rationale**: Trust and compliance are non-negotiable for financial and personal data.

### V. Mobile UI/UX Excellence

- Interfaces MUST follow platform-appropriate patterns, spacing, and motion; designs MUST be responsive to device size and orientation where supported.
- Loading, empty, and error states MUST be intentional; destructive actions MUST be confirmed or reversible.
- Copy MUST be clear and localized when the product ships multiple languages.
- **Rationale**: Polished mobile UX converts requirements into usable, reviewable product behavior.

### VI. Maintainability & Evolvability

- Modules MUST have a single clear purpose; duplication MUST be factored when it hides business rules.
- Dead code and unused assets MUST be removed or tracked with an issue; migrations MUST include roll-forward or safe-back plans when applicable.
- Documentation and diagrams MUST update when architecture or workflows change in ways that affect contributors.
- **Rationale**: Maintainability pays down future cost across `tradeup-app` and `tradeup-api`.

### VII. Accessibility

- Interactive elements MUST expose correct roles, names, and values for assistive technologies on each supported platform.
- Color contrast, touch targets, and focus order MUST meet or exceed platform accessibility guidelines for shipped screens.
- Motion-sensitive alternatives MUST exist for essential flows when reduced motion is requested.
- **Rationale**: Accessible products serve more users and reduce legal and reputational risk.

### VIII. Decoupling & Boundaries

- UI MUST depend on explicit interfaces for network, storage, analytics, and feature flags—not concrete implementations.
- Cross-cutting concerns MUST be composed via established patterns rather than reaching through layers.
- Shared contracts between mobile and API MUST be versioned or backwards-compatible; breaking changes MUST be coordinated and released safely.
- **Rationale**: Loose coupling enables parallel work and safer evolution of client and server.

## Repository Context & Stack

- Primary mobile client: `tradeup-app` (React Native). Primary backend: `tradeup-api` (Laravel/PHP).
- Constitution principles apply to both codebases unless a spec explicitly scopes an exception with rationale.
- Feature plans MUST name the directories, packages, or modules touched and any new dependencies with security review notes when relevant.

## Development Workflow & Quality Gates

- Pull requests MUST describe scope, risk, test evidence, and any performance or security considerations impacted.
- Reviewers MUST verify adherence to Core Principles for files in scope; violations require documented justification in the PR or linked plan.
- Feature specs and plans MUST call out mobile UX states, accessibility expectations, and data-handling boundaries when applicable.
- Releases MUST not proceed with known open critical issues in authentication, data integrity, or unmitigated security findings.

## Governance

- This constitution supersedes conflicting local practices when delivering work in this repository.
- Amendments require an update to `.specify/memory/constitution.md`, a version bump, `Last Amended` date refresh, and propagation review of dependent Spec Kit templates.
- **Semantic versioning** for this document: MAJOR for breaking or removed principles; MINOR for new principles or materially expanded obligations; PATCH for clarifications without new obligations.
- Compliance with accessibility, security, and testing principles SHOULD be revisited on a recurring cadence during release planning; gaps MUST be tracked with owners and dates.

**Version**: 1.0.0 | **Ratified**: 2026-05-16 | **Last Amended**: 2026-05-16
