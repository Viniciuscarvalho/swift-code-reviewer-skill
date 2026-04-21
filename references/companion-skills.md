# Companion Skills Reference

Full attribution and update instructions: [`skills/README.md`](../skills/README.md)
Original authors: [@AvdLee](https://github.com/AvdLee), [@Dimillian](https://github.com/Dimillian), [@bocato](https://github.com/bocato)

---

## swiftui-expert-skill · `skills/swiftui-expert-skill/`

| Reference file                         | When to consult                                                           |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `references/state-management.md`       | Property wrapper selection — @State, @Binding, @Observable, @Environment  |
| `references/latest-apis.md`            | Deprecation detection — always check before flagging an API as deprecated |
| `references/view-structure.md`         | View extraction rules and composition depth limits                        |
| `references/performance-patterns.md`   | Equatable conformance, body evaluation cost, lazy loading                 |
| `references/accessibility-patterns.md` | VoiceOver grouping, traits, Dynamic Type support                          |
| `references/liquid-glass.md`           | iOS 26+ Liquid Glass adoption and availability gating                     |
| `references/animation-basics.md`       | Implicit/explicit animation, withAnimation, matchedGeometryEffect         |
| `references/macos-scenes.md`           | macOS-specific Scene types, window styling, settings                      |

---

## swift-concurrency · `skills/swift-concurrency/`

| Reference file                     | When to consult                                             |
| ---------------------------------- | ----------------------------------------------------------- |
| `references/sendable.md`           | Sendable conformance, `@unchecked Sendable` justification   |
| `references/actors.md`             | Actor isolation, custom actors vs @MainActor                |
| `references/async-await-basics.md` | Structured vs unstructured tasks, `Task.detached` rationale |
| `references/migration.md`          | Swift 6 migration patterns, minimum blast-radius approach   |
| `references/testing.md`            | Concurrency-safe test patterns                              |
| `references/threading.md`          | Thread safety, GCD interop, isolation boundaries            |

---

## swift-testing · `skills/swift-testing/`

| Reference file                      | When to consult                                               |
| ----------------------------------- | ------------------------------------------------------------- |
| `references/test-organization.md`   | @Suite hierarchy, naming, tagging                             |
| `references/test-doubles.md`        | Dummy / Fake / Stub / Spy / Mock taxonomy                     |
| `references/async-testing.md`       | `#expect(throws:)`, async confirmation patterns               |
| `references/parameterized-tests.md` | `@Test(arguments:)` for data-driven tests                     |
| `references/migration-xctest.md`    | XCTest → Swift Testing migration checklist                    |
| `references/fixtures.md`            | Fixture placement with `#if DEBUG`, test target vs app target |

---

## swift-expert · `skills/swift-expert/`

| Reference file                     | When to consult                                                       |
| ---------------------------------- | --------------------------------------------------------------------- |
| `references/async-concurrency.md`  | Cross-cutting concurrency patterns                                    |
| `references/protocol-oriented.md`  | Protocol hierarchies, associated types, existentials, `any` vs `some` |
| `references/memory-performance.md` | Value vs reference semantics, ARC, retain cycles                      |
| `references/swiftui-patterns.md`   | Additional SwiftUI architectural guidance                             |

---

## swiftui-ui-patterns · `skills/swiftui-ui-patterns/`

| Reference file                   | When to consult                                           |
| -------------------------------- | --------------------------------------------------------- |
| `references/components-index.md` | Full component catalogue — start here for any UI pattern  |
| `references/navigationstack.md`  | Route enums, RouterPath, `navigationDestination`          |
| `references/sheets.md`           | Item-driven sheets, SheetDestination enum                 |
| `references/theming.md`          | Semantic color enforcement via `@Environment(Theme.self)` |
| `references/async-state.md`      | `.task(id:)`, LoadState enum, CancellationError           |
| `references/tabview.md`          | Tab architecture, per-tab independent navigation history  |
| `references/grids.md`            | LazyVGrid / LazyHGrid patterns and identity               |
