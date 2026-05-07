# Swift/SwiftUI Code Review Skill

Multi-layer review covering Swift 6+ concurrency, SwiftUI patterns, performance, security, architecture, and project-specific standards. Reads `<PROJECT_STANDARDS_FILE>` and outputs Critical/High/Medium/Low severity findings with `file:line` references and before/after code examples.

<!-- TOKEN LEGEND (for wrapper authors)
  <PROJECT_STANDARDS_FILE>        → agent-specific path to project standards
  <COMPANION_REF:path/to/file.md> → resolves to skills/<path> for Claude;
                                    inlined excerpts for other agents
-->

## When to Use This Skill

- "Review this PR"
- "Review my code" / "Review my changes" / "Review uncommitted changes"
- "Code review for [component]"
- "Audit this codebase" / "Check code quality"
- "Review against <PROJECT_STANDARDS_FILE>" / "Check if this follows our coding standards"
- "Architecture review" / "Performance audit" / "Security review"
- "Review this PR against the spec"
- "Did the agent miss anything from issue #123?"
- "What rules am I missing in <PROJECT_STANDARDS_FILE> based on this PR?"
- "Review this AI-generated PR"

## Workflow

### Phase 1 — Context Gathering

1. **Read the Spec**
   - For PRs: `gh pr view <num> --json title,body,closingIssuesReferences,labels`
   - For linked issues: `gh issue view <num> --json title,body,labels`
   - For MRs: `glab mr view <num>` and `glab issue view <num>`
   - Extract:
     - Stated goal / problem being solved
     - Explicit acceptance criteria (look for checkboxes, "should", "must", "Given/When/Then")
     - Edge cases or non-goals mentioned
     - Out-of-scope items
   - If no PR/issue context is available, note this and fall back to inferring intent from the diff.
2. Try to load `<PROJECT_STANDARDS_FILE>`.
   - **If missing**: add a note to the report — _"No project standards file found — review uses default Apple guidelines"_ — then continue.
3. Obtain the changeset: `git diff`, `git diff --cached`, or `gh pr diff <n>`.
   - **If diff is empty**: stop and ask the user to specify files, a PR number, or a directory.
4. Read each changed file plus key related files (imports, protocols it conforms to, corresponding test file if present).

### Phase 2 — Analysis

For each category, load the reference file before writing findings:

#### 0. Spec Adherence

Reference: `references/spec-adherence.md`

- **Requirement Coverage**
  - Does each acceptance criterion map to a concrete code change?
  - Are edge cases mentioned in the spec handled?
  - Are tests covering the scenarios described?
- **Scope Discipline**
  - Flag changes outside the stated scope (scope creep)
  - Flag unrelated refactors bundled into the PR
- **Missing Work**
  - TODOs, `fatalError("not implemented")`, empty function bodies
  - Stubbed mocks that should be real implementations
  - Acceptance criteria with no corresponding diff
- **Intent Drift**
  - Code solves a _similar_ but different problem than stated
  - Naming/structure suggests a different mental model than the spec

1. **Swift Quality** — concurrency, error handling, optionals, naming → `references/swift-quality-checklist.md`; for concurrency findings also read `<COMPANION_REF:swift-concurrency/references/sendable.md>` and `<COMPANION_REF:swift-concurrency/references/actors.md>`
2. **SwiftUI Patterns** — property wrappers, state management, deprecated APIs → `references/swiftui-review-checklist.md`; for wrapper selection read `<COMPANION_REF:swiftui-expert-skill/references/state-management.md>`
3. **Performance** — view body cost, ForEach identity, lazy loading, retain cycles → `references/performance-review.md`
4. **Security** — force unwraps, Keychain vs UserDefaults, input validation, no secrets in logs → `references/security-checklist.md`
5. **Architecture** — MVVM/MVI/TCA compliance, DI, testability → `references/architecture-patterns.md`
6. **Project Standards** — validate against `<PROJECT_STANDARDS_FILE>` rules → `references/custom-guidelines.md`

For test file findings, consult `<COMPANION_REF:swift-testing/references/test-organization.md>`.
For navigation/routing findings, consult `<COMPANION_REF:swiftui-ui-patterns/references/navigationstack.md>`.

### Phase 2.5 — Pattern Detection (for Agent Loop Feedback)

**Objective**: Identify recurring issues that point to gaps in the agent's
instructions, not just the code.

After collecting per-file findings, aggregate them:

1. Group findings by rule (e.g., "force-unwrap", "deprecated NavigationView",
   "missing @MainActor on UI mutation").
2. Mark any rule that fires **≥2 times across the diff** as a recurring pattern.
3. For each recurring pattern, draft a one-line rule suitable for
   `<PROJECT_STANDARDS_FILE>` or an agent system prompt — written as a directive,
   not a description.
4. If the same recurring pattern appeared in past reviews (check git log of
   `<PROJECT_STANDARDS_FILE>`), escalate priority — the existing rule isn't strong
   enough or isn't being read.

Threshold rationale: one occurrence is a slip; two is a pattern; three+ means
the agent's instructions are silent on this and need an explicit rule.

Reference: `references/agent-loop-feedback.md`.

### Phase 3 — Report

Group findings by file → sort by severity within each file → write prioritized action items.

Severity: **Critical** (crash/data race/security hole) · **High** (anti-pattern/major arch violation) · **Medium** (quality/maintainability) · **Low** (style/suggestion).

Include one-sentence positive feedback where code is notably well-written. Never pad with generic praise.

## Concrete Finding Examples

### Force Unwrap → guard let (Critical)

