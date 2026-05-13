---
name: swift-code-reviewer
description: "Perform thorough code reviews for Swift/SwiftUI code, including spec adherence (PR description + linked issues), code quality, architecture, performance, security, Swift 6+ best practices, project standards from .claude/CLAUDE.md, and meta-feedback on recurring patterns that suggest gaps in the agent's instructions. Use when reviewing PRs/MRs (especially AI-generated ones), performing quality audits, validating against original spec, or providing structured feedback with severity levels and improvement suggestions for both the code and the agent loop that produced it."
---

# Swift/SwiftUI Code Review Skill

Multi-layer review covering Swift 6+ concurrency, SwiftUI patterns, performance, security, architecture, and project-specific standards. Reads `.claude/CLAUDE.md` and outputs Critical/High/Medium/Low severity findings with `file:line` references and before/after code examples.

## When to Use This Skill

- "Review this PR"
- "Review my code" / "Review my changes" / "Review uncommitted changes"
- "Code review for [component]"
- "Audit this codebase" / "Check code quality"
- "Review against .claude/CLAUDE.md" / "Check if this follows our coding standards"
- "Architecture review" / "Performance audit" / "Security review"
- "Review this PR against the spec"
- "Did the agent miss anything from issue #123?"
- "What rules am I missing in CLAUDE.md based on this PR?"
- "Review this AI-generated PR"

## Workflow

### Phase 0 — Resolve Scope

**Objective**: Produce a canonical scope object before any analysis begins. Every later phase reads from this object — no phase fetches the changeset independently.

#### Mode Detection

Run these checks in order; stop at the first match:

| Priority | Condition | Mode |
|----------|-----------|------|
| 1 | PR number or URL supplied by user | **PR** — `gh pr view <n> --json files,baseRefName` |
| 2 | Explicit file paths supplied by user | **File** — supplied paths → `scope.modified`, skip detection |
| 3 | `gh pr view --json number` returns a result for current branch | **PR** (auto-detected) |
| 4 | "staged" or "cached" in user's invocation | **Staged** — `git diff --cached --name-status` |
| 5 | Default | **Local** — `git diff --name-status <base>...HEAD` + `git diff --name-status` (union) |

**Base branch resolution** (for PR auto-detect and Local mode):

```bash
# 1. PR metadata (authoritative when a PR exists)
gh pr view --json baseRefName --jq '.baseRefName'
# 2. Remote default branch
git rev-parse --abbrev-ref origin/HEAD
# 3. Last resort
git branch -r | grep -E 'origin/(main|master)$' | head -1
```

If `gh` is unavailable or unauthenticated, announce loudly and fall back to Local:
> "`gh` unavailable — falling back to local mode against `origin/main`. Run `gh auth login` for full PR scope detection."

#### Scope Object

```
scope = {
  modified:         Set<Path>   // first-class findings — full file, all severity levels
  deleted:          Set<Path>   // spec-adherence reasoning only — skip per-file analysis loop
  testsForModified: Set<Path>   // coverage findings → main report; other findings → Adjacent Observations
  related:          Set<Path>   // read for context only — all findings → Adjacent Observations
}
```

**Populate `modified` and `deleted`**:

```bash
# PR mode
gh pr view <n> --json files --jq '.files[] | [.path, .status] | @tsv'
# Local / Staged
git diff --name-status <base>...HEAD
```

- Status `M`, `A`, `C` → `scope.modified`
- Status `D` → `scope.deleted`
- Status `R` (rename) → new path → `scope.modified`; record old path so the agent avoids critiquing unchanged content as new code

**Populate `testsForModified`**: For each path in `scope.modified`:
1. Mirror into test tree: `Features/Login/LoginViewModel.swift` → `Tests/Features/Login/LoginViewModelTests.swift`
2. Fall back: search for `*Tests.swift` in the same directory
3. Add found paths (that exist on disk) to `scope.testsForModified`

**Populate `related`**: Added during Phase 1 as the agent reads imported files, protocol declarations, and parent views for context.

**Excluded paths** — filter from all sets before finalising:
- `Pods/**`, `Carthage/**`, `.build/**`, `DerivedData/**`, `.swiftpm/**`
- `*.generated.swift`, `*.pb.swift`, `R.generated.swift`
- Any patterns in a `review-excluded-paths` block in `.claude/CLAUDE.md`

#### Scope Banner (mandatory — first output before any findings)

```
Scope: PR #123 · base: main · modified: 7 · tests-for-modified: 3 · deleted: 1 · related: 12
```

For auto-detected PR, prepend a detection notice:
```
Detected open PR #123 (base: main). Run with --local to review uncommitted work instead.
Scope: PR #123 · base: main · modified: 7 · tests-for-modified: 3 · deleted: 1 · related: 12
```

For local mode:
```
Scope: local (base: main) · modified: 4 (3 pushed, 1 uncommitted) · related: 8
```

#### Scope Enforcement

