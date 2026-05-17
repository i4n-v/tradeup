# Feature Specification: Mini Binance Trading Platform (Domain)

**Feature Branch**: `001-mini-binance-platform`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "Domain specification for a simple trading platform (Mini Binance): registration, authentication, initial Dashboard with balances and BTC price, BRL/BTC wallet, dynamic BTC price trading, transaction history, profile with avatar; strict business rules, atomic wallet updates, concurrency safety."

## Clarifications

### Session 2026-05-16

- Q: Canonical representation of BRL in the ledger (initial “10,000” interpretation) → A: **BRL amounts use two decimal places (scale 2); initial wallet credit is 10,000.00 BRL.**
- Q: BTC ledger scale and rounding when fixing precision after multiply/divide → A: **BTC uses eight decimal places; round half up at the 8th decimal. BRL derived on SELL uses round half up to two decimal places (consistent with BRL scale 2).**
- Q: Default sort order for transaction history list → A: **Descending by time (newest first).**
- Q: Can the user change their own email from profile in this version? → A: **No — email is immutable after registration for v1; profile is name and avatar only.**
- Q: Precision of quoted/executed BTC price (BRL per 1 BTC) stored on transactions and used in formulas → A: **Two decimal places (BRL scale 2), within the stated min/max band.**
- Q: Avatar image validation limits (media type, size, dimensions) → A: **JPEG, PNG, or WebP; maximum file size 5 MB; maximum dimensions 4096×4096 px.**
- Q: Transaction history listing and pagination → A: **Offset/limit via client `page` and `limit` (1-based `page`); default `limit` 50; `limit` capped at 200; order remains newest first.**
- Q: API authentication using Laravel Sanctum (recommended policy for this product) → A: **Personal Access Tokens (Bearer) via Sanctum for the RN/API client (SPA cookie auth is not the primary path here); token expires seven (7) days after issuance; sign-out revokes that token; no OAuth-style refresh token in v1.**
- Q: When BTC quote is unavailable before trade or Dashboard read → A: **Block trading until a valid quote exists (FR‑012 band); Dashboard shows explicit error/neutral unavailable state—not a fabricated in-band price.**
- Q: Does successful registration return an API auth token? → A: **No — registration creates the user and wallet only; the first Sanctum Bearer token is issued solely from the dedicated sign-in (login) flow.**
- Q: Canonical timezone for stored and API-exposed timestamps → A: **UTC only; ISO 8601 / RFC 3339 with `Z` or explicit `+00:00` offset in API payloads; ordering “newest first” uses this instant.**
- Q: BUY when `amountBRL / price` rounds to zero BTC → A: **Reject BUY (clear error), no debit, no transaction—the executed `btcGain` after FR‑019 rounding MUST be strictly positive (not 0.00000000 BTC).**
- Q: SELL when `amountBTC * price` rounds to zero BRL → A: **Reject SELL (clear error), no wallet change, no transaction—`brlGain` after FR‑023 MUST be strictly greater than 0.00 BRL (not 0.00).**

### Session 2026-05-17 (accepted trade flow — queued settlement)

- BUY/SELL **HTTP acceptance** (**202**) persists a **`transactions`** row **`PENDING`** and enqueues **`ProcessBuyTradeJob`/`ProcessSellTradeJob`**; **`BuyBtc`/`SellBtc`** finalize amounts and move the wallet **inside the worker** (`TransactionManager` + row lock).
- **Sufficient funds** (**FR‑018 / FR‑022**) is asserted **before** enqueue; **422** ⇒ **no** `transactions` row (same UX intent as rejecting overspend pre‑flight).
- **Terminal failure after enqueue** (no quote at execution time, concurrency race lowering balance, rounding to zero equivalent, unexpected errors classified as **`UNKNOWN`**) ⇒ row **`FAILED`**, **`failure_reason`** coded for UX; **`COMPLETED`** only when ledger + immutable amounts match (**FR‑010** invariant).
- **Local dev MUST run a queue worker** alongside HTTP (e.g. **`composer run dev`**, which includes **`queue:listen`**) or **`PENDING`** will not settle.
- **Laravel Horizon**: **not** in current API dependencies — optional enhancement with Redis dashboards later.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register and open an account (Priority: P1)