**`LoginViewModel.swift:89`** — Current:

```swift
let user = repository.currentUser!
```

**Finding**: crashes if `currentUser` is `nil` (e.g., after sign-out race condition).

**Fix**:

```swift
guard let user = repository.currentUser else {
    logger.error("currentUser nil — aborting login flow")
    return
}
```

---

### Missing @MainActor on UI-bound ViewModel (High)

**`FeedViewModel.swift:12`** — Current:

```swift
class FeedViewModel: ObservableObject {
    @Published var posts: [Post] = []

    func load() async {
        posts = try? await api.fetchPosts()  // ⚠️ mutates @Published off main thread
    }
}
```

**Finding**: `@Published` mutations must happen on the main actor in Swift 6 strict concurrency; this is a data race.

**Fix**:

```swift
@MainActor
@Observable
final class FeedViewModel {
    var posts: [Post] = []

    func load() async throws {
        posts = try await api.fetchPosts()  // safe: whole class is @MainActor-isolated
    }
}
```

Also migrate from `ObservableObject`/`@Published` to `@Observable` (iOS 17+) — see `<COMPANION_REF:swiftui-expert-skill/references/state-management.md>`.

## Output Format

```
# Code Review — <scope>

## Summary
Files: N | Critical: N | High: N | Medium: N | Low: N

## Spec Adherence

**Source**: PR #123 / Issue #456

| Requirement | Status | Location |
|-------------|--------|----------|
| User can log in with email | ✅ Implemented | LoginView.swift:23 |
| Show error on invalid credentials | ⚠️ Partial — missing 401 case | LoginViewModel.swift:67 |
| Persist session in Keychain | ❌ Not implemented | — |
| Rate limit retries | ❌ Not implemented | — |

**Scope creep**: 1 unrelated change (UserSettings.swift refactor) — recommend
splitting into a separate PR.

---

## <Filename.swift>

[Severity] **<Category>** (line N)
Current: `<problematic snippet>`
Fix: <explanation + corrected snippet>

## Positive Observations
...

## Prioritized Action Items
- [Must fix] ...
- [Should fix] ...
- [Consider] ...

---

## Agent Loop Feedback

Recurring patterns suggest the following rules are missing or under-emphasized
in `<PROJECT_STANDARDS_FILE>`:

### Pattern: Force-unwraps (4 occurrences)
**Files**: LoginView.swift:89, NetworkService.swift:34, UserRepo.swift:12,78

**Suggested rule**:
> Never use `!`, `try!`, or `as!`. Use `guard let` with explicit early return,
> typed throws, or `as?` with handling. Force-unwraps are crashes waiting to happen.

### Pattern: Deprecated NavigationView (2 occurrences)
**Files**: ProfileView.swift:15, SettingsView.swift:22

**Suggested rule**:
> Use `NavigationStack` exclusively. `NavigationView` is deprecated as of iOS 16.

### Pattern: Business logic in View body (3 occurrences)
**Files**: LoginView.swift:45, ProfileView.swift:78, FeedView.swift:34

**Suggested rule**:
> Views must not contain business logic, network calls, or data transformations.
> Move all such work into the @Observable view model.
```

Full templates and severity classification: `references/feedback-templates.md`.

## Companion Skills

Full reference tables (all files, when to consult each): `references/companion-skills.md`.

| Skill                                   | Use for                                                    |
| --------------------------------------- | ---------------------------------------------------------- |
| `<COMPANION_REF:swiftui-expert-skill/>` | SwiftUI state, Liquid Glass, macOS patterns, accessibility |
| `<COMPANION_REF:swift-concurrency/>`    | Actors, Sendable, Swift 6 migration, async/await           |
| `<COMPANION_REF:swift-testing/>`        | Swift Testing framework, test doubles, snapshots           |
| `<COMPANION_REF:swift-expert/>`         | Swift 6+ patterns, protocols, memory, SPM                  |
| `<COMPANION_REF:swiftui-ui-patterns/>`  | Navigation, sheets, theming, async state, grids            |

## Platform Commands

```bash
# GitHub PR
gh pr diff <n>
gh pr view <n> --json files,comments

# GitLab MR
glab mr diff <n>
glab mr view <n> --json

# Local changes
git diff             # unstaged
git diff --cached    # staged
git diff HEAD~1      # last commit
git diff -- path/to/file.swift
```

## Limitations

- Spec adherence checks require an accessible PR description or linked issue.
  When reviewing local changes with no PR context, mark spec adherence as
  "not assessed" rather than guessing intent.
- Agent loop feedback assumes the code was AI-generated or AI-assisted. For
  fully human-written code, recurring patterns are still useful but should be
  framed as team coding standards rather than agent instructions.

## Reference Files

- `references/review-workflow.md` — detailed process, diff parsing, git commands
- `references/feedback-templates.md` — output templates, severity classification
- `references/spec-adherence.md` — parsing PR/issue specs, requirement coverage tables, scope creep classification
- `references/agent-loop-feedback.md` — recurring-pattern threshold, directive phrasing, suggested-rule template
- `references/swift-quality-checklist.md` — Swift 6+, concurrency, optionals, naming
- `references/swiftui-review-checklist.md` — property wrappers, state, modern APIs
- `references/performance-review.md` — view optimization, ForEach, resource management
- `references/security-checklist.md` — input validation, Keychain, network security
- `references/architecture-patterns.md` — MVVM/MVI/TCA, DI, testability
- `references/custom-guidelines.md` — parsing `<PROJECT_STANDARDS_FILE>`
- `references/companion-skills.md` — full companion skill tables
