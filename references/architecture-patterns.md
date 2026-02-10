# Architecture Patterns Guide

This guide covers common architectural patterns for Swift and SwiftUI applications, including MVVM, MVI, TCA, dependency injection, testing strategies, and code organization principles.

---

## 1. MVVM (Model-View-ViewModel)

### 1.1 Overview

**Structure:**
- **View**: SwiftUI views (presentation only)
- **ViewModel**: Business logic and state management
- **Model**: Data structures and domain logic

**Responsibilities:**

| Layer | Responsibilities | Does NOT Do |
|-------|-----------------|-------------|
| **View** | - Display data<br>- User interactions<br>- UI layout | - Business logic<br>- Data fetching<br>- Validation |
| **ViewModel** | - Business logic<br>- State management<br>- Data transformation<br>- Validation | - UI code<br>- View hierarchy<br>- Direct database/network |
| **Model** | - Data structures<br>- Domain logic<br>- Business rules | - UI concerns<br>- State management |

### 1.2 Implementation Pattern

**Check for:**
- [ ] Views only contain presentation logic
- [ ] ViewModels contain all business logic
- [ ] Clear separation between View and ViewModel
- [ ] Dependency injection for services

**Examples:**

❌ **Bad: Business logic in view**
```swift
struct UserListView: View {
    @State private var users: [User] = []
    @State private var isLoading = false

    var body: some View {
        List(users) { user in
            UserRow(user: user)
        }
        .onAppear {
            loadUsers()  // ❌ Business logic in view
        }
    }

    private func loadUsers() {
        isLoading = true
        Task {
            // ❌ Network call directly in view
            let response = try await URLSession.shared.data(from: usersURL)
            users = try JSONDecoder().decode([User].self, from: response.0)
            isLoading = false
        }
    }
}
```

✅ **Good: MVVM structure**
```swift
// Model
struct User: Identifiable, Codable {
    let id: UUID
    let name: String
    let email: String
}

// ViewModel
@MainActor
@Observable
final class UserListViewModel {
    private let userRepository: UserRepository

    private(set) var users: [User] = []
    private(set) var isLoading: Bool = false
    private(set) var error: Error?

    init(userRepository: UserRepository) {
        self.userRepository = userRepository
    }

    func loadUsers() async {
        isLoading = true
        error = nil

        do {
            users = try await userRepository.fetchUsers()
        } catch {
            self.error = error
        }

        isLoading = false
    }
}

// View
struct UserListView: View {
    let viewModel: UserListViewModel

    var body: some View {
        List(viewModel.users) { user in
            UserRow(user: user)
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .task {
            await viewModel.loadUsers()  // ✅ View triggers, ViewModel handles
        }
    }
}
```

### 1.3 ViewModel Best Practices

**Check for:**
- [ ] ViewModels are @Observable (iOS 17+) or ObservableObject (iOS 16-)
- [ ] @MainActor for UI-related ViewModels
- [ ] Services injected via initializer
- [ ] ViewModels are testable (protocol-based dependencies)

---

## 2. Repository Pattern

### 2.1 Overview

**Purpose**: Abstracts data sources (network, database, cache) behind a clean interface

**Structure:**
- **Repository Protocol**: Defines data operations
- **Repository Implementation**: Implements protocol using data sources
- **Data Sources**: Network client, database, cache

### 2.2 Implementation Pattern

**Check for:**
- [ ] Repository protocols for abstraction
- [ ] Multiple data sources coordinated
- [ ] Caching strategy implemented
- [ ] Error handling at repository level

**Examples:**

✅ **Good: Repository pattern**
```swift
// Repository Protocol
protocol UserRepository {
    func fetchUsers() async throws -> [User]
    func fetchUser(id: UUID) async throws -> User
    func saveUser(_ user: User) async throws
    func deleteUser(id: UUID) async throws
}

// Repository Implementation
final class DefaultUserRepository: UserRepository {
    private let networkClient: NetworkClient
    private let database: Database
    private let cache: Cache

    init(
        networkClient: NetworkClient,
        database: Database,
        cache: Cache
    ) {
        self.networkClient = networkClient
        self.database = database
        self.cache = cache
    }

    func fetchUsers() async throws -> [User] {
        // Check cache first
        if let cached = cache.users, !cached.isEmpty {
            return cached
        }

        // Fetch from network
        let users = try await networkClient.fetchUsers()

        // Save to database and cache
        try await database.save(users)
        cache.users = users

        return users
    }

    func fetchUser(id: UUID) async throws -> User {
        // Check cache
        if let cached = cache.user(id: id) {
            return cached
        }

        // Check database
        if let local = try await database.fetchUser(id: id) {
            cache.setUser(local)
            return local
        }

        // Fetch from network
        let user = try await networkClient.fetchUser(id: id)

        // Save locally
        try await database.save(user)
        cache.setUser(user)

        return user
    }

    func saveUser(_ user: User) async throws {
        // Save to network first
        try await networkClient.saveUser(user)

        // Then save locally
        try await database.save(user)
        cache.setUser(user)
    }

    func deleteUser(id: UUID) async throws {
        // Delete from network
        try await networkClient.deleteUser(id: id)

        // Delete locally
        try await database.deleteUser(id: id)
        cache.removeUser(id: id)
    }
}
```