A new person registers with their name, email, and password. The system creates their account and provisions a single wallet with the defined starting balances.

**Why this priority**: Without an account and wallet, no other capability is usable.

**Independent Test**: Register a new user and confirm they exist with a wallet in the initial state (BRL funded, no BTC); confirm **registration does not activate an authenticated API session** (no Bearer token from register); confirm protected routes remain unauthorized until explicit sign-in succeeds.

**Acceptance Scenarios**:

1. **Given** no existing account for the email, **When** the person submits valid registration details, **Then** the user is created with a unique email, a secured password representation, and exactly one wallet with **BRL balance 10,000.00** (two decimal places) **and BTC balance 0**, **and** the registration response MUST **not** issue a **Sanctum personal access token** (Bearer comes only from sign-in per User Story 2).
2. **Given** an email already registered, **When** the same email is submitted again, **Then** registration is rejected and no duplicate user or wallet is created.
3. **Given** a person who has **just** registered successfully **but not yet signed in**, **When** they call a protected wallet or Dashboard endpoint **without** presenting a token from sign-in, **Then** the request is **unauthorized**.

---

### User Story 2 - Sign in and act as yourself (Priority: P1)

A registered user proves their identity so the system can bind every protected action to that user and block everyone else. **This flow is the sole source of the first Bearer token after account creation** — successful registration alone does not issue a token (see User Story 1).

**Why this priority**: Trading and wallet access must never cross between users.

**Independent Test**: Sign in as user A and confirm all protected operations are attributed to A; verify the Bearer token is required on protected API routes; verify sign-out revokes it; verify expired tokens are refused; verify access without proof of identity is refused.

**Acceptance Scenarios**:

1. **Given** a registered user with correct credentials, **When** they authenticate, **Then** the system issues them a usable **Bearer personal access token** (Sanctum) that remains valid for up to **seven (7) days** from issuance or until invalidated as below.
2. **Given** no valid authenticated context (**missing, malformed, revoked, or expired Bearer token**), **When** the user attempts trade, wallet, history, profile, or Dashboard access, **Then** the system rejects the action as unauthorized.
3. **Given** an authenticated session, **When** the user performs **explicit sign-out** (server-acknowledged), **Then** the **current** Bearer token MUST be revoked and subsequent protected calls MUST fail until a new authentication succeeds.

---

### User Story 3 - Open Dashboard with balances and price (Priority: P1)

An authenticated user opens the primary home screen (Dashboard) and sees their own BRL and BTC balances plus the current BTC price in BRL, so they can decide when to trade.

**Why this priority**: It is the first meaningful post-login experience and the anchor for trading decisions; balances and price must be trustworthy.

**Independent Test**: Sign in and open the Dashboard; verify displayed BRL and BTC match the wallet; verify that when an authoritative BTC quote exists it is within the allowed range (trade execution still locks its own snapshot per existing rules); verify that when no quote exists the UI exposes an explicit unavailable/error state **without** a misleading numeric BTC price.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a wallet **and an authoritative BTC quote obtainable**, **When** they open the Dashboard, **Then** they see their BRL balance, their BTC balance, and the **current BTC price in BRL** satisfying FR-012 bounds.
2. **Given** two different users, **When** each opens their Dashboard, **Then** each sees only their own balances; the other user’s figures never appear.
3. **Given** the wallet changed after a successful trade, **When** the user opens or refreshes the Dashboard, **Then** balances reflect the updated wallet state (consistent with the read moment).
4. **Given** **no authoritative BTC quote** satisfying FR‑012 **can be produced** at Dashboard read time, **When** they open the Dashboard, **Then** wallet balances MAY still appear correctly but the product MUST communicate **explicit price-unavailability** and MUST NOT display **any numeric BTC price purporting** to satisfy FR‑012 (**no fabricated quote**).

---

### User Story 4 - Buy BTC with BRL at the current price (Priority: P1)

An authenticated user spends a chosen BRL amount to acquire BTC using the BTC price that applies at the moment the trade is executed.

**Why this priority**: Core revenue-bearing behavior for the product; correctness failures are unacceptable.

**Independent Test**: With a known price, execute a buy and verify wallet balances and a single immutable transaction recording exact BRL debited, BTC credited, and execution price; verify BUY is rejected **without ledger change** when FR‑019 `btcGain` would round to **0.00000000**.

