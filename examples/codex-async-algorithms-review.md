# Code Review — apple/swift-async-algorithms

**Agent**: OpenAI Codex CLI with swift-code-reviewer-skill  
**Scope**: `Sources/AsyncAlgorithms/` (flatMapLatest + housekeeping)  
**Commit**: [`9d349bc`](https://github.com/apple/swift-async-algorithms/commit/9d349bcc328ac3c31ce40e746b5882742a0d1272)

---

## Summary

Files: 6 | Critical: 0 | High: 2 | Medium: 2 | Low: 2

---

## Spec Adherence

**Source**: commit message — "Cleanup pass for flatMapLatest and housekeeping tasks around proposals (#403)"

| Requirement                                                        | Status                                                | Location                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------- |
| flatMapLatest cancels prior inner sequence on new upstream element | ✅ Implemented                                        | AsyncFlatMapLatestSequence.swift:78                |
| Cleanup removes stale TODO comments                                | ✅ Done                                               | multiple files                                     |
| Proposal housekeeping (no functional change)                       | ✅ Confirmed                                          | Proposals/                                         |
| Tests cover cancellation of prior inner task                       | ⚠️ Partial — no test for rapid upstream emission race | Tests/AsyncAlgorithmsTests/TestFlatMapLatest.swift |

**Scope**: No scope creep.

---

## AsyncFlatMapLatestSequence.swift

**High** **Concurrency** (line 78)

Current:

```swift
private var task: Task<Void, Never>?

mutating func cancel() {
    task?.cancel()
    task = nil
}
```

Finding: `task` is a stored `var` on a `struct` that is also accessed from the `AsyncIteratorProtocol`
conformance. Under Swift 6 strict concurrency, mutable stored properties on actor-unbound structs
that are shared across async contexts require `Sendable` conformance or actor isolation. This
will produce a `Sendable` warning (and eventually an error) when `AsyncFlatMapLatestSequence`
is used across actor boundaries.

Fix: Either mark `AsyncFlatMapLatestSequence.Iterator` as `@unchecked Sendable` with a comment
explaining the locking guarantee, or migrate the cancellable state into an `actor`:

```swift
private actor CancellableState {
    var task: Task<Void, Never>?
    func cancel() { task?.cancel(); task = nil }
}
```

---

**High** **Concurrency** (line 112)

Current:

```swift
inner = Task {
    do {
        for try await element in transform(upstream) {
            yield(element)
        }
    } catch { }
}
```

Finding: The `catch { }` block silently swallows errors from the inner sequence. If
`transform(upstream)` throws, the outer sequence will simply stop producing elements with no
diagnostic. This violates the "never swallow errors silently" rule and makes it impossible for
callers to distinguish between normal completion and an error.

Fix:

```swift
inner = Task {
    do {
        for try await element in transform(upstream) {
            yield(element)
        }
    } catch is CancellationError {
        // expected — outer task cancelled inner task
    } catch {
        yieldWithError(error)   // propagate to caller
    }
}
```

---

## AsyncFlatMapLatestSequence+Testing.swift

**Medium** **Swift Quality** (line 23)

Current:

```swift
extension AsyncFlatMapLatestSequence: @unchecked Sendable where Base: Sendable {}
```

Finding: `@unchecked Sendable` suppresses the compiler check without documenting _why_ it is
safe. In a concurrent algorithm library this is particularly risky — readers have no way to
know whether the unchecked conformance is backed by a lock, actor isolation, or a known-safe
access pattern.

Fix: Add a comment:

```swift
// SAFETY: all mutable state is accessed only from the iterator's single-consumer
// async context; no concurrent writes occur after initialization.
extension AsyncFlatMapLatestSequence: @unchecked Sendable where Base: Sendable {}
```

---

## Tests/AsyncAlgorithmsTests/TestFlatMapLatest.swift

**Medium** **Swift Quality** (line 67)

Current:

```swift
func testCancellation() async {
    var results: [Int] = []
    ...
    XCTAssertEqual(results, [1, 3])
}
```

Finding: The test asserts on `[1, 3]` but does not cover the race where two upstream elements
arrive faster than the inner sequence can cancel. Under high scheduler pressure this test can
flake. The Swift Testing framework's `#expect` with `withKnownIssue` is preferred for
documenting known-flaky timing assertions.

Fix (Swift Testing migration):

```swift
@Test func cancellationUnderLoad() async throws {
    // drive rapid upstream emission to stress-test cancellation
    let upstream = AsyncStream { c in
        for i in 0..<100 { c.yield(i) }
        c.finish()
    }
    var seen: [Int] = []
    for await v in upstream.flatMapLatest { AsyncStream.just($0) } {
        seen.append(v)
    }
    // only the last value is guaranteed to survive rapid cancellation
    #expect(seen.last == 99)
}
```

---

## Positive Observations

The `flatMapLatest` operator correctly stores only a single inner `Task` at a time and
cancels the previous one before launching the next — the core contract is correctly implemented.

The proposal markdown cleanup in `Proposals/` is clean and removes stale placeholder text
without touching any public API surface.

---

## Prioritized Action Items

- [Should fix] Migrate mutable task state to an actor or document `@unchecked Sendable` safety (AsyncFlatMapLatestSequence.swift:78)
- [Should fix] Propagate inner-sequence errors instead of swallowing with `catch { }` (AsyncFlatMapLatestSequence.swift:112)
- [Consider] Add `// SAFETY:` comment to `@unchecked Sendable` conformance
- [Consider] Add stress-test for rapid upstream emission to prevent cancellation race flakiness

---

## Agent Loop Feedback

### Pattern: Silent error swallowing — `catch { }` (2 occurrences)

**Files**: AsyncFlatMapLatestSequence.swift:112, AsyncChain.swift:89

**Suggested rule for `AGENTS.md`**:

> Never use `catch { }` or `catch _ { }`. At minimum, rethrow `CancellationError` and
> propagate all other errors to callers. Silent catches hide bugs in async algorithm implementations.

### Pattern: `@unchecked Sendable` without safety comment (2 occurrences)

**Files**: AsyncFlatMapLatestSequence+Testing.swift:23, AsyncThrottleSequence.swift:41

**Suggested rule for `AGENTS.md`**:

> Every `@unchecked Sendable` conformance must be preceded by a `// SAFETY:` comment
> explaining why concurrent access is safe (locking strategy, actor isolation, or access pattern).

---

_Representative demonstration. Generated against commit
[`9d349bc`](https://github.com/apple/swift-async-algorithms/commit/9d349bcc328ac3c31ce40e746b5882742a0d1272)
of [apple/swift-async-algorithms](https://github.com/apple/swift-async-algorithms).
Line numbers and snippets are illustrative of the patterns the skill detects in this codebase._
