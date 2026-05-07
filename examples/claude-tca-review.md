# Code Review — pointfreeco/swift-composable-architecture

**Agent**: Claude Code with swift-code-reviewer-skill  
**Scope**: `Sources/ComposableArchitecture/` (swift-format pass)  
**Commit**: [`d9f965e`](https://github.com/pointfreeco/swift-composable-architecture/commit/d9f965e38a86c78279ff59dfab1754b637f097a2)

---

## Summary

Files: 4 | Critical: 0 | High: 1 | Medium: 2 | Low: 3

---

## Spec Adherence

**Source**: commit message — "Run swift-format"

| Requirement                         | Status                                                                       | Location         |
| ----------------------------------- | ---------------------------------------------------------------------------- | ---------------- |
| Format-only pass (no logic changes) | ✅ Confirmed                                                                 | all files        |
| No accidental semantic changes      | ⚠️ See High finding — one trailing-closure rewrite changed capture semantics | Effect.swift:214 |

**Scope**: No scope creep — changes are purely formatting.

---

## Effect.swift

**High** **Concurrency** (line 214)

Current (post-format):

```swift
return .run { send in
    await operation(send)
}
```

Finding: swift-format collapsed a multi-line trailing closure that previously made the
`@Sendable` annotation visible at the call site. The reformatted version still compiles,
but the implicit `@Sendable` inference may silently break if `operation` is later changed to
capture a non-`Sendable` type. This is a latent data-race risk under Swift 6 strict concurrency.

Fix: Keep the explicit annotation at the definition site:

```swift
return .run { @Sendable send in
    await operation(send)
}
```

---

## Reducer.swift

**Medium** **Swift Quality** (line 89)

Current:

```swift
public func reduce(into state: inout State, action: Action) -> Effect<Action> {
    reducers.reduce(.none) { effect, reducer in
        .merge(effect, reducer.reduce(into: &state, action: action))
    }
}
```

Finding: The `reduce(into:action:)` call inside the closure captures `&state` across
multiple iterations. Swift 6 prohibits escaping uses of `inout` parameters in closures.
This compiles today because `reduce(_:_:)` is non-escaping, but it should be annotated
`@_disfavoredOverload` or documented to preserve the non-escaping contract.

Fix: Add a `// SAFETY: reduce(_:_:) is non-escaping` comment to make the contract explicit,
and add a `@_disfavoredOverload` annotation if overloads exist that could accidentally pick
the escaping variant.

---

## Store.swift

**Medium** **Architecture** (line 312)

Current:

```swift
func send(_ action: Action) {
    let effect = reducer.reduce(into: &state, action: action)
    ...
}
```

Finding: `send(_:)` is not annotated `@MainActor`. In Swift 6, callers on background actors
will produce a compiler warning (and eventually an error) when calling a non-isolated method
that mutates `@MainActor`-bound state. TCA's own documentation recommends `@MainActor` on
`Store` — this appears to be an oversight in the formatting pass.

Fix:

```swift
@MainActor
func send(_ action: Action) {
```

---

## Positive Observations

`Effect.run` correctly propagates typed errors via `any Error` and avoids the
`try?`-swallowing anti-pattern found in older TCA versions.

The use of `withTaskCancellationHandler` in `EffectProducer.swift` is idiomatic and
correctly structured for cooperative cancellation.

---

## Prioritized Action Items

- [Should fix] Add `@Sendable` annotation explicitly at the `Effect.run` call site (Effect.swift:214)
- [Consider] Document non-escaping contract on `Reducer.reduce` loop (Reducer.swift:89)
- [Consider] Add `@MainActor` to `Store.send` for Swift 6 forward-compatibility (Store.swift:312)

---

## Agent Loop Feedback

No recurring patterns in this diff — it is a format-only change. The single High finding is
a one-off latent risk introduced by formatter rewriting.

**Suggested rule for `.claude/CLAUDE.md`** (if this project uses the skill for AI-assisted PRs):

> When running swift-format, review every trailing-closure rewrite for implicit `@Sendable`
> annotation loss. Prefer explicit `@Sendable` annotations at definition sites.

---

_Representative demonstration. Generated against commit
[`d9f965e`](https://github.com/pointfreeco/swift-composable-architecture/commit/d9f965e38a86c78279ff59dfab1754b637f097a2)
of [pointfreeco/swift-composable-architecture](https://github.com/pointfreeco/swift-composable-architecture).
Line numbers and snippets are illustrative of the patterns the skill detects in this codebase._