**Acceptance Scenarios**:

1. **Given** sufficient BRL and a valid positive `amountBRL` such that **`btcGain`** ( **`amountBRL / executionPrice` rounded half up to eight decimals**) is **strictly greater than 0.00000000 BTC**, **When** the user buys BTC, **Then** BRL decreases by `amountBRL`, BTC increases by **`btcGain`**, one BUY transaction exists with those amounts and price, and all updates appear as one consistent state change.
2. **Given** insufficient BRL for the requested spend, **When** the user attempts the buy, **Then** the operation fails, balances are unchanged, and no transaction is created.
3. **Given** zero or negative `amountBRL`, **When** the user attempts the buy, **Then** the operation is rejected with a clear error and no wallet or transaction change.
4. **Given** **no authoritative execution-time BTC quote** satisfying FR‑012 **during settlement**, **When** a BUY already accepted (**HTTP 202**) as **`PENDING`** is processed by the worker, **Then** **`COMPLETED` MUST NOT** occur (**no wallet debit**, no BTC credit); **`FAILED`** MUST reflect quote unavailability (or an equivalent UX-stable coded reason)—ledger outcome equivalent to no executed BUY.

5. **Given** **`amountBRL / executionPrice` rounded half up to eight decimal places** yields **0.00000000 BTC**, **When** they attempt to buy BTC, **Then** the operation is rejected with a clear validation error **with no wallet debit** and **no new transaction.**

---

### User Story 5 - Sell BTC for BRL at the current price (Priority: P1)

An authenticated user sells a chosen BTC amount and receives BRL computed from the execution-time price.

**Why this priority**: Paired with buying; same integrity and safety requirements.

**Independent Test**: With a known price, execute a sell and verify wallet balances and one SELL transaction with exact executed values; verify SELL is rejected **without ledger change** when FR‑023 `brlGain` would round to **0.00 BRL**.

**Acceptance Scenarios**:

1. **Given** sufficient BTC and valid positive `amountBTC` such that **`brlGain`** ( **`amountBTC * executionPrice` rounded half up to two decimals**) is **strictly greater than 0.00 BRL**, **When** the user sells, **Then** BTC decreases by `amountBTC`, BRL increases by **`brlGain`**, one SELL transaction records those exact amounts and price, and wallet state is fully consistent.
2. **Given** insufficient BTC, **When** the user attempts the sell, **Then** the operation fails with balances unchanged and no transaction created.
3. **Given** zero or negative `amountBTC`, **When** the user attempts the sell, **Then** the operation is rejected with a clear error and no state change.
4. **Given** **no authoritative execution-time BTC quote** satisfying FR‑012 **during settlement**, **When** a SELL already accepted (**HTTP 202**) as **`PENDING`** is processed by the worker, **Then** **`COMPLETED` MUST NOT** occur (**no wallet change**); **`FAILED`** MUST reflect quote unavailability (or an equivalent UX-stable coded reason)—ledger outcome equivalent to no executed SELL.
5. **Given** **`amountBTC * executionPrice` rounded half up to two decimal places** yields **0.00 BRL**, **When** they attempt to sell, **Then** the operation is rejected with a clear validation error **with no wallet change** and **no new transaction.**

---

### User Story 6 - See your trade history (Priority: P2)

An authenticated user reviews a **paged list of their own trade records** (**`PENDING`**, **`COMPLETED`**, **`FAILED`**), **newest first**, using client-supplied **`page`** and **`limit`**.

**Why this priority**: Transparency and reconciliation after trading.

**Independent Test**: After trades, list history with valid `page`/`limit` and confirm only records belonging to that user appear; newest trade at top of page 1; **`COMPLETED`** rows match wallet movements; **`FAILED`** rows expose actionable failure context; **`PENDING`** may appear until settlement; invalid paging rejected.

**Acceptance Scenarios**:

