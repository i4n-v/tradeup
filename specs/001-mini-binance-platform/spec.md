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

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register and open an account (Priority: P1)

A new person registers with their name, email, and password. The system creates their account and provisions a single wallet with the defined starting balances.

**Why this priority**: Without an account and wallet, no other capability is usable.

**Independent Test**: Register a new user and confirm they exist with a wallet in the initial state (BRL funded, no BTC).

**Acceptance Scenarios**:

1. **Given** no existing account for the email, **When** the person submits valid registration details, **Then** the user is created with a unique email, a secured password representation, and exactly one wallet with **BRL balance 10,000.00** (two decimal places) **and BTC balance 0**.
2. **Given** an email already registered, **When** the same email is submitted again, **Then** registration is rejected and no duplicate user or wallet is created.

---

### User Story 2 - Sign in and act as yourself (Priority: P1)

A registered user proves their identity so the system can bind every protected action to that user and block everyone else.

**Why this priority**: Trading and wallet access must never cross between users.

**Independent Test**: Sign in as user A and confirm all protected operations are attributed to A; attempt access without proof of identity and confirm refusal.

**Acceptance Scenarios**:

1. **Given** a registered user with correct credentials, **When** they authenticate, **Then** the system establishes an authenticated context for that user until sign-out or expiry per product rules.
2. **Given** no authenticated context, **When** the user attempts trade, wallet, history, profile, or Dashboard access, **Then** the system rejects the action as unauthorized.

---

### User Story 3 - Open Dashboard with balances and price (Priority: P1)

An authenticated user opens the primary home screen (Dashboard) and sees their own BRL and BTC balances plus the current BTC price in BRL, so they can decide when to trade.

**Why this priority**: It is the first meaningful post-login experience and the anchor for trading decisions; balances and price must be trustworthy.

**Independent Test**: Sign in and open the Dashboard; verify displayed BRL and BTC match the wallet and the shown price is within the allowed range and suitable for user awareness (trade still locks price at execution per existing rules).

**Acceptance Scenarios**:

1. **Given** an authenticated user with a wallet, **When** they open the Dashboard, **Then** they see their BRL balance, their BTC balance, and the current BTC price in BRL (within the product’s allowed price bounds).
2. **Given** two different users, **When** each opens their Dashboard, **Then** each sees only their own balances; the other user’s figures never appear.
3. **Given** the wallet changed after a successful trade, **When** the user opens or refreshes the Dashboard, **Then** balances reflect the updated wallet state (consistent with the read moment).

---

### User Story 4 - Buy BTC with BRL at the current price (Priority: P1)

An authenticated user spends a chosen BRL amount to acquire BTC using the BTC price that applies at the moment the trade is executed.

**Why this priority**: Core revenue-bearing behavior for the product; correctness failures are unacceptable.

**Independent Test**: With a known price, execute a buy and verify wallet balances and a single immutable transaction recording exact BRL debited, BTC credited, and execution price.

**Acceptance Scenarios**:

1. **Given** sufficient BRL and a valid positive `amountBRL`, **When** the user buys BTC, **Then** BRL decreases by `amountBRL`, BTC increases by `amountBRL / executionPrice`, one BUY transaction exists with those amounts and price, and all updates appear as one consistent state change.
2. **Given** insufficient BRL for the requested spend, **When** the user attempts the buy, **Then** the operation fails, balances are unchanged, and no transaction is created.
3. **Given** zero or negative `amountBRL`, **When** the user attempts the buy, **Then** the operation is rejected with a clear error and no wallet or transaction change.

---

### User Story 5 - Sell BTC for BRL at the current price (Priority: P1)

An authenticated user sells a chosen BTC amount and receives BRL computed from the execution-time price.

**Why this priority**: Paired with buying; same integrity and safety requirements.

**Independent Test**: With a known price, execute a sell and verify wallet balances and one SELL transaction with exact executed values.

**Acceptance Scenarios**:

1. **Given** sufficient BTC and valid positive `amountBTC`, **When** the user sells, **Then** BTC decreases by `amountBTC`, BRL increases by `amountBTC * executionPrice`, one SELL transaction records exact amounts and price, and wallet state is fully consistent.
2. **Given** insufficient BTC, **When** the user attempts the sell, **Then** the operation fails with balances unchanged and no transaction created.
3. **Given** zero or negative `amountBTC`, **When** the user attempts the sell, **Then** the operation is rejected with a clear error and no state change.

---

### User Story 6 - See your trade history (Priority: P2)

