---
name: swift-expert
description: Swift specialist for iOS/macOS development with Swift 6.0+, SwiftUI, async/await concurrency, and protocol-oriented design. Invoke for Apple platform apps, server-side Swift, modern concurrency patterns.
---

# Swift Expert

## Reference Guide

| Topic       | Reference                          | Load when                                   |
| ----------- | ---------------------------------- | ------------------------------------------- |
| SwiftUI     | `references/swiftui-patterns.md`   | Building views, state management, modifiers |
| Concurrency | `references/async-concurrency.md`  | async/await, actors, structured concurrency |
| Protocols   | `references/protocol-oriented.md`  | Protocol design, generics, type erasure     |
| Memory      | `references/memory-performance.md` | ARC, weak/unowned, performance optimization |
| Testing     | `references/testing-patterns.md`   | XCTest, async tests, mocking strategies     |

## Rules

**Always:**

- Use `async/await`; prefer structured concurrency (`TaskGroup`, child tasks) over `Task.detached`
- Annotate `@MainActor` on types that own UI-bound state; never mutate `@Observable` storage from a non-main-actor context
- Conform to `Sendable` when crossing actor boundaries; document the safety invariant on `@unchecked Sendable`
- Default to value types (`struct`/`enum`); use `class` only when reference semantics or identity are required
- Use `guard let` / `if let` / `try`; never `!` or `as!` without a justified comment explaining why it cannot fail

**Never:**

- Create retain cycles — capture `[weak self]` in escaping closures that outlive their owner
- Mix `DispatchQueue` and `async/await` in the same call path without an explicit isolation boundary
- Ignore actor isolation warnings; fix the root cause, do not reach for `nonisolated(unsafe)`
- Use `@preconcurrency` without a follow-up to remove it once the dependency is migrated

## Code Examples

### Swift 6 strict concurrency — actor + Sendable + @MainActor ViewModel

```swift
// Value type: Sendable — safe to pass across isolation boundaries
struct Post: Sendable, Identifiable {
    let id: UUID
    let title: String
    let body: String
}

// Service actor: owns mutable cache; callers must await
actor PostRepository {
    private var cache: [UUID: Post] = [:]
    private let client: NetworkClient  // NetworkClient must itself be Sendable

    func post(id: UUID) async throws -> Post {
        if let hit = cache[id] { return hit }
        let post = try await client.fetchPost(id: id)
        cache[id] = post
        return post
    }
}

// ViewModel: @MainActor isolates all state to the main thread
@MainActor
@Observable
final class PostDetailViewModel {
    var post: Post?
    var isLoading = false
    var error: Error?

    private let repository: PostRepository

    init(repository: PostRepository) {
        self.repository = repository
    }

    func load(id: UUID) async {
        isLoading = true
        defer { isLoading = false }
        do {
            post = try await repository.post(id: id)
        } catch {
            self.error = error
        }
    }
}
```

Key points: `Post` is a `Sendable` value type, `PostRepository` is an actor so its `cache` is mutation-safe, and the ViewModel is `@MainActor` so all `@Observable` storage updates are on the main thread — zero data races under Swift 6 strict concurrency.

---

### SwiftUI @Observable + @Environment dependency injection

```swift
// Shared router injected via Environment — avoids prop-drilling through view tree
@Observable
final class AppRouter {
    var path: [Route] = []
    func push(_ route: Route) { path.append(route) }
    func pop() { guard !path.isEmpty else { return }; path.removeLast() }
}

@main
struct MyApp: App {
    @State private var router = AppRouter()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(router)
        }
    }
}

// Any descendant reads the router without an explicit init parameter
struct FeedView: View {
    @Environment(AppRouter.self) private var router
    let posts: [Post]

    var body: some View {
        List(posts) { post in
            PostRow(post: post)
                .onTapGesture { router.push(.postDetail(post.id)) }
        }
    }
}
```

Use `@Environment` for cross-cutting shared objects (router, theme, auth state). Use `@State` in the root scene — not as a global — so the object lifetime is tied to the window.

---

### Protocol-oriented design with primary associated types

```swift
// Primary associated type enables `some` / `any` at call sites
protocol DataStore<Value>: Sendable {
    associatedtype Value: Sendable & Identifiable
    func fetch(id: Value.ID) async throws -> Value
    func save(_ value: Value) async throws
}

// Concrete implementation is an actor for thread-safe storage
actor UserStore: DataStore {
    typealias Value = User
    private var db: [User.ID: User] = [:]

    func fetch(id: User.ID) async throws -> User {
        guard let user = db[id] else { throw StoreError.notFound(id) }
        return user
    }
    func save(_ value: User) async throws { db[value.id] = value }
}

// Generic function: no `any` boxing, full type-checking, parallel prefetch
func prefetch<Store: DataStore>(
    ids: [Store.Value.ID],
    from store: Store
) async throws -> [Store.Value] {
    try await withThrowingTaskGroup(of: Store.Value.self) { group in
        for id in ids { group.addTask { try await store.fetch(id: id) } }
        return try await group.reduce(into: []) { $0.append($1) }
    }
}

// Opaque return: caller gets full type-checking, implementation stays hidden
func makeUserStore() -> some DataStore<User> { UserStore() }
```

Prefer `some DataStore<User>` over `any DataStore<User>` when the concrete type is fixed at the call site — no heap allocation for the existential box.

## Project Structure

Feature-slice layout scales better than layer-slice beyond three features:

```
Sources/
  App/            ← entry point, root scene, environment wiring only
  Features/
    Feed/         ← FeedView, FeedViewModel, FeedRepository (co-located)
    Profile/
    Settings/
  Core/
    Models/       ← Sendable value types, no UIKit/SwiftUI imports
    Network/      ← NetworkClient protocol + actor implementation
    Storage/      ← persistence actors
  DesignSystem/   ← colors, fonts, reusable views — zero business logic
Tests/
  FeedTests/
  CoreTests/
```

**Extract a Swift Package target when:**

- A feature or layer needs to be mocked in tests without importing the concrete dependency
- A module is shared by an app extension (widget, share extension, Watch app)
- A build-time regression is traced to a specific module boundary

Minimum viable `Package.swift` for a modular app:

```swift
// swift-tools-version: 6.0
let package = Package(
    name: "MyApp",
    platforms: [.iOS(.v17), .macOS(.v14)],
    targets: [
        .target(
            name: "Core",
            dependencies: [],
            swiftSettings: [.enableExperimentalFeature("StrictConcurrency")]
        ),
        .target(
            name: "DesignSystem",
            dependencies: []
        ),
        .target(
            name: "Features",
            dependencies: ["Core", "DesignSystem"]
        ),
        .testTarget(
            name: "FeaturesTests",
            dependencies: ["Features"]
        ),
    ]
)
```

`Core` has no upward dependencies. `Features` imports `Core` and `DesignSystem`. Tests import only the target under test.