These rules apply throughout Phases 1–3:

- **L1 — file-level**: Any file in `scope.modified` is reviewed in full — every line is in scope, not just changed lines.
- **O1 — quarantine**: Findings against files outside `scope.modified` (and outside coverage checks in `scope.testsForModified`) go into **Adjacent Observations** — a dedicated section at the end of the report labelled *"out of scope for this PR — file separately."*
- **Severity rollup** (`Critical: N | High: N | …`) counts only in-scope findings. Adjacent Observations are excluded.

---

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
2. Try to load `.claude/CLAUDE.md`.
   - **If missing**: add a note to the report — _"No project standards file found — review uses default Apple guidelines"_ — then continue.
3. Use `scope.modified` from Phase 0 as the authoritative file list. To understand what changed in each file:
   - PR mode: `gh pr diff <n> -- <file>`
   - Local mode: `git diff <base>...HEAD -- <file>`
   - If `scope.modified` is empty after Phase 0, stop and report the scope banner with no findings.
4. Read each file in `scope.modified` in full. As you encounter imported files, protocol declarations, parent views, and other dependencies, add them to `scope.related` — they can be read freely, but findings against them go to Adjacent Observations. Test files in `scope.testsForModified` are read here for coverage analysis.

### Phase 2 — Analysis

For each category, load the reference file before writing findings:

#### 0. Spec Adherence

Reference: `references/spec-adherence.md`

- **Requirement Coverage**
  - Does each acceptance criterion map to a concrete code change?
  - Are edge cases mentioned in the spec handled?
  - For files in `scope.testsForModified`: are tests covering the scenarios described in the spec? Coverage gaps → main report. Other issues found in those test files → Adjacent Observations.
- **Scope Discipline**
  - Flag changes outside the stated scope (scope creep)
  - Flag unrelated refactors bundled into the PR
- **Deleted Files**: For each path in `scope.deleted`, reason about whether its removal satisfies or violates a spec requirement. Include in the Requirement Coverage table; skip the per-file analysis loop.
- **Missing Work**
  - TODOs, `fatalError("not implemented")`, empty function bodies
  - Stubbed mocks that should be real implementations
  - Acceptance criteria with no corresponding diff
- **Intent Drift**
  - Code solves a *similar* but different problem than stated
  - Naming/structure suggests a different mental model than the spec

1. **Swift Quality** — concurrency, error handling, optionals, naming → `references/swift-quality-checklist.md`; for concurrency findings also read `skills/swift-concurrency/references/sendable.md` and `actors.md`
2. **SwiftUI Patterns** — property wrappers, state management, deprecated APIs → `references/swiftui-review-checklist.md`; for wrapper selection read `skills/swiftui-expert-skill/references/state-management.md`
3. **Performance** — view body cost, ForEach identity, lazy loading, retain cycles → `references/performance-review.md`
4. **Security** — force unwraps, Keychain vs UserDefaults, input validation, no secrets in logs → `references/security-checklist.md`
5. **Architecture** — MVVM/MVI/TCA compliance, DI, testability → `references/architecture-patterns.md`
6. **Project Standards** — validate against `.claude/CLAUDE.md` rules → `references/custom-guidelines.md`

For test file findings, consult `skills/swift-testing/references/test-organization.md`.
For navigation/routing findings, consult `skills/swiftui-ui-patterns/references/navigationstack.md`.

### Phase 2.5 — Pattern Detection (for Agent Loop Feedback)

**Objective**: Identify recurring issues that point to gaps in the agent's
instructions, not just the code.

After collecting per-file findings, aggregate them:

1. Group findings by rule (e.g., "force-unwrap", "deprecated NavigationView",
   "missing @MainActor on UI mutation").
2. Mark any rule that fires **≥2 times across the diff** as a recurring pattern.
3. For each recurring pattern, draft a one-line rule suitable for
   `.claude/CLAUDE.md` or an agent system prompt — written as a directive,
   not a description.
4. If the same recurring pattern appeared in past reviews (check git log of
   `.claude/CLAUDE.md`), escalate priority — the existing rule isn't strong
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

Also migrate from `ObservableObject`/`@Published` to `@Observable` (iOS 17+) — see `skills/swiftui-expert-skill/references/state-management.md`.

## Output Format

```
Scope: PR #123 · base: main · modified: 7 · tests-for-modified: 3 · deleted: 1 · related: 12

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
in `.claude/CLAUDE.md`:

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

---

## Adjacent Observations
*Out of scope for this PR. Findings in files read for context that were not modified in this PR.
Not counted in the summary above. File separately or address in a follow-up PR.*

### <RelatedFile.swift> (unmodified)

[Severity] **<Category>** (line N)
Current: `<snippet>`
Note: <what the issue is — no action required for this PR>
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
- `references/custom-guidelines.md` — parsing `.claude/CLAUDE.md`
- `references/companion-skills.md` — full companion skill tables