---

## 3. Dependency Injection

### 3.1 Constructor Injection

**Check for:**
- [ ] Dependencies passed via initializer
- [ ] Protocol-based dependencies (testable)
- [ ] No service locator or singletons

**Examples:**

❌ **Bad: Singleton dependency**
```swift
final class UserViewModel {
    func loadUsers() async {
        // ❌ Hard dependency on singleton
        let users = try await NetworkService.shared.fetchUsers()
    }
}
```

✅ **Good: Constructor injection**
```swift
final class UserViewModel {
    private let userRepository: UserRepository  // ✅ Protocol

    init(userRepository: UserRepository) {  // ✅ Injected
        self.userRepository = userRepository
    }

    func loadUsers() async {
        let users = try await userRepository.fetchUsers()
    }
}

// Usage
let viewModel = UserViewModel(
    userRepository: DefaultUserRepository(
        networkClient: networkClient,
        database: database,
        cache: cache
    )
)
```

### 3.2 Environment-Based Injection (SwiftUI)

**Check for:**
- [ ] Custom environment values for dependencies
- [ ] Environment values for cross-cutting concerns
- [ ] Proper dependency scoping

**Examples:**

✅ **Good: Environment injection**
```swift
// Define environment key
private struct UserRepositoryKey: EnvironmentKey {
    static let defaultValue: UserRepository = MockUserRepository()
}

extension EnvironmentValues {
    var userRepository: UserRepository {
        get { self[UserRepositoryKey.self] }
        set { self[UserRepositoryKey.self] = newValue }
    }
}

// Provide in app
@main
struct MyApp: App {
    let userRepository = DefaultUserRepository(...)

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.userRepository, userRepository)
        }
    }
}

// Use in view
struct UserListView: View {
    @Environment(\.userRepository) private var repository
    @State private var users: [User] = []

    var body: some View {
        List(users) { user in
            UserRow(user: user)
        }
        .task {
            users = try await repository.fetchUsers()
        }
    }
}
```

### 3.3 Dependency Container

**Check for:**
- [ ] Centralized dependency registration
- [ ] Type-safe dependency resolution
- [ ] Proper scoping (singleton, transient, scoped)

**Examples:**

✅ **Good: Simple dependency container**
```swift
final class DependencyContainer {
    static let shared = DependencyContainer()

    // Singletons
    lazy var networkClient: NetworkClient = {
        DefaultNetworkClient(configuration: .default)
    }()

    lazy var database: Database = {
        try! Database(path: databasePath)
    }()

    lazy var cache: Cache = {
        InMemoryCache()
    }()

    // Factories
    func makeUserRepository() -> UserRepository {
        DefaultUserRepository(
            networkClient: networkClient,
            database: database,
            cache: cache
        )
    }

    func makeUserViewModel() -> UserListViewModel {
        UserListViewModel(userRepository: makeUserRepository())
    }
}

// Usage
let viewModel = DependencyContainer.shared.makeUserViewModel()
```

---

## 4. Use Case / Interactor Pattern

### 4.1 Overview

**Purpose**: Encapsulates a single business operation or use case

**Benefits:**
- Single Responsibility Principle
- Easy to test
- Reusable across multiple ViewModels
- Clear business logic separation

### 4.2 Implementation Pattern

**Check for:**
- [ ] One use case per class
- [ ] Execute method for operation
- [ ] Dependencies injected
- [ ] Returns Result or throws

**Examples:**