1. **Given** a user with past trade activity, **When** they request history with valid **`page`** and **`limit`**, **Then** they see only their transactions for that page **ordered newest to oldest** by **`createdAt` (UTC)**; each item includes **`type`**, **`status`**, **`btcAmount`**, **`brlAmount`**, **`btcPriceBrl`**, optional **`failureReason`** when **`FAILED`**, **`createdAt` (RFC‑3339 with `Z`).
2. **Given** another user’s trades, **When** this user requests history, **Then** those records never appear.
3. **Given** omitted **`page`** or **`limit`**, **When** they request history, **Then** the system applies **default `page` 1** and **default `limit` 50**.
4. **Given** **`limit` greater than 200**, **non-positive `page`**, **non-positive `limit`**, or other invalid paging values, **When** they request history, **Then** the system rejects the request with a clear validation error and returns no rows.

---

### User Story 7 - Update profile name and avatar (Priority: P2)

An authenticated user updates their display name and optional avatar image subject to validation rules (**JPEG, PNG, or WebP**; **≤5 MB**; **≤4096×4096 px**). **Email is not editable** in this version after registration.

**Why this priority**: Identity presentation without weakening security boundaries.

**Independent Test**: Change name and avatar; verify only owner can change their profile; invalid avatar inputs are rejected; **email cannot be changed**.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they update name and a valid image, **Then** stored name and avatar reference update and other users are unaffected.
2. **Given** an invalid image (not **JPEG, PNG, or WebP**; file over **5 MB**; or dimensions over **4096×4096**), **When** submission is attempted, **Then** the system rejects it with a clear error and keeps the prior avatar.
3. **Given** user A, **When** A attempts to change B’s profile, **Then** the operation is blocked.
4. **Given** an authenticated user, **When** they attempt to change their registered email, **Then** the system **does not apply** the change (capability absent or rejected) and email **remains** the original value.

---

### Edge Cases

- **Post-register, pre-login**: user and wallet exist **before** any **Bearer** token; protected API access MUST fail until sign-in issues a token.
- **BTC quote unobtainable** (upstream failure, outage, gap in authority): trading MUST **fail closed** (**no** BUY/SELL succeeds **without** a fresh authoritative quote satisfying FR‑012 **at execution**); Dashboard MUST **not** present a deceptive in-band BTC price (**explicit unavailable/error/neutral state only**; **no** fabricated FR‑012‑compliant numeric display).
- API calls with Bearer token **past `expires_at`**, **revoked**, or **not belonging** to that user MUST be unauthorized; MUST NOT mutate wallet or trades.
- Avatar upload outside allowed bounds: wrong media type (not **JPEG**, **PNG**, or **WebP**), file larger than **5 MB**, or width/height greater than **4096** px — reject; MUST NOT replace the prior avatar.
- Attempt to change email via self-service after registration: **not in scope for v1**; MUST NOT alter stored email.
- Buying with insufficient BRL: reject; no partial debit; no transaction.
- **BUY with dust `amountBRL`**: if **`amountBRL / executionPrice` rounded half up to eight decimals** is **0.00000000**, reject; **no** BRL debit; **no** transaction (**no paying BRL for zero credited BTC**).
- **SELL with dust `amountBTC`**: if **`amountBTC * executionPrice` rounded half up to two decimals** is **0.00 BRL**, reject; **no** BTC debit; **no** transaction (**no selling BTC for zero credited BRL**).
- Selling with insufficient BTC: reject; no partial debit; no transaction.
- Zero or negative trade inputs: reject with validation error.
- BRL trade amounts with more than two decimal places: reject (scale-2 only).
- SELL `amountBTC` with more than eight decimal places: reject (BTC scale-8 only).
- Transaction history paging: **`page`** is **1-based** and MUST be ≥ **1**; **`limit`** is client-supplied, **default 50**, MUST be ≥ **1** and MUST NOT exceed **200**; otherwise reject with validation error.
- Rapid repeated trades or overlapping operations: each completes as if run against authoritative balances; no negative balances; no “lost” or double-applied amounts; order of commits reflects acceptable product semantics (e.g. sequential consistency per wallet).
- Price changes between “view” and “trade”: only the price locked at execution time applies; no retroactive change to past transactions; the Dashboard may show a quote that differs from a later trade’s execution price if the market value moved in between.
- Dashboard read vs wallet mutation: if a trade completes while the user is viewing the Dashboard, the next explicit refresh or navigation MUST be able to show balances consistent with the post-trade wallet (no permanent stale display requirement beyond normal product refresh semantics).
- Precision and rounding: **Execution and quoted BTC prices** are **BRL per 1 BTC with two decimal places** within the allowed band. **BTC** ledger values (`btcAmount`, wallet BTC) use **eight decimal places**, computed with **round half up** at the 8th digit from **BUY** (`amountBRL / price`). **BRL** from **SELL** uses **round half up** to **two decimal places** from (`amountBTC * price`). Stored transaction fields match exactly what was applied to the wallet (no drift).