An authenticated user reviews a **chronological list of their own completed trades**, **newest first**.

**Why this priority**: Transparency and reconciliation after trading.

**Independent Test**: After trades, list history and confirm only records belonging to that user appear, each immutable and matching wallet movements, with the latest trade at the top.

**Acceptance Scenarios**:

1. **Given** a user with past trades, **When** they request history, **Then** they see only their transactions **ordered from newest to oldest by execution time**, with type (BUY or SELL), BTC amount, BRL amount, price, and timestamp.
2. **Given** another user’s trades, **When** this user requests history, **Then** those records never appear.

---

### User Story 7 - Update profile name and avatar (Priority: P2)

An authenticated user updates their display name and optional avatar image subject to validation rules. **Email is not editable** in this version after registration.

**Why this priority**: Identity presentation without weakening security boundaries.

**Independent Test**: Change name and avatar; verify only owner can change their profile; invalid avatar inputs are rejected; **email cannot be changed**.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they update name and a valid image, **Then** stored name and avatar reference update and other users are unaffected.
2. **Given** an invalid image (type or size outside allowed bounds), **When** submission is attempted, **Then** the system rejects it with a clear error and keeps the prior avatar.
3. **Given** user A, **When** A attempts to change B’s profile, **Then** the operation is blocked.
4. **Given** an authenticated user, **When** they attempt to change their registered email, **Then** the system **does not apply** the change (capability absent or rejected) and email **remains** the original value.

---

### Edge Cases

- Attempt to change email via self-service after registration: **not in scope for v1**; MUST NOT alter stored email.
- Buying with insufficient BRL: reject; no partial debit; no transaction.
- Selling with insufficient BTC: reject; no partial debit; no transaction.
- Zero or negative trade inputs: reject with validation error.
- BRL trade amounts with more than two decimal places: reject (scale-2 only).
- SELL `amountBTC` with more than eight decimal places: reject (BTC scale-8 only).
- Rapid repeated trades or overlapping operations: each completes as if run against authoritative balances; no negative balances; no “lost” or double-applied amounts; order of commits reflects acceptable product semantics (e.g. sequential consistency per wallet).
- Price changes between “view” and “trade”: only the price locked at execution time applies; no retroactive change to past transactions; the Dashboard may show a quote that differs from a later trade’s execution price if the market value moved in between.
- Dashboard read vs wallet mutation: if a trade completes while the user is viewing the Dashboard, the next explicit refresh or navigation MUST be able to show balances consistent with the post-trade wallet (no permanent stale display requirement beyond normal product refresh semantics).
- Precision and rounding: **Execution and quoted BTC prices** are **BRL per 1 BTC with two decimal places** within the allowed band. **BTC** ledger values (`btcAmount`, wallet BTC) use **eight decimal places**, computed with **round half up** at the 8th digit from **BUY** (`amountBRL / price`). **BRL** from **SELL** uses **round half up** to **two decimal places** from (`amountBTC * price`). Stored transaction fields match exactly what was applied to the wallet (no drift).

## Requirements *(mandatory)*

### Functional Requirements

**Identity & access**

- **FR-001**: The system MUST allow registration with name, email, and password; email MUST be unique across all users.
- **FR-002**: The system MUST store passwords in a non-reversible form suitable for subsequent verification without ever storing the raw password for display.
- **FR-003**: The system MUST authenticate users before any wallet, trade, transaction history, profile mutation, or access to the Dashboard.
- **FR-004**: Every protected operation MUST execute in a user context that identifies exactly one user; cross-user access MUST be impossible.

**User & profile**

- **FR-005**: Each user MUST have: stable identifier, name, email, optional avatar reference, creation timestamp, and exactly one wallet.
- **FR-006**: Users MUST be able to update their own name and avatar only; avatar content MUST satisfy agreed size and media-type constraints; invalid submissions MUST be rejected without corrupting the prior avatar.
- **FR-007**: **Email MUST remain unchanged after successful registration** for **end-user** profile and account flows in this version; profile self-service covers **name and avatar only**. *(Self-service email change, if added later, MUST preserve global uniqueness.)*

**Wallet**

- **FR-008**: On creation, a wallet MUST start with **BRL 10,000.00** and **BTC 0**. **BRL ledger amounts MUST use exactly two decimal places (cent precision).** User-supplied BRL trade amounts with more than two decimal places MUST be rejected.
- **FR-009**: Wallet balances MUST never be negative.
- **FR-010**: Wallet updates MUST be atomic: either all balance changes and the associated transaction for a trade succeed together, or none of them do.
- **FR-011**: The system MUST maintain a last-updated indicator on the wallet that advances when balances change.