✅ **Good: Use case pattern**
```swift
// Use case protocol
protocol UseCase {
    associatedtype Input
    associatedtype Output

    func execute(_ input: Input) async throws -> Output
}

// Login use case
struct LoginUseCase: UseCase {
    private let authRepository: AuthRepository
    private let tokenStorage: TokenStorage

    init(authRepository: AuthRepository, tokenStorage: TokenStorage) {
        self.authRepository = authRepository
        self.tokenStorage = tokenStorage
    }

    struct Input {
        let email: String
        let password: String
    }

    func execute(_ input: Input) async throws -> User {
        // Validate input
        guard validateEmail(input.email) else {
            throw LoginError.invalidEmail
        }

        guard input.password.count >= 8 else {
            throw LoginError.passwordTooShort
        }

        // Perform login
        let response = try await authRepository.login(
            email: input.email,
            password: input.password
        )

        // Store token
        try await tokenStorage.save(response.token)

        return response.user
    }

    private func validateEmail(_ email: String) -> Bool {
        // Email validation logic
        true
    }
}

// ViewModel using use case
@MainActor
@Observable
final class LoginViewModel {
    private let loginUseCase: LoginUseCase

    var email: String = ""
    var password: String = ""
    var isLoading: Bool = false
    var error: Error?

    init(loginUseCase: LoginUseCase) {
        self.loginUseCase = loginUseCase
    }

    func login() async {
        isLoading = true
        error = nil

        do {
            let input = LoginUseCase.Input(email: email, password: password)
            let user = try await loginUseCase.execute(input)
            // Handle successful login
        } catch {
            self.error = error
        }

        isLoading = false
    }
}
```

---

## 5. Coordinator Pattern

### 5.1 Overview

**Purpose**: Manages navigation flow and screen transitions

**Benefits:**
- Decouples navigation from views
- Centralized navigation logic
- Deep linking support
- Testing navigation flows

### 5.2 Implementation Pattern

**Check for:**
- [ ] Coordinator manages navigation state
- [ ] Views don't handle navigation
- [ ] Type-safe navigation
- [ ] Support for deep linking

**Examples:**

✅ **Good: Coordinator pattern**
```swift
// Route definition
enum Route: Hashable {
    case userList
    case userDetail(User)
    case userEdit(User)
    case settings
}

// Coordinator
@MainActor
@Observable
final class AppCoordinator {
    var navigationPath = NavigationPath()

    func navigate(to route: Route) {
        navigationPath.append(route)
    }

    func pop() {
        guard !navigationPath.isEmpty else { return }
        navigationPath.removeLast()
    }

    func popToRoot() {
        navigationPath.removeLast(navigationPath.count)
    }
}

// Root view with navigation
struct AppView: View {
    @State private var coordinator = AppCoordinator()

    var body: some View {
        NavigationStack(path: $coordinator.navigationPath) {
            UserListView(coordinator: coordinator)
                .navigationDestination(for: Route.self) { route in
                    destination(for: route)
                }
        }
    }

    @ViewBuilder
    private func destination(for route: Route) -> some View {
        switch route {
        case .userList:
            UserListView(coordinator: coordinator)

        case .userDetail(let user):
            UserDetailView(user: user, coordinator: coordinator)

        case .userEdit(let user):
            UserEditView(user: user, coordinator: coordinator)

        case .settings:
            SettingsView(coordinator: coordinator)
        }
    }
}

// View using coordinator
struct UserListView: View {
    let coordinator: AppCoordinator
    @State private var users: [User] = []

    var body: some View {
        List(users) { user in
            Button {
                coordinator.navigate(to: .userDetail(user))  // ✅ Coordinator handles navigation
            } label: {
                UserRow(user: user)
            }
        }
        .navigationTitle("Users")
        .toolbar {
            Button("Settings") {
                coordinator.navigate(to: .settings)
            }
        }
    }
}
```

---

## 6. Testing Strategies

### 6.1 Unit Testing

**Check for:**
- [ ] ViewModels are unit tested
- [ ] Use cases are unit tested
- [ ] Repositories are unit tested
- [ ] Mocks used for dependencies
- [ ] High code coverage (>80%)

**Examples:**

✅ **Good: Unit tests**
```swift
import XCTest
@testable import MyApp

final class LoginViewModelTests: XCTestCase {
    private var mockAuthRepository: MockAuthRepository!
    private var mockTokenStorage: MockTokenStorage!
    private var loginUseCase: LoginUseCase!
    private var viewModel: LoginViewModel!

    @MainActor
    override func setUp() {
        super.setUp()

        mockAuthRepository = MockAuthRepository()
        mockTokenStorage = MockTokenStorage()

        loginUseCase = LoginUseCase(
            authRepository: mockAuthRepository,
            tokenStorage: mockTokenStorage
        )

        viewModel = LoginViewModel(loginUseCase: loginUseCase)
    }

    @MainActor
    func testSuccessfulLogin() async throws {
        // Arrange
        let expectedUser = User(id: UUID(), name: "John", email: "john@example.com")
        mockAuthRepository.loginResult = .success(
            LoginResponse(user: expectedUser, token: "token123")
        )

        viewModel.email = "john@example.com"
        viewModel.password = "password123"

        // Act
        await viewModel.login()

        // Assert
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
        XCTAssertEqual(mockAuthRepository.loginCallCount, 1)
        XCTAssertEqual(mockTokenStorage.savedToken, "token123")
    }

    @MainActor
    func testLoginWithInvalidEmail() async {
        // Arrange
        viewModel.email = "invalid-email"
        viewModel.password = "password123"

        // Act
        await viewModel.login()

        // Assert
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNotNil(viewModel.error)
        XCTAssertEqual(mockAuthRepository.loginCallCount, 0)  // Not called
    }
}

// Mock repository
final class MockAuthRepository: AuthRepository {
    var loginResult: Result<LoginResponse, Error> = .failure(MockError.notImplemented)
    var loginCallCount = 0

    func login(email: String, password: String) async throws -> LoginResponse {
        loginCallCount += 1
        return try loginResult.get()
    }
}

enum MockError: Error {
    case notImplemented
}
```

