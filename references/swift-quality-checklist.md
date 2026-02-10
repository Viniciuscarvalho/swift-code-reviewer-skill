# Swift Quality Checklist

This checklist covers Swift 6+ language features, concurrency patterns, error handling, optionals, access control, and naming conventions. Use this to ensure code follows modern Swift best practices.

---

## 1. Concurrency & Swift 6 Patterns

### 1.1 Actor Isolation

**Check for:**
- [ ] UI-related classes marked with `@MainActor`
- [ ] Mutable state properly isolated with actors
- [ ] No shared mutable state without synchronization
- [ ] Proper actor isolation boundaries

**Examples:**

❌ **Bad: No actor isolation**
```swift
class UserViewModel {
    var users: [User] = []  // ❌ Mutable state without isolation

    func loadUsers() {
        // Can be called from any thread - data race!
    }
}
```

✅ **Good: Proper MainActor isolation**
```swift
@MainActor
class UserViewModel: ObservableObject {
    @Published var users: [User] = []  // ✅ MainActor-isolated

    func loadUsers() async {
        // Always runs on main actor
    }
}
```

✅ **Good: Custom actor for background work**
```swift
actor DatabaseManager {
    private var cache: [String: Data] = [:]  // ✅ Actor-isolated

    func save(_ data: Data, forKey key: String) {
        cache[key] = data
    }

    func fetch(forKey key: String) -> Data? {
        return cache[key]
    }
}
```

### 1.2 Sendable Conformance

**Check for:**
- [ ] Types crossing actor boundaries conform to Sendable
- [ ] Value types (struct, enum) are implicitly Sendable
- [ ] Reference types explicitly marked with Sendable where appropriate
- [ ] Non-Sendable types properly isolated

**Examples:**

❌ **Bad: Non-Sendable type crossing actors**
```swift
class UserData {  // ❌ Class without Sendable
    var name: String
}

actor DataStore {
    func save(_ data: UserData) {  // ⚠️ Warning: non-Sendable type
        // ...
    }
}
```

✅ **Good: Sendable struct**
```swift
struct UserData: Sendable {  // ✅ Value type is Sendable
    let name: String
}

actor DataStore {
    func save(_ data: UserData) {  // ✅ OK
        // ...
    }
}
```

✅ **Good: Sendable reference type**
```swift
final class UserData: @unchecked Sendable {  // ✅ Explicitly Sendable
    private let lock = NSLock()
    private var _name: String

    var name: String {
        lock.lock()
        defer { lock.unlock() }
        return _name
    }
    // Thread-safe implementation
}
```

### 1.3 Async/Await Patterns

**Check for:**
- [ ] Async/await used instead of completion handlers
- [ ] Structured concurrency (Task, TaskGroup) over unstructured
- [ ] Proper error propagation with async throws
- [ ] No blocking the main thread

**Examples:**

❌ **Bad: Completion handler**
```swift
func fetchUser(id: UUID, completion: @escaping (Result<User, Error>) -> Void) {
    // Old pattern
}
```

✅ **Good: Async/await**
```swift
func fetchUser(id: UUID) async throws -> User {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}
```

❌ **Bad: Unstructured concurrency**
```swift
func loadData() {
    Task {  // ❌ Unstructured, no cancellation handling
        await fetchUsers()
    }
    Task {
        await fetchPosts()
    }
}
```

✅ **Good: Structured concurrency**
```swift
func loadData() async {
    await withTaskGroup(of: Void.self) { group in
        group.addTask { await self.fetchUsers() }
        group.addTask { await self.fetchPosts() }
        // All tasks complete before function returns
    }
}
```

### 1.4 Data Race Prevention

**Check for:**
- [ ] No mutable global state
- [ ] No mutable static properties (use actors or @MainActor)
- [ ] No unsynchronized shared state between actors
- [ ] Proper use of Task-local values

**Examples:**

❌ **Bad: Mutable global state**
```swift
var currentUser: User?  // ❌ Mutable global - data race!

func updateUser(_ user: User) {
    currentUser = user  // ❌ Can be called from multiple threads
}
```

✅ **Good: Actor-isolated state**
```swift
@MainActor
final class UserManager {
    static let shared = UserManager()
    private(set) var currentUser: User?  // ✅ MainActor-isolated

    func updateUser(_ user: User) {
        currentUser = user  // ✅ Always on main actor
    }
}
```

