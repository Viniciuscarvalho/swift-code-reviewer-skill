---
name: swift-code-reviewer
description: "Multi-layer code review agent for Swift and SwiftUI projects. Analyzes PRs, diffs, and files across six dimensions: Swift 6+ concurrency safety, SwiftUI state management and modern APIs, performance (view updates, ForEach identity, lazy loading), security (force unwraps, Keychain, input validation), architecture compliance (MVVM/MVI/TCA, dependency injection), and project-specific standards from .claude/CLAUDE.md. Outputs structured reports with Critical/High/Medium/Low severity, positive feedback, and prioritized action items with file:line references. Use when the user says review this PR, review my code, review my changes, check this file, code review, audit this codebase, check code quality, review uncommitted changes, review all ViewModels, or mentions reviewing .swift files, navigation, sheets, theming, or async patterns."
---

# Swift/SwiftUI Code Review Skill

Multi-layer review covering Swift 6+ concurrency, SwiftUI patterns, performance, security, architecture, and project-specific standards. Reads `.claude/CLAUDE.md` and outputs Critical/High/Medium/Low severity findings with `file:line` references and before/after code examples.

## Workflow

### Phase 1 — Context Gathering

1. Try to load `.claude/CLAUDE.md`.
   - **If missing**: add a note to the report — _"No project standards file found — review uses default Apple guidelines"_ — then continue.
2. Obtain the changeset: `git diff`, `git diff --cached`, or `gh pr diff <n>`.
   - **If diff is empty**: stop and ask the user to specify files, a PR number, or a directory.
3. Read each changed file plus key related files (imports, protocols it conforms to, corresponding test file if present).

### Phase 2 — Analysis

For each category, load the reference file before writing findings:

1. **Swift Quality** — concurrency, error handling, optionals, naming → `references/swift-quality-checklist.md`; for concurrency findings also read `skills/swift-concurrency/references/sendable.md` and `actors.md`
2. **SwiftUI Patterns** — property wrappers, state management, deprecated APIs → `references/swiftui-review-checklist.md`; for wrapper selection read `skills/swiftui-expert-skill/references/state-management.md`
3. **Performance** — view body cost, ForEach identity, lazy loading, retain cycles → `references/performance-review.md`
4. **Security** — force unwraps, Keychain vs UserDefaults, input validation, no secrets in logs → `references/security-checklist.md`
5. **Architecture** — MVVM/MVI/TCA compliance, DI, testability → `references/architecture-patterns.md`
6. **Project Standards** — validate against `.claude/CLAUDE.md` rules → `references/custom-guidelines.md`

For test file findings, consult `skills/swift-testing/references/test-organization.md`.
For navigation/routing findings, consult `skills/swiftui-ui-patterns/references/navigationstack.md`.

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

Also migrate from `ObservableObject`/`@Published` to `@Observable` (iOS 17+) — see `skills/swiftui-expert-skill/references/state-management.md`.

## Output Format

```
# Code Review — <scope>

## Summary
Files: N | Critical: N | High: N | Medium: N | Low: N

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
```

Full templates and severity classification: `references/feedback-templates.md`.

## Companion Skills

Full reference tables (all files, when to consult each): `references/companion-skills.md`.

| Skill                          | Use for                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `skills/swiftui-expert-skill/` | SwiftUI state, Liquid Glass, macOS patterns, accessibility |
| `skills/swift-concurrency/`    | Actors, Sendable, Swift 6 migration, async/await           |
| `skills/swift-testing/`        | Swift Testing framework, test doubles, snapshots           |
| `skills/swift-expert/`         | Swift 6+ patterns, protocols, memory, SPM                  |
| `skills/swiftui-ui-patterns/`  | Navigation, sheets, theming, async state, grids            |

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

## Reference Files

- `references/review-workflow.md` — detailed process, diff parsing, git commands
- `references/feedback-templates.md` — output templates, severity classification
- `references/swift-quality-checklist.md` — Swift 6+, concurrency, optionals, naming
- `references/swiftui-review-checklist.md` — property wrappers, state, modern APIs
- `references/performance-review.md` — view optimization, ForEach, resource management
- `references/security-checklist.md` — input validation, Keychain, network security
- `references/architecture-patterns.md` — MVVM/MVI/TCA, DI, testability
- `references/custom-guidelines.md` — parsing `.claude/CLAUDE.md`
- `references/companion-skills.md` — full companion skill tables