### 6.2 UI Testing

**Check for:**
- [ ] Critical user flows tested
- [ ] Accessibility identifiers used
- [ ] Page Object pattern for organization
- [ ] Tests are maintainable

**Examples:**

✅ **Good: UI tests**
```swift
import XCTest

final class LoginUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    func testLoginFlow() {
        // Arrange
        let emailField = app.textFields["loginEmailField"]
        let passwordField = app.secureTextFields["loginPasswordField"]
        let loginButton = app.buttons["loginButton"]

        // Act
        emailField.tap()
        emailField.typeText("john@example.com")

        passwordField.tap()
        passwordField.typeText("password123")

        loginButton.tap()

        // Assert
        XCTAssertTrue(app.navigationBars["Home"].waitForExistence(timeout: 5))
    }
}
```

### 6.3 Integration Testing

**Check for:**
- [ ] Repository + network integration tested
- [ ] Database operations tested
- [ ] End-to-end flows tested
- [ ] Real dependencies used (not mocks)

---

## 7. Code Organization

### 7.1 File Structure

**Check for:**
- [ ] Logical folder organization
- [ ] Feature-based grouping
- [ ] Clear separation of concerns
- [ ] Consistent naming

**Example Structure:**
```
MyApp/
├── App/
│   ├── MyApp.swift
│   └── AppDelegate.swift
├── Core/
│   ├── Network/
│   │   ├── NetworkClient.swift
│   │   └── APIEndpoint.swift
│   ├── Database/
│   │   └── Database.swift
│   └── DependencyInjection/
│       └── DependencyContainer.swift
├── Features/
│   ├── Login/
│   │   ├── Views/
│   │   │   ├── LoginView.swift
│   │   │   └── LoginFormView.swift
│   │   ├── ViewModels/
│   │   │   └── LoginViewModel.swift
│   │   ├── UseCases/
│   │   │   └── LoginUseCase.swift
│   │   └── Models/
│   │       └── LoginError.swift
│   ├── UserList/
│   │   ├── Views/
│   │   ├── ViewModels/
│   │   └── Models/
│   └── ...
├── Domain/
│   ├── Models/
│   │   └── User.swift
│   └── Repositories/
│       ├── UserRepository.swift
│       └── AuthRepository.swift
└── Resources/
    ├── Assets.xcassets
    └── Localizable.strings
```

### 7.2 MARK Comments

**Check for:**
- [ ] Consistent MARK usage
- [ ] Logical section ordering
- [ ] Protocol conformances in extensions

**Example:**
```swift
final class UserViewModel {
    // MARK: - Properties
    private let userRepository: UserRepository
    @Published var users: [User] = []

    // MARK: - Initialization
    init(userRepository: UserRepository) {
        self.userRepository = userRepository
    }

    // MARK: - Public Methods
    func loadUsers() async {
        // Implementation
    }

    // MARK: - Private Methods
    private func processUsers(_ users: [User]) -> [User] {
        // Implementation
    }
}

// MARK: - Equatable
extension UserViewModel: Equatable {
    static func == (lhs: UserViewModel, rhs: UserViewModel) -> Bool {
        lhs.users == rhs.users
    }
}
```

---

## Quick Architecture Checklist

### Critical
- [ ] Clear separation of concerns (View/ViewModel/Model)
- [ ] Dependencies injected (no singletons or hard dependencies)
- [ ] Protocol-based abstractions
- [ ] Testable architecture

### High Priority
- [ ] Repository pattern for data access
- [ ] Use cases for business logic
- [ ] Coordinator for navigation
- [ ] Unit tests for ViewModels and use cases

### Medium Priority
- [ ] Consistent file organization
- [ ] MARK comments for sections
- [ ] Environment-based DI in SwiftUI
- [ ] Integration tests for critical paths

### Low Priority
- [ ] Dependency container
- [ ] Feature-based folder structure
- [ ] UI tests for user flows

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