✅ **Good: Task-local value**
```swift
enum RequestID {
    @TaskLocal static var current: UUID?
}

func processRequest() async {
    await RequestID.$current.withValue(UUID()) {
        await handleRequest()  // Has access to RequestID.current
    }
}
```

### 1.5 Migration to Swift 6

**Check for:**
- [ ] Gradual migration approach (per-module or per-file)
- [ ] Swift 6 language mode enabled incrementally
- [ ] Concurrency warnings addressed
- [ ] Deprecated APIs replaced

**Migration Checklist:**
```swift
// Enable Swift 6 mode in Build Settings
// SWIFT_VERSION = 6.0

// Or per-file
// swift-tools-version: 6.0

// Check for warnings
// Build Settings > Swift Compiler > Code Generation
// Swift Language Version: Swift 6
```

---

## 2. Error Handling

### 2.1 Typed Throws (Swift 6+)

**Check for:**
- [ ] Typed throws for specific error types
- [ ] Error propagation without generic Error
- [ ] Meaningful error types

**Examples:**

❌ **Bad: Generic Error**
```swift
func fetchUser(id: UUID) throws -> User {  // ❌ What errors can it throw?
    // ...
}
```

✅ **Good: Typed throws**
```swift
enum UserError: Error {
    case notFound
    case invalidData
}

func fetchUser(id: UUID) throws(UserError) -> User {  // ✅ Explicit error type
    // ...
}

// Caller knows exactly what to catch
do {
    let user = try fetchUser(id: userID)
} catch UserError.notFound {
    // Handle not found
} catch UserError.invalidData {
    // Handle invalid data
}
```

### 2.2 Result Type

**Check for:**
- [ ] Result type for recoverable errors in async contexts
- [ ] Proper success/failure handling
- [ ] Meaningful error types

**Examples:**

✅ **Good: Result type**
```swift
func fetchUser(id: UUID) async -> Result<User, NetworkError> {
    do {
        let user = try await networkService.fetch(User.self, id: id)
        return .success(user)
    } catch let error as NetworkError {
        return .failure(error)
    } catch {
        return .failure(.unknown)
    }
}

// Usage
let result = await fetchUser(id: userID)
switch result {
case .success(let user):
    // Handle success
case .failure(let error):
    // Handle error
}
```

### 2.3 Force Try Audit

**Check for:**
- [ ] No `try!` (force try) unless absolutely justified
- [ ] Proper error handling with do-catch or Result
- [ ] Comments explaining any necessary force tries

**Examples:**

❌ **Bad: Force try**
```swift
let user = try! decoder.decode(User.self, from: data)  // ❌ Can crash!
```

✅ **Good: Proper error handling**
```swift
do {
    let user = try decoder.decode(User.self, from: data)
    return user
} catch {
    logger.error("Failed to decode user: \(error)")
    return nil
}
```

✅ **Acceptable: Force try with justification**
```swift
// Static JSON bundled with app - guaranteed to be valid
let defaultConfig = try! decoder.decode(
    Config.self,
    from: bundledJSONData
)  // Force try justified: bundled resource
```

### 2.4 Error Types

**Check for:**
- [ ] Custom error enums for domain-specific errors
- [ ] LocalizedError conformance for user-facing errors
- [ ] Descriptive error messages

**Examples:**

✅ **Good: Custom error enum**
```swift
enum LoginError: Error {
    case invalidCredentials
    case accountLocked
    case networkFailure(underlying: Error)
}

extension LoginError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password"
        case .accountLocked:
            return "Your account has been locked. Please contact support."
        case .networkFailure:
            return "Network connection failed. Please try again."
        }
    }
}
```

---

## 3. Optionals Handling

### 3.1 Force Unwrap Audit

**Check for:**
- [ ] No force unwrapping (`!`) unless absolutely justified
- [ ] No forced casting (`as!`)
- [ ] Comments explaining any necessary force unwraps

**Examples:**

❌ **Bad: Force unwrap**
```swift
let user = userRepository.currentUser!  // ❌ Can crash!
let name = user.name!
```

✅ **Good: Guard statement**
```swift
guard let user = userRepository.currentUser else {
    logger.error("No current user")
    return
}
let name = user.name ?? "Unknown"
```

