# Code Review — pointfreeco/isowords

**Agent**: Google Gemini CLI with swift-code-reviewer-skill  
**Scope**: `Sources/` (Start using IssueReporting)  
**Commit**: [`c727d3a`](https://github.com/pointfreeco/isowords/commit/c727d3a7c49cf0c98f2fa4f24c562f81e30165f7)

---

## Summary

Files: 5 | Critical: 0 | High: 1 | Medium: 3 | Low: 2

---

## Spec Adherence

**Source**: commit message — "Start using IssueReporting. (#205)"

| Requirement                                                | Status                                             | Location                                                   |
| ---------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| Replace `fatalError`/`assertionFailure` with `reportIssue` | ✅ Done                                            | multiple files                                             |
| Migrate `preconditionFailure` to `reportIssue`             | ⚠️ Partial — 2 call sites missed                   | GameFeature/GameView.swift:134, AudioPlayerClient.swift:67 |
| No behavioral change for release builds                    | ✅ Confirmed — `reportIssue` is a no-op in release | —                                                          |
| Tests updated to assert `reportIssue` calls                | ❌ Not implemented — no test changes in diff       | —                                                          |

**Missing work**: Two `preconditionFailure` sites not migrated; no test assertions added for
`reportIssue` invocations (IssueReporting provides `withExpectedIssue` for exactly this).

---

## GameFeature/GameView.swift

**High** **SwiftUI Patterns** (line 89)

Current:

```swift
NavigationView {
    WithViewStore(self.store) { viewStore in
        GameBoardView(store: self.store)
    }
}
```

Finding: `NavigationView` is deprecated as of iOS 16. `WithViewStore` is the older TCA
observation pattern — isowords targets iOS 16+ and should use `NavigationStack` with
the `@Bindable` store observation available in TCA 1.x.

Fix:

```swift
NavigationStack {
    GameBoardView(store: self.store)
}
```

And in the view body, replace `WithViewStore` reads with direct `store.someState` access
via `@Bindable var store: StoreOf<GameFeature>`.

---

**Medium** **SwiftUI Patterns** (line 134)

Current:

```swift
preconditionFailure("Unexpected game mode: \(mode)")
```

Finding: This `preconditionFailure` was not migrated to `reportIssue` in this PR. The PR
description states the goal is to migrate all hard crashes to `reportIssue`. In production,
`preconditionFailure` will crash the app; `reportIssue` would log the issue and allow the
app to degrade gracefully.

Fix:

```swift
reportIssue("Unexpected game mode: \(mode)")
return  // or a safe default path
```

---

## AudioPlayerClient.swift

**Medium** **Swift Quality** (line 67)

Current:

```swift
preconditionFailure("AudioPlayerClient not implemented")
```

Finding: Same as above — not migrated to `reportIssue`. Additionally, `"not implemented"`
as a crash message suggests this may be a stub that should be a real implementation or at
least a `TODO` tracked in the issue tracker.

Fix:

```swift
reportIssue("AudioPlayerClient: \(#function) not implemented")
```

---

## AppFeature/AppReducer.swift

**Medium** **Architecture** (line 201)

Current:

```swift
case .game(.delegate(.gameOver)):
    guard let result = state.game?.gameResult else {
        reportIssue("gameOver delegate action fired without a game result")
        return .none
    }
```

Finding: The `reportIssue` call is correct and well-placed. However, the `guard` falls
through to `.none` silently — callers observing the game-over flow will see no state
change and no indication that the invariant was violated. Consider adding a state flag
or `.send` to surface the degraded state to the UI.

Fix: After `reportIssue`, set a recoverable error state:

```swift
reportIssue("gameOver delegate action fired without a game result")
state.errorBanner = "Something went wrong. Please restart the game."
return .none
```

---

## Tests/GameFeatureTests/GameViewTests.swift

**Low** **Swift Quality** (line 12)

Current:

```swift
import XCTest
@testable import GameFeature
```

Finding: isowords has started migrating to Swift Testing (visible in other test files in
this repo). New test files should use `import Testing` unless XCTest-specific APIs are
required. XCTest's `XCTAssertEqual` can be replaced with `#expect` for clearer diagnostics.

Fix:

```swift
import Testing
@testable import GameFeature
```

---

## Positive Observations

The adoption of `IssueReporting` is architecturally sound — replacing hard crashes with
soft issue reports significantly improves testability, since `withExpectedIssue` lets tests
assert that invalid states are reported rather than crashing the test suite.

`AppReducer.swift` correctly uses `reportIssue` (not `assertionFailure`) in the newly
migrated call sites, demonstrating consistent application of the pattern.

---

## Prioritized Action Items

- [Must fix] Migrate remaining `preconditionFailure` calls to `reportIssue` (GameView.swift:134, AudioPlayerClient.swift:67)
- [Should fix] Add `withExpectedIssue` test assertions for newly reportable error paths
- [Should fix] Replace deprecated `NavigationView` + `WithViewStore` with `NavigationStack` + `@Bindable` (GameView.swift:89)
- [Consider] Surface degraded state to UI after `reportIssue` in AppReducer (AppReducer.swift:201)
- [Consider] Migrate GameViewTests to Swift Testing framework

---

## Agent Loop Feedback

### Pattern: Incomplete migration — `preconditionFailure` not replaced (2 occurrences)

**Files**: GameFeature/GameView.swift:134, AudioPlayerClient.swift:67

**Suggested rule for `GEMINI.md`**:

> When migrating crash calls (`fatalError`, `preconditionFailure`, `assertionFailure`) to
> `reportIssue`, search the entire diff for remaining instances before marking the PR complete.
> Use `grep -r "preconditionFailure\|fatalError\|assertionFailure" Sources/` to verify.

### Pattern: No tests added for new `reportIssue` call sites (covers 3+ sites)

**Files**: AppFeature/AppReducer.swift, GameFeature/GameView.swift, AudioPlayerClient.swift

**Suggested rule for `GEMINI.md`**:

> Every new `reportIssue` call site must have a corresponding `withExpectedIssue { }` test.
> IssueReporting is only valuable if tests verify the reports fire — otherwise it is
> indistinguishable from a no-op.

---

_Representative demonstration. Generated against commit
[`c727d3a`](https://github.com/pointfreeco/isowords/commit/c727d3a7c49cf0c98f2fa4f24c562f81e30165f7)
of [pointfreeco/isowords](https://github.com/pointfreeco/isowords).
Line numbers and snippets are illustrative of the patterns the skill detects in this codebase._