## Requirements *(mandatory)*

### Functional Requirements

**Identity & access**

- **FR-001**: The system MUST allow registration with name, email, and password; email MUST be unique across all users.
- **FR-001a**: **Registration** MUST persist the new user and wallet but MUST **not** create or return a **Sanctum personal access token** as part of that operation; the client MUST obtain **`Authorization: Bearer`** credentials only through **sign-in** subsequent to successful registration.
- **FR-002**: The system MUST store passwords in a non-reversible form suitable for subsequent verification without ever storing the raw password for display.
- **FR-003**: The system MUST authenticate users before any wallet, trade, transaction history, profile mutation, or access to the Dashboard.
- **FR-004**: Every protected operation MUST execute in a user context that identifies exactly one user; cross-user access MUST be impossible.
- **FR-004a**: The **delivery API** MUST use **Laravel Sanctum personal access tokens**: clients authenticate with **`Authorization: Bearer <token>`** on protected routes. Tokens MUST expire **seven (7) days** after issuance unless revoked sooner. Explicit **sign-out** MUST revoke the token presented for that sign-out operation. Tokens MUST persist server-side such that revocation and expiry are enforced on every protected request (no trusting the client alone).

**User & profile**

- **FR-005**: Each user MUST have: stable identifier, name, email, optional avatar reference, creation timestamp, and exactly one wallet.
- **FR-006**: Users MUST be able to update their own name and avatar only; avatar uploads MUST be **JPEG, PNG, or WebP**; file size MUST NOT exceed **5 MB**; image width and height MUST each be **at most 4096** px; invalid submissions MUST be rejected without corrupting the prior avatar.
- **FR-007**: **Email MUST remain unchanged after successful registration** for **end-user** profile and account flows in this version; profile self-service covers **name and avatar only**. *(Self-service email change, if added later, MUST preserve global uniqueness.)*

**Wallet**

- **FR-008**: On creation, a wallet MUST start with **BRL 10,000.00** and **BTC 0**. **BRL ledger amounts MUST use exactly two decimal places (cent precision).** User-supplied BRL trade amounts with more than two decimal places MUST be rejected.
- **FR-009**: Wallet balances MUST never be negative.
- **FR-010**: Wallet updates MUST be atomic: either all balance changes and the associated transaction for a trade succeed together, or none of them do.
- **FR-011**: The system MUST maintain a last-updated indicator on the wallet that advances when balances change.

**Market price**

- **FR-012**: Any **published numeric BTC–BRL price** used **for Dashboard display** or **for trade execution**, when shown or applied **as the authoritative quote**, MUST satisfy **exactly two decimal places** and **between 200,000.00 and 300,000.00 BRL inclusive** per **1** BTC. The platform MUST NOT **fabricate** such a compliant price when none is **authoritatively obtainable**.
- **FR-012a**: BUY and SELL MUST **not** reach **`COMPLETED`** without an authoritative quote satisfying FR‑012 **during settlement**. The implementation MAY return **HTTP 202**, persist **`PENDING`**, then **`FAIL`** in the worker (**no ledger movement**, **clear failure reason**). It MAY alternatively reject synchronously (**HTTP 422**, **no transaction row**) before enqueue (**same invariant**).
- **FR-013**: The price MAY differ across executions or time; each successful trade MUST snapshot the **execution** price on the transaction record **at two decimal places**, matching the authoritative quote obtained **for that execution**.

**Dashboard (home)**

- **FR-014**: The Dashboard MUST present the authenticated user’s **BRL** balance and **BTC** balance plus **BTC–BRL market context**: **either** a **numeric authoritative price** obeying FR‑012 **when obtainable**, **or**, when unobtainable, an explicit **price-unavailable** treatment that MUST **not** show a deceptive FR‑012‑styled numeric BTC price (**no bogus quote**).
- **FR-015**: Dashboard balances MUST reflect the user’s own wallet only and MUST match authoritative wallet values at the time they are read for that view.
- **FR-016**: When the Dashboard renders a numeric BTC–BRL price, it MUST satisfy FR‑012 at presentation time AND the UX MUST reinforce that trades lock the **execution-moment snapshot** (**may diverge**) if quotes move afterward. When no authoritative BTC–BRL quote satisfying FR‑012 exists at Dashboard read time, numeric price substitution with a fabricated compliant value MUST NOT occur (**see Edge Cases**: quote unobtainable).