✅ **Good: If-let binding**
```swift
if let user = userRepository.currentUser {
    displayUser(user)
} else {
    showLoginScreen()
}
```

✅ **Good: Optional chaining**
```swift
let username = userRepository.currentUser?.name ?? "Guest"
```

### 3.2 Implicitly Unwrapped Optionals

**Check for:**
- [ ] Avoid `!` declarations unless absolutely necessary
- [ ] Use regular optionals with proper unwrapping
- [ ] Only use IUO for IBOutlets or when guaranteed to be set

**Examples:**

❌ **Bad: Unnecessary IUO**
```swift
class UserViewModel {
    var authService: AuthService!  // ❌ Why IUO?
}
```

✅ **Good: Regular optional or non-optional**
```swift
class UserViewModel {
    let authService: AuthService  // ✅ Non-optional with DI

    init(authService: AuthService) {
        self.authService = authService
    }
}
```

✅ **Acceptable: IBOutlet**
```swift
class LoginViewController: UIViewController {
    @IBOutlet weak var emailTextField: UITextField!  // ✅ Acceptable for IB
}
```

### 3.3 Nil Coalescing

**Check for:**
- [ ] Appropriate use of ?? operator
- [ ] Meaningful default values
- [ ] No force unwrapping when ?? can be used

**Examples:**

✅ **Good: Nil coalescing**
```swift
let username = user.name ?? "Guest"
let count = items?.count ?? 0
let config = loadConfig() ?? Config.default
```

---

## 4. Access Control

### 4.1 Explicit Access Control

**Check for:**
- [ ] Explicit access control (not relying on defaults)
- [ ] Private for implementation details
- [ ] Internal for module-level sharing
- [ ] Public only for API surface
- [ ] File-private for file-scoped sharing

**Examples:**

❌ **Bad: Implicit access control**
```swift
struct User {  // ❌ Implicit internal
    var name: String  // ❌ Implicit internal
}
```

✅ **Good: Explicit access control**
```swift
public struct User {  // ✅ Explicit public
    public let name: String  // ✅ Explicit public
    private let id: UUID  // ✅ Explicit private

    public init(name: String, id: UUID) {  // ✅ Public init
        self.name = name
        self.id = id
    }
}
```

### 4.2 Minimizing API Surface

**Check for:**
- [ ] Private by default
- [ ] Only expose what's necessary
- [ ] Final classes when inheritance not needed

**Examples:**

✅ **Good: Minimal API surface**
```swift
public protocol AuthService {
    func login(email: String, password: String) async throws -> User
}

internal final class DefaultAuthService: AuthService {  // ✅ Internal, final
    private let networkClient: NetworkClient  // ✅ Private
    private let tokenStorage: TokenStorage  // ✅ Private

    internal init(networkClient: NetworkClient, tokenStorage: TokenStorage) {
        self.networkClient = networkClient
        self.tokenStorage = tokenStorage
    }

    public func login(email: String, password: String) async throws -> User {
        // Implementation
    }

    private func validateCredentials(email: String, password: String) -> Bool {
        // ✅ Private helper
    }
}
```

### 4.3 @testable Import

**Check for:**
- [ ] Internal types testable via @testable import
- [ ] No need to make things public for testing
- [ ] Proper test target configuration

**Examples:**

✅ **Good: Internal types with @testable**
```swift
// In main target
internal final class UserViewModel {  // ✅ Internal
    internal func fetchUsers() async {  // ✅ Internal
        // Implementation
    }
}

// In test target
@testable import MyApp

final class UserViewModelTests: XCTestCase {
    func testFetchUsers() async {
        let viewModel = UserViewModel()  // ✅ Accessible via @testable
        await viewModel.fetchUsers()
    }
}
```

---

## 5. Naming Conventions

### 5.1 Swift API Design Guidelines

**Check for:**
- [ ] Clear, descriptive names
- [ ] Proper parameter labels (argument labels + parameter names)
- [ ] Methods start with verbs
- [ ] Bool properties start with `is`, `has`, `should`
- [ ] Types use UpperCamelCase
- [ ] Properties/variables use lowerCamelCase

**Examples:**