**Market price**

- **FR-012**: The system MUST expose a current BTC price in BRL for every trade execution and for Dashboard display, **with exactly two decimal places**, and **MUST** always fall **between 200,000.00 and 300,000.00 BRL inclusive** per **1** BTC at the time the quote applies.
- **FR-013**: The price MAY differ across executions or time; each trade MUST snapshot the **execution** price on the transaction record **at two decimal places**, matching the authoritative quote used for that trade’s calculations.

**Dashboard (home)**

- **FR-014**: The system MUST provide an initial **Dashboard** (primary home after authentication) that presents the authenticated user’s BRL balance, BTC balance, and the current BTC price in BRL.
- **FR-015**: Dashboard balances MUST reflect the user’s own wallet only and MUST match authoritative wallet values at the time they are read for that view.
- **FR-016**: The BTC price shown on the Dashboard MUST satisfy the same allowed range as execution-time quotes (see FR-012) at the moment it is supplied for display; the product MUST make clear that a subsequent trade applies the price locked at trade execution, which may differ if the quote moves.

**Trading — BUY**

- **FR-017**: BUY input MUST be a single positive BRL spend amount; non-positive values MUST be rejected.
- **FR-018**: BUY MUST verify available BRL is at least the spend amount before any balance movement.
- **FR-019**: **BTC acquired** MUST equal **`amountBRL / executionPrice` rounded half up to exactly eight decimal places** (Scale-8 **round half up**). Intermediate precision MUST be sufficient that this rounding is deterministic and reproducible.
- **FR-020**: On successful BUY, wallet MUST decrease BRL by the spend amount and increase BTC by the executed BTC amount; exactly one BUY transaction MUST be created with user, type BUY, `btcAmount`, `brlAmount` (spend), `price` (execution), and `createdAt`.

**Trading — SELL**

- **FR-021**: SELL input MUST be a single positive BTC amount with **at most eight decimal places**; non-positive values or higher precision MUST be rejected.
- **FR-022**: SELL MUST verify available BTC is at least the sold amount before any balance movement.
- **FR-023**: **BRL received** MUST equal **`amountBTC * executionPrice` rounded half up to exactly two decimal places** (Scale-2 **round half up**, consistent with BRL ledger rules).
- **FR-024**: On successful SELL, wallet MUST decrease BTC by the sold amount and increase BRL by the executed BRL amount; exactly one SELL transaction MUST be created with user, type SELL, matching amounts and execution price.

**Transactions & history**

- **FR-025**: Every successful trade MUST create exactly one immutable transaction; failed trades MUST create none.
- **FR-026**: Transaction records MUST be immutable after creation and MUST store exact executed `btcAmount`, `brlAmount`, and `price`.
- **FR-027**: Users MUST be able to list only their own transactions ordered by execution time **descending (newest first)**.

**Validation & errors**

- **FR-028**: All inputs MUST be validated before side effects; invalid operations MUST fail with clear, user-appropriate errors without partial updates.
- **FR-029**: The system MUST prevent concurrent trade operations from producing negative balances, double spending the same funds, or transaction records that do not match final wallet state.
- **FR-030**: All **BTC** amounts held in wallet or recorded as `btcAmount` on transactions MUST be expressed with **at most eight decimal places**; normalized display MUST not alter stored ledger values.

### Key Entities *(include if feature involves data)*

- **User**: Account for one person; attributes include identifier, name, unique email (immutable for the user after registration in v1), secured password material, optional avatar reference, created-at; owns exactly one **Wallet**.
- **Wallet**: Holds **BRL** (scale **2**, half up when rounding to this scale) and **BTC** (scale **8**, half up when rounding to this scale) for one user; attributes include user reference, BRL balance, BTC balance, updated-at; subject to non-negative invariants and atomic updates.
- **Transaction**: Immutable record of one completed trade; attributes include identifier, user reference, type (BUY or SELL), BTC amount, BRL amount, **execution `price` (BRL per BTC, two decimal places)**, created-at; always paired 1:1 with a successful trade.
- **MarketPrice (concept)**: Authoritative **BRL per 1 BTC** at execution or display time, **scale 2 decimal places**, constrained **from 200,000.00 through 300,000.00 BRL inclusive**; each **Transaction** stores the **execution** snapshot at that scale.

**Relationships**: User 1—1 Wallet; User 1—* Transaction; each Transaction references exactly one User.

### Domain Relationships & Invariants