**Trading — BUY**

- **FR-017**: BUY input MUST be a single positive BRL spend amount; non-positive values MUST be rejected.
- **FR-018**: BUY MUST verify available BRL is at least the spend amount before any balance movement.
- **FR-019**: **BTC acquired** (`btcGain`) MUST equal **`amountBRL / executionPrice` rounded half up to exactly eight decimal places** (Scale-8 **round half up**). Intermediate precision MUST be sufficient that this rounding is deterministic and reproducible. If **`btcGain`** equals **0.00000000**, BUY MUST be rejected with a clear error (**no** wallet change, **no** transaction)—every successful BUY **MUST have** **`btcGain` strictly greater than 0.00000000 BTC**.
- **FR-020**: On successful BUY, wallet MUST decrease BRL by the spend amount and increase BTC by the executed BTC amount; exactly one BUY transaction MUST be created with user, type BUY, `btcAmount`, `brlAmount` (spend), `price` (execution), and `createdAt`.

**Trading — SELL**

- **FR-021**: SELL input MUST be a single positive BTC amount with **at most eight decimal places**; non-positive values or higher precision MUST be rejected.
- **FR-022**: SELL MUST verify available BTC is at least the sold amount before any balance movement.
- **FR-023**: **BRL received** (`brlGain`) MUST equal **`amountBTC * executionPrice` rounded half up to exactly two decimal places** (Scale-2 **round half up**, consistent with BRL ledger rules). If **`brlGain`** equals **0.00**, SELL MUST be rejected with a clear error (**no** wallet change, **no** transaction)—every successful SELL **MUST have** **`brlGain` strictly greater than 0.00 BRL**.
- **FR-024**: On successful SELL, wallet MUST decrease BTC by the sold amount and increase BRL by the executed BRL amount; exactly one SELL transaction MUST be created with user, type SELL, matching amounts and execution price.

**Transactions & history**

- **FR-025**: Every successful **`COMPLETED`** trade MUST correspond to exactly one immutable terminal transaction row aligned with FR‑026; **`PENDING`/`FAILED`** lifecycle rows MAY exist for accepted or failed executions; **rejections before enqueue** (validation, insufficient balance, deterministic dust per FR‑019/FR‑023) MUST create **no** row.
- **FR-026**: **`COMPLETED`** transaction rows MUST remain immutable (**amounts**, **`btc_price_brl`**, **`COMPLETED`** status) **after execution**; **`PENDING`** rows MAY mutate to **`COMPLETED`** or **`FAILED`** with optional **`failure_reason`** when settlement finishes.
- **FR-031**: All **persisted clock instants** exposed through the API (**including** **`Transaction.createdAt`**, **`User.createdAt`**, **`Wallet.updatedAt`**, token **`expires_at`** when returned) MUST be **UTC**. Serialized values MUST use **RFC 3339 / ISO 8601** with an explicit UTC indicator (**suffix `Z`** or **`+00:00`**). Listing and sort order (**e.g.** FR‑027 newest-first) MUST use **the same canonical UTC instant** without depending on client local zones.
- **FR-027**: Users MUST be able to list only their own transactions ordered by execution time **descending (newest first)**. The listing API MUST accept client **`page`** and **`limit`** parameters: **`page`** is **1-based** and defaults to **1** when omitted; **`limit`** defaults to **50** when omitted, MUST be at least **1**, and MUST NOT exceed **200**; invalid combinations MUST be rejected with a clear validation error. Each response MUST contain at most **`limit`** rows for the requested **`page`**.

**Validation & errors**

- **FR-028**: All inputs MUST be validated before side effects; invalid operations MUST fail with clear, user-appropriate errors without partial updates.
- **FR-029**: The system MUST prevent concurrent trade operations from producing negative balances, double spending the same funds, or transaction records that do not match final wallet state.
- **FR-030**: All **BTC** amounts held in wallet or recorded as `btcAmount` on transactions MUST be expressed with **at most eight decimal places**; normalized display MUST not alter stored ledger values.