❌ **Bad: Poor naming**
```swift
func get(id: UUID) -> User  // ❌ Unclear
func userFetch(uuid: UUID) -> User  // ❌ Non-standard
var loading: Bool  // ❌ Unclear
let max_retry: Int  // ❌ Snake case
```

✅ **Good: Swift API Design Guidelines**
```swift
func fetchUser(withID id: UUID) async throws -> User  // ✅ Clear, verb-based
var isLoading: Bool  // ✅ Bool prefix
let maximumRetryCount: Int  // ✅ Descriptive, camelCase
```

### 5.2 Argument Labels

**Check for:**
- [ ] Fluent usage at call site
- [ ] Argument labels clarify purpose
- [ ] Omit labels when context is clear

**Examples:**

❌ **Bad: Unclear at call site**
```swift
func validate(_ email: String, _ password: String) -> Bool
// Usage: validate(email, password)  // ❌ Unclear
```

✅ **Good: Clear argument labels**
```swift
func validate(email: String, password: String) -> Bool
// Usage: validate(email: userEmail, password: userPassword)  // ✅ Clear
```

✅ **Good: Fluent external labels**
```swift
func move(from start: Point, to end: Point)
// Usage: move(from: origin, to: destination)  // ✅ Reads like English
```

### 5.3 Type Naming

**Check for:**
- [ ] Noun-based type names
- [ ] Protocols describe capabilities (-able, -ing)
- [ ] Clear, non-abbreviated names

**Examples:**

✅ **Good: Type naming**
```swift
struct User { }  // ✅ Noun
class UserViewModel { }  // ✅ Descriptive
protocol Authenticating { }  // ✅ Capability
protocol DataStorage { }  // ✅ Capability
enum NetworkError { }  // ✅ Descriptive
```

---

## 6. Type Inference vs Explicit Types

### 6.1 When to Use Type Inference

**Check for:**
- [ ] Type inference for obvious types
- [ ] Explicit types for clarity
- [ ] Explicit types for public APIs

**Examples:**

✅ **Good: Type inference**
```swift
let username = "john@example.com"  // ✅ Obviously String
let count = items.count  // ✅ Obviously Int
let viewModel = LoginViewModel()  // ✅ Clear from initializer
```

✅ **Good: Explicit types for clarity**
```swift
let timeout: TimeInterval = 30  // ✅ Clarifies unit (seconds)
let coordinates: (latitude: Double, longitude: Double) = (37.7749, -122.4194)
let handler: ((Result<User, Error>) -> Void)? = nil  // ✅ Complex type
```

✅ **Good: Explicit types in public APIs**
```swift
public func fetchUser(id: UUID) async throws -> User {  // ✅ Explicit return
    // Implementation
}
```

---

## 7. Value Types vs Reference Types

### 7.1 Struct vs Class

**Check for:**
- [ ] Structs for value semantics (data models)
- [ ] Classes for identity and reference semantics
- [ ] Actors for concurrent mutable state
- [ ] Protocols for abstraction

**Examples:**

✅ **Good: Struct for data**
```swift
struct User {  // ✅ Value type for data
    let id: UUID
    let name: String
    let email: String
}
```

✅ **Good: Class for identity**
```swift
@MainActor
final class UserViewModel: ObservableObject {  // ✅ Reference type for state
    @Published var users: [User] = []
}
```

✅ **Good: Actor for concurrent state**
```swift
actor DatabaseManager {  // ✅ Actor for thread-safe mutable state
    private var cache: [UUID: User] = [:]
}
```

### 7.2 Copy-on-Write

**Check for:**
- [ ] Structs with large data use copy-on-write
- [ ] Custom copy-on-write for performance-critical code

**Examples:**

✅ **Good: Copy-on-write for large data**
```swift
struct LargeDataSet {
    private var storage: Storage  // ✅ Reference type storage

    private final class Storage {
        var data: [Int]
        init(data: [Int]) { self.data = data }
    }

    mutating func append(_ value: Int) {
        if !isKnownUniquelyReferenced(&storage) {
            storage = Storage(data: storage.data)  // ✅ Copy on write
        }
        storage.data.append(value)
    }
}
```

---

## 8. Property Wrappers

### 8.1 Built-in Property Wrappers

**Check for:**
- [ ] Appropriate use of property wrappers
- [ ] No misuse or overuse

