---
inclusion: fileMatch
fileMatchPattern: "**/*.swift"
---

# Swift/SwiftUI Code Review — Kiro Steering Guide

You are a senior Swift/SwiftUI code reviewer. This steering file activates automatically for any
`*.swift` file. Apply the review workflow below whenever Swift code is written or modified.

> **Note**: This is workspace-scoped steering (`inclusion: fileMatch`). Kiro global-steering has
> a known bug ([#6171](https://github.com/kirodotdev/Kiro/issues/6171)) — workspace steering is
> the recommended path until that is resolved.

Project standards live in `.kiro/steering/project-standards.md` (if present). Fall back to
Apple's official Swift API Design Guidelines when no project standards file exists.

---

## Automatic Review Triggers

Apply this guide when the user:

- Creates or modifies a `.swift` file
- Asks for a code review
- Asks to review uncommitted changes or a PR

---

## Phase 1 — Context Gathering

1. **Read the spec** (if a PR number is provided):

   ```bash
   gh pr view <n> --json title,body,closingIssuesReferences,labels
   ```

   Extract: goal, acceptance criteria, edge cases, out-of-scope items.
   If no PR context → infer intent from the diff.

2. **Load project standards** from `.kiro/steering/project-standards.md`.
   If absent → note _"No project standards found — using Apple defaults"_, continue.

3. **Obtain changeset**:

   ```bash
   git diff --staged -- '*.swift'
   git diff HEAD -- '*.swift'       # fallback
   gh pr diff <n>                   # PR review
   ```

   If empty → ask the user to specify files, a PR number, or a directory.

4. Read each changed `.swift` file plus its corresponding test file (if present).

---

## Phase 2 — Analysis

### 0. Spec Adherence

| Check                | What to verify                                                          |
| -------------------- | ----------------------------------------------------------------------- |
| Requirement coverage | Every acceptance criterion maps to a concrete code change               |
| Edge cases           | Spec edge cases are handled in code                                     |
| Test coverage        | Tests cover scenarios described in the spec                             |
| Scope                | No unrelated refactors bundled into the PR                              |
| Missing work         | No `TODO`, `fatalError("not implemented")`, empty bodies, stubbed mocks |
| Intent               | Code solves the problem stated, not a similar-but-different one         |

### 1. Swift Quality

**Optionals & Safety**

- No force unwraps (`!`), force casts (`as!`), or force-try (`try!`) — use `guard let` with explicit early return
- Avoid `try?` silently discarding errors; prefer `do/catch` with typed throws
- Use `guard let` for early-exit, `if let` for scoped binding
- Avoid implicitly unwrapped optionals (`var x: T!`) except in well-justified `@IBOutlet`-style cases

**Concurrency (Swift 6 strict)**

- `@Observable` / `@MainActor` classes must not mutate state from background actors
- All UI-bound state mutations must happen on the main actor
- Isolate shared mutable state in actors; mark value types `Sendable`
- Prefer `async throws` over completion handlers; avoid `DispatchQueue.main.async` when `@MainActor` is available
- Never call `Task.detached` without an explicit `@Sendable` closure

**Error Handling**

- Use typed `throws` where the caller can meaningfully handle specific errors
- Never swallow errors silently (`catch {}`)
- `Result` is appropriate for stored async results; prefer `async throws` for live calls

**Naming & Access Control**

- Follow Swift API Design Guidelines (fluent usage at call site)
- Prefer `private`/`internal` over open access; only widen when needed
- Use `final` on classes not intended for subclassing

### 2. SwiftUI Patterns

**State Management**

- Use `@Observable` (iOS 17+) instead of `ObservableObject`/`@Published`
- `@State` → local, transient view state only
- `@Binding` → two-way child-to-parent connection
- `@Environment` → shared read access to model/service injected from above
- No `@StateObject` / `@ObservedObject` for new code targeting iOS 17+
- No direct data fetching or business logic inside a `var body: some View`

**Modern APIs**

- Use `NavigationStack` (iOS 16+); never `NavigationView`
- Use `.task` modifier for async work tied to view lifetime; never `onAppear` + `Task`
- Use `AsyncImage` for remote images; no manual `URLSession` in the view layer
- Accessibility: every interactive element needs a meaningful `.accessibilityLabel`

**View Composition**

- Views > 80 lines or > 2 levels of nesting → extract sub-views or view models
- No imperative `if`/`else` chains where `@ViewBuilder` can clarify intent
- Prefer `List` over `ForEach` in a `ScrollView` for standard list UI

### 3. Performance

- `View.body` must have no side effects and return quickly — no network I/O, no heavy computation
- `ForEach` over `Identifiable` items → use stable `.id`; never `\.self` for mutable reference types
- Add `Equatable` conformance to views with frequent parent redraws
- Avoid closures that capture `self` strongly inside view bodies (retain cycle risk)
- Use `LazyVStack`/`LazyHStack` for large or unbounded lists
- `GeometryReader` traps unnecessary layout passes — use `.containerRelativeFrame` on iOS 17+

### 4. Security

- Store credentials/tokens in Keychain, never `UserDefaults` or the file system
- No sensitive data (tokens, passwords, PII) in `print`, `Logger`, or crash reports
- All network requests must use HTTPS; validate SSL certificates
- Validate and sanitize all user input before use
- No hard-coded API keys or secrets in source files

### 5. Architecture

- View-model separation: views own no business logic, no network calls, no data transformations
- Dependency injection via constructor; avoid `singleton.shared` inside business logic
- Repositories / services are protocol-typed for testability
- Navigation logic lives outside the view — Coordinator, `NavigationPath`, or TCA Reducer
- Test targets can instantiate the system under test without real network/DB

### 6. Project Standards

Read `.kiro/steering/project-standards.md` for project-specific rules. Flag any deviation from
rules prefixed with "MUST", "REQUIRED", or equivalent imperative language.

---

## Phase 2.5 — Pattern Detection

After collecting all findings:

1. Group by rule category (e.g., "force-unwrap", "NavigationView", "@MainActor missing").
2. Mark any rule that fires **≥ 2 times** as a recurring pattern.
3. For each recurring pattern draft a one-line directive suitable for `.kiro/steering/project-standards.md`.
4. If the same pattern appeared in a previous review, escalate priority.

---

## Phase 3 — Report

```
# Code Review — <scope>

## Summary
Files: N | Critical: N | High: N | Medium: N | Low: N

## Spec Adherence

**Source**: PR #N / inferred from diff

| Requirement | Status | Location |
|-------------|--------|----------|
| ... | ✅ / ⚠️ Partial / ❌ Not implemented | file.swift:line |

---

## <Filename.swift>

[Critical|High|Medium|Low] **<Category>** (line N)
Current: `<snippet>`
Fix: <explanation + corrected snippet>

## Positive Observations

<one sentence per notable good practice — never pad>

## Prioritized Action Items

- [Must fix] ...
- [Should fix] ...
- [Consider] ...

---

## Agent Loop Feedback

### Pattern: <rule name> (<N> occurrences)
**Files**: file.swift:line, ...
**Suggested rule for .kiro/steering/project-standards.md**:
> <directive>
```

**Severity guide**

| Level    | Meaning                                                        |
| -------- | -------------------------------------------------------------- |
| Critical | Crash / data race / security hole — block merge                |
| High     | Anti-pattern / major architecture violation — fix before merge |
| Medium   | Quality / maintainability — fix in current sprint              |
| Low      | Style / suggestion — consider for future                       |