### Key Entities *(include if feature involves data)*

- **User**: Account for one person; attributes include identifier, name, unique email (immutable for the user after registration in v1), secured password material, optional avatar reference (uploads: **JPEG/PNG/WebP**, **≤5 MB**, **≤4096×4096** px), **created-at (UTC)**; owns exactly one **Wallet**.
- **Wallet**: Holds **BRL** (scale **2**, half up when rounding to this scale) and **BTC** (scale **8**, half up when rounding to this scale) for one user; attributes include user reference, BRL balance, BTC balance, **updated-at (UTC)**; subject to non-negative invariants and atomic updates.
- **Transaction**: Record of **one BUY or one SELL** with lifecycle **`status`**: **`PENDING`** (accepted, settlement queued), **`COMPLETED`** (wallet movements applied in settlement; aligns with FR‑026), or **`FAILED`** (**`failure_reason`**: stable machine-readable code mapped to UX). Holds type (BUY/SELL), `btcAmount`, `brlAmount`, `btc_price_brl` (**two decimals** when **`COMPLETED`**; placeholders while **`PENDING`**), **`createdAt`** (**UTC**) for ordering (FR‑027); users retrieve via **`page`/`limit`**.
- **MarketPrice (concept)**: **Authoritative** **BRL per 1 BTC** quote **when obtainable**, **two decimal places**, constrained **from 200,000.00 through 300,000.00 inclusive**—used when settling a **`COMPLETED`** trade and optionally on the Dashboard whenever a numeric compliant quote is surfaced; **`COMPLETED`** never occurs without authority at settlement (FR‑012a); the Dashboard MUST **never** synthesize FR‑012‑compliant numbers when none exists; each **`COMPLETED` `Transaction`** stores the execution **`btc_price_brl`** snapshot at that scale.

**Relationships**: User 1—1 Wallet; User 1—* Transaction; each Transaction references exactly one User.

### Domain Relationships & Invariants

- One user, one wallet: creation and deletion rules MUST preserve this pairing; no orphan wallets and no second wallet per user.
- **Invariants**: Balances ≥ 0; sum of ledger movements for a trade matches the single transaction row; execution price on the transaction equals the price rule output at commit time.
- **Authorization boundary**: Profile and wallet visibility scoped to the owning user; the Dashboard and trading flows MAY expose the current BTC price to authenticated users; market data MUST not reveal other users’ balances or positions.

### State Transitions (Trading)

**Before BUY (sketch)**  
Wallet: `(brl, btc)`; valid request `amountBRL > 0`, `brl ≥ amountBRL`; **`p`** = execution price **in BRL per 1 BTC, two decimal places**, with **200,000.00 ≤ p ≤ 300,000.00**.  
Compute `btcGain =` **`amountBRL / p` rounded half up to 8 decimal places**; **`btcGain` MUST be strictly positive** for commit—otherwise BUY fails (**no** state change).

**After successful BUY**  
Wallet: `(brl - amountBRL, btc + btcGain)`; new **Transaction**(BUY, btcGain, amountBRL, **`p`**).

**Before SELL**  
Wallet: `(brl, btc)`; valid request `amountBTC > 0`, `btc ≥ amountBTC`; **`p`** as above.  
Compute `brlGain =` **`amountBTC * p` rounded half up to 2 decimal places**; **`brlGain` MUST be strictly greater than 0.00 BRL** for commit—otherwise SELL fails (**no** state change).

**After successful SELL**  
Wallet: `(brl + brlGain, btc - amountBTC)`; new **Transaction**(SELL, amountBTC, brlGain, **`p`**).

**Failed attempt**  
Wallet and transaction set unchanged from pre-attempt state (**includes refusal when no authoritative quote per FR‑012a**, **or BUY when computed `btcGain` is 0.00000000 per FR‑019**, **or SELL when computed `brlGain` is 0.00 per FR‑023**).

## Non-Functional Requirements *(mandatory when UI, auth, data, or network behavior changes)*