**Common Property Wrappers:**

| Property Wrapper | Use Case |
|-----------------|----------|
| `@Published` | Observable properties (with ObservableObject) |
| `@State` | View-local state (SwiftUI) |
| `@Binding` | Two-way binding (SwiftUI) |
| `@Environment` | Dependency injection (SwiftUI) |
| `@AppStorage` | UserDefaults-backed properties |
| `@MainActor` | Main thread isolation |
| `@TaskLocal` | Task-local values |

**Examples:**

✅ **Good: Appropriate property wrapper use**
```swift
@MainActor
final class UserViewModel: ObservableObject {
    @Published var users: [User] = []  // ✅ For ObservableObject
    @Published var isLoading: Bool = false
}

struct UserView: View {
    @State private var selectedUser: User?  // ✅ View-local state
    @Environment(\.dismiss) private var dismiss  // ✅ Environment
}
```

---

## 9. Code Organization

### 9.1 MARK Comments

**Check for:**
- [ ] MARK comments for logical sections
- [ ] Consistent section ordering
- [ ] Separation of protocol conformances

**Examples:**

✅ **Good: Organized with MARK**
```swift
final class UserViewModel {
    // MARK: - Properties
    private let authService: AuthService
    @Published var users: [User] = []

    // MARK: - Initialization
    init(authService: AuthService) {
        self.authService = authService
    }

    // MARK: - Public Methods
    func fetchUsers() async {
        // Implementation
    }

    // MARK: - Private Methods
    private func parseUsers(_ data: Data) -> [User] {
        // Implementation
    }
}

// MARK: - Equatable
extension UserViewModel: Equatable {
    static func == (lhs: UserViewModel, rhs: UserViewModel) -> Bool {
        // Implementation
    }
}
```

### 9.2 Extensions for Protocol Conformances

**Check for:**
- [ ] Protocol conformances in separate extensions
- [ ] Logical grouping of related functionality

**Examples:**

✅ **Good: Extensions for protocols**
```swift
struct User {
    let id: UUID
    let name: String
}

// MARK: - Identifiable
extension User: Identifiable { }

// MARK: - Codable
extension User: Codable { }

// MARK: - Equatable
extension User: Equatable { }

// MARK: - CustomStringConvertible
extension User: CustomStringConvertible {
    var description: String {
        "User(id: \(id), name: \(name))"
    }
}
```

---

## 10. Modern Swift Features

### 10.1 Swift 6 Features

**Check for:**
- [ ] Use of new Swift 6 features where appropriate
- [ ] Typed throws
- [ ] Strict concurrency checking
- [ ] Noncopyable types (where applicable)

**Examples:**

✅ **Good: Typed throws**
```swift
func fetchUser(id: UUID) throws(NetworkError) -> User {
    // Implementation
}
```

✅ **Good: Noncopyable types**
```swift
struct FileHandle: ~Copyable {  // ✅ Swift 6: noncopyable
    private let descriptor: Int32

    consuming func close() {
        // Close file descriptor
    }
}
```

### 10.2 Availability Attributes

**Check for:**
- [ ] Availability attributes for new APIs
- [ ] Backward compatibility considerations
- [ ] Feature detection for platform-specific code

**Examples:**

✅ **Good: Availability attributes**
```swift
@available(iOS 17.0, macOS 14.0, *)
func modernFeature() {
    // Use iOS 17+ APIs
}

func compatibleFunction() {
    if #available(iOS 17.0, *) {
        modernFeature()
    } else {
        // Fallback implementation
    }
}
```

---

## Quick Reference Checklist

### Critical Issues
- [ ] No data races (shared mutable state)
- [ ] No force unwraps (`!`, `as!`, `try!`)
- [ ] Proper actor isolation
- [ ] MainActor for UI code

### High Priority
- [ ] Async/await instead of completion handlers
- [ ] Typed throws for error handling
- [ ] Sendable conformance for types crossing actors
- [ ] Explicit access control

### Medium Priority
- [ ] Proper naming conventions
- [ ] MARK comments for organization
- [ ] Protocol conformances in extensions
- [ ] Meaningful error types

### Low Priority
- [ ] Type inference vs explicit types
- [ ] Comments for complex logic
- [ ] Consistent code style

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
**Swift Version**: 6.0+