- One user, one wallet: creation and deletion rules MUST preserve this pairing; no orphan wallets and no second wallet per user.
- **Invariants**: Balances ≥ 0; sum of ledger movements for a trade matches the single transaction row; execution price on the transaction equals the price rule output at commit time.
- **Authorization boundary**: Profile and wallet visibility scoped to the owning user; the Dashboard and trading flows MAY expose the current BTC price to authenticated users; market data MUST not reveal other users’ balances or positions.

### State Transitions (Trading)

**Before BUY (sketch)**  
Wallet: `(brl, btc)`; valid request `amountBRL > 0`, `brl ≥ amountBRL`; **`p`** = execution price **in BRL per 1 BTC, two decimal places**, with **200,000.00 ≤ p ≤ 300,000.00**.  
Compute `btcGain =` **`amountBRL / p` rounded half up to 8 decimal places**.

**After successful BUY**  
Wallet: `(brl - amountBRL, btc + btcGain)`; new **Transaction**(BUY, btcGain, amountBRL, **`p`**).

**Before SELL**  
Wallet: `(brl, btc)`; valid request `amountBTC > 0`, `btc ≥ amountBTC`; **`p`** as above.  
Compute `brlGain =` **`amountBTC * p` rounded half up to 2 decimal places**.

**After successful SELL**  
Wallet: `(brl + brlGain, btc - amountBTC)`; new **Transaction**(SELL, amountBTC, brlGain, **`p`**).

**Failed attempt**  
Wallet and transaction set unchanged from pre-attempt state.

## Non-Functional Requirements *(mandatory when UI, auth, data, or network behavior changes)*

- **NFR-001**: Under concurrent trading activity on the same account, the system MUST preserve wallet invariants and exact alignment between each committed transaction and the wallet state (no inconsistent intermediate states observable to the user).
- **NFR-002**: Secrets and personally identifiable information MUST be protected: credentials must not be exposed in history or logs; users must only retrieve their own sensitive data.
- **NFR-003**: Trade confirmation and history views MUST present amounts and prices in forms exact to the stored transactional truth (no misleading rounding in summarized views beyond clearly labeled display conventions).
- **NFR-004**: Profile and trading flows MUST expose validation failures in time for the user to correct inputs without side effects.
- **NFR-005**: The Dashboard MUST not display another user’s wallet figures; any loading or error state for balances or price MUST avoid leaking whether other accounts exist or their activity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In defined acceptance-test scenarios covering buys, sells, insufficient funds, invalid inputs, and concurrent requests, 100% of outcomes show either successful atomic commit with matching wallet and transaction data, or full rejection with zero balance change and no new transaction.
- **SC-002**: 100% of historical records shown to a user belong to that user and match immutable transaction data.
- **SC-003**: For a sample of trades, recomputing BRL/BTC from stored price and amounts using the published rounding rules yields exactly the stored ledger amounts (zero mismatches).
- **SC-004**: New users complete registration and reach a tradable wallet state in one session without manual intervention (target: at least 95% success rate in usability tests once the product channel exists).
- **SC-005**: After sign-in, at least 90% of test participants reach the Dashboard and correctly identify their BRL balance, BTC balance, and the shown BTC price in a single pass (moderated usability or benchmark scenario).

## Assumptions

- **BRL canonical model**: All BRL amounts in wallet and transactions **MUST** be expressed with **two fractional digits** (e.g. initial credit **10,000.00 BRL**). BUY spend inputs **MUST** respect this precision. **BRL received on SELL** MUST be **`amountBTC * price` rounded half up to two decimal places.**

- **BTC canonical model**: **BTC** wallet balances and `btcAmount` on transactions **MUST** use **eight decimal places**. **BTC acquired on BUY** MUST be **`amountBRL / price` rounded half up to eight decimal places.** SELL input `amountBTC` MUST already respect eight-decimal precision or be rejected.

- **BTC price quote model**: **BRL per 1 BTC** for execution, storage on transactions, and Dashboard display **MUST** use **two decimal places** and lie **from 200,000.00 through 300,000.00 BRL inclusive** whenever a valid quote is produced.
- **Email**: Set only at registration; **must not** be changed by the user through profile in v1.
- Authentication “expiry or sign-out” details are product policy but do not change the requirement that protected actions always require a valid user context.
- Deposits, withdrawals, KYC, multiple trading pairs, order books, limits, fees, and password recovery are out of scope unless added in a later specification.
- The mechanism that produces the current BTC price within the allowed range is internal to the platform; only the bounded, execution-time behavior is specified here.