- **NFR-001**: Under concurrent trading activity on the same account, the system MUST preserve wallet invariants and exact alignment between each committed transaction and the wallet state (no inconsistent intermediate states observable to the user).
- **NFR-002**: Secrets and personally identifiable information MUST be protected: credentials must not be exposed in history or logs; users must only retrieve their own sensitive data. **Bearer tokens** MUST appear **only once** when issued (plain text shown to client at creation only as per Sanctum’s usual flow); MUST NOT appear in URLs or logs.
- **NFR-003**: Trade confirmation and history views MUST present amounts and prices in forms exact to the stored transactional truth (no misleading rounding in summarized views beyond clearly labeled display conventions).
- **NFR-004**: Profile and trading flows MUST expose validation failures in time for the user to correct inputs without side effects.
- **NFR-005**: The Dashboard MUST not display another user’s wallet figures; any loading or error state for balances or price MUST avoid leaking whether other accounts exist or their activity; **BTC price‑unavailability** MUST be surfaced without inventing plausible band‑compliant numbers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In defined acceptance-test scenarios covering buys, sells, insufficient funds, invalid inputs, and concurrent requests, 100% of outcomes show either successful atomic commit with matching wallet and transaction data, or full rejection with zero balance change and no new transaction.
- **SC-002**: 100% of historical records shown to a user belong to that user and match immutable transaction data.
- **SC-003**: For a sample of trades, recomputing BRL/BTC from stored price and amounts using the published rounding rules yields exactly the stored ledger amounts (zero mismatches).
- **SC-004**: New users complete registration and reach a tradable wallet state in one session without manual intervention (target: at least 95% success rate in usability tests once the product channel exists).
- **SC-005**: After sign-in, at least 90% of test participants reach the Dashboard and correctly identify **their** BRL balance, **their** BTC balance, and—in runs where FR‑012 price is obtainable—the **shown** BTC‑BRL price in a single pass (moderated usability or benchmark scenario).

## Assumptions

- **BRL canonical model**: All BRL amounts in wallet and transactions **MUST** be expressed with **two fractional digits** (e.g. initial credit **10,000.00 BRL**). BUY spend inputs **MUST** respect this precision. **BRL received on SELL** MUST be **`amountBTC * price` rounded half up to two decimal places** and **must not be 0.00 on committed SELL** (**FR‑023**)—symmetric refusal with BUY dust (**FR‑019**).

- **BTC canonical model**: **BTC** wallet balances and `btcAmount` on transactions **MUST** use **eight decimal places**. **BTC acquired on BUY** MUST be **`amountBRL / price` rounded half up to eight decimal places.** SELL input `amountBTC` MUST already respect eight-decimal precision or be rejected. **BUY commits** (**FR‑019**) **MUST NOT** succeed when rounded **`btcGain`** is **0.00000000** (**no charging BRL for zero credited BTC**).

- **BTC price quote model**: Whenever the platform obtains a BTC–BRL quote for display or execution, it **MUST** meet **two decimal places** and the **fixed min/max band** (FR‑012). **Failures to obtain quote** ⇒ **blocked trades** (**FR‑012a**) and Dashboard **explicit unavailability**, **never** deceptive synthetic prices.
- **Email**: Set only at registration; **must not** be changed by the user through profile in v1.
- **Avatar uploads**: **JPEG, PNG, or WebP** only; **maximum 5 MB**; **maximum 4096×4096** pixels per dimension.
- **Transaction history listing**: Returned in pages; client sends **`page`** (1-based, default **1**) and **`limit`** (default **50**, maximum **200**); **newest first** within each response.
- **API authentication**: **Laravel Sanctum** personal access tokens; **Bearer** header on native client calls; **`expires_at` seven (7) days** after issuance; **logout revokes** the current token; **no OAuth-style refresh token** in **v1** (new sessions require issuing a new token via authenticated login).
- **Registration vs sign-in**: **Register** establishes identity and wallet **without token**; **sign-in** is the exclusive route to the first Bearer token after account creation (**FR‑001a**, User Stories 1–2).
- **Timestamps**: Persist and expose **UTC** only in the API (**FR‑031**); clients MAY render in the user’s local timezone **only as presentation**.
- Deposits, withdrawals, KYC, multiple trading pairs, order books, limits, fees, and password recovery are out of scope unless added in a later specification.
- The mechanism that produces the current BTC price within the allowed range is internal to the platform; only the bounded, execution-time behavior is specified here.
