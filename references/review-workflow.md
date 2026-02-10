# Swift/SwiftUI Code Review Workflow

This document provides a detailed, step-by-step workflow for reviewing Swift and SwiftUI code changes. Follow this process to ensure comprehensive, consistent, and actionable code reviews.

## Overview

The review workflow consists of four main phases:
1. **Context Gathering**: Understand the project and scope
2. **Automated Analysis**: Run quality checks across categories
3. **Report Generation**: Aggregate and organize findings
4. **Delivery**: Present actionable feedback

---

## Phase 1: Context Gathering

### Step 1.1: Read Project-Specific Guidelines

**Objective**: Understand the project's coding standards and architecture

**Actions:**

1. **Check for .claude/CLAUDE.md**
   ```bash
   # Check if project guidelines exist
   if [ -f .claude/CLAUDE.md ]; then
       echo "Project guidelines found"
   fi
   ```

2. **Read the Guidelines File**
   - Look for sections on:
     - Coding standards
     - Architecture patterns (MVVM, MVI, TCA)
     - Dependency injection approach
     - Error handling patterns
     - Testing requirements
     - Design system guidelines
     - Navigation patterns

3. **Read Related Architecture Documents**
   Common files to check:
   - `.claude/DependencyInjection-Architecture.md`
   - `.claude/Design System Structure.md`
   - `.claude/Navigation-Architecture.md`
   - `.claude/Testing-Guidelines.md`

4. **Extract Key Standards**
   - Custom naming conventions
   - Required property wrappers
   - Error handling patterns
   - ViewModel structure
   - Repository patterns
   - Testing coverage requirements

**Example Checklist:**
```markdown
Project Guidelines Summary:
- Architecture: MVVM with Coordinators
- DI: Constructor injection preferred
- State Management: @Observable for ViewModels
- Error Handling: Result<Success, Error> pattern
- Testing: Minimum 80% coverage
- Design System: Use AppColors, AppFonts, AppSpacing
```

### Step 1.2: Identify Review Scope

**Objective**: Determine which files to review and what changed

**Scenarios:**

#### Scenario A: Review Pull Request / Merge Request

**GitHub (using gh CLI):**
```bash
# Get PR details
gh pr view 123

# Get PR diff
gh pr diff 123 > pr_changes.diff

# List changed files
gh pr view 123 --json files -q '.files[].path'

# Get PR description
gh pr view 123 --json body -q '.body'
```

**GitLab (using glab CLI):**
```bash
# Get MR details
glab mr view 456

# Get MR diff
glab mr diff 456 > mr_changes.diff

# List changed files
glab mr view 456 --json

# Get MR description
glab mr view 456 --json
```

**What to Extract:**
- List of changed files
- Nature of changes (addition, modification, deletion)
- PR/MR description and context
- Related issue/ticket numbers
- Author comments

#### Scenario B: Review Uncommitted Changes

```bash
# Get all uncommitted changes
git diff > uncommitted_changes.diff

# Get staged changes only
git diff --cached > staged_changes.diff

# List modified files
git diff --name-only

# Get status for context
git status
```

#### Scenario C: Review Specific Files

When user specifies files directly:
```bash
# User says: "Review LoginView.swift and LoginViewModel.swift"
# Simply read those files
```

#### Scenario D: Review Specific Directory

```bash
# User says: "Review all ViewModels in Features/"
# Find all ViewModel files
find Features/ -name "*ViewModel.swift"
```

**Categorize Changes:**

After identifying files, categorize by type:
- **UI Code**: Views, view modifiers, SwiftUI components
- **Business Logic**: ViewModels, services, use cases
- **Data Layer**: Repositories, network clients, database
- **Infrastructure**: Dependency injection, configuration
- **Tests**: Unit tests, UI tests, integration tests
- **Build**: Project configuration, build scripts

### Step 1.3: Parse Diff for Context

**Objective**: Understand what actually changed in each file

**Diff Format:**
```diff
diff --git a/Sources/Features/Login/LoginView.swift b/Sources/Features/Login/LoginView.swift
index abc123..def456 100644
--- a/Sources/Features/Login/LoginView.swift
+++ b/Sources/Features/Login/LoginView.swift
@@ -15,7 +15,8 @@ struct LoginView: View {
     var body: some View {
         VStack(spacing: 20) {
-            TextField("Username", text: $username)
+            TextField("Email", text: $email)
+                .textInputAutocapitalization(.never)
         }
     }
 }
```

**Extraction Strategy:**

1. **Identify Changed Lines**
   - Lines starting with `-` are removed
   - Lines starting with `+` are added
   - Lines with context (no prefix) are unchanged

2. **Track Line Numbers**
   - `@@ -15,7 +15,8 @@` means:
     - Original file: 7 lines starting at line 15
     - New file: 8 lines starting at line 15

3. **Group Related Changes**
   - Multiple changes in same function/method
   - Changes that span logical blocks
   - Related changes across files

4. **Determine Change Type**
   - **Addition**: New functionality
   - **Modification**: Behavior change
   - **Deletion**: Removed code
   - **Refactoring**: Structure change, same behavior
   - **Bug Fix**: Error correction

### Step 1.4: Read Files for Full Context

**Objective**: Understand the complete file, not just the diff

**Why Read Full Files:**
- Diff doesn't show overall structure
- Need to understand surrounding code
- Verify consistency with rest of file
- Check for patterns used elsewhere

**What to Read:**

1. **Changed Files**
   - Read complete file content
   - Understand overall structure
   - Note existing patterns
   - Check for related code

2. **Related Files**
   - Files imported by changed files
   - Files that import changed files
   - Protocol definitions
   - Parent classes or base views

**Example:**
```swift
// If reviewing LoginView.swift, also read:
// - LoginViewModel.swift (referenced in view)
// - AuthService.swift (used by view model)
// - FormTextField.swift (component used in view)
```

### Step 1.5: Understand Change Purpose

**Objective**: Know why the change was made

**Sources of Information:**

1. **PR/MR Description**
   - Feature description
   - Problem being solved
   - Implementation approach

2. **Commit Messages**
   ```bash
   # Get commit messages for PR
   gh pr view 123 --json commits -q '.commits[].commit.message'
   ```

3. **Linked Issues/Tickets**
   - User stories
   - Bug reports
   - Technical requirements

4. **Code Comments**
   - New comments explaining changes
   - TODO or FIXME markers

**Create a Context Summary:**
```markdown
Change Context:
- Purpose: Add email validation to login flow
- Scope: LoginView, LoginViewModel, ValidationService
- Type: Feature enhancement
- Risk: Medium (affects authentication flow)
- Testing: Unit tests added for ValidationService
```

---

## Phase 2: Automated Analysis

### Step 2.1: Swift Best Practices Check

**Reference**: `swift-best-practices` skill

**What to Check:**

#### Concurrency Safety
```swift
// ❌ Bad: Mutable state without synchronization
class ViewModel {
    var data: [Item] = []  // Can be accessed from any thread
}

// ✅ Good: MainActor for UI state
@MainActor
class ViewModel: ObservableObject {
    @Published var data: [Item] = []
}
```

**Checks:**
- [ ] All UI-related classes marked with `@MainActor`
- [ ] Mutable state properly isolated with actors
- [ ] Sendable conformance for types crossing actor boundaries
- [ ] No data races (shared mutable state)
- [ ] Async/await used instead of completion handlers
- [ ] Structured concurrency (Task, TaskGroup)

#### Error Handling
```swift
// ❌ Bad: Force try
let data = try! decoder.decode(Model.self, from: json)

// ✅ Good: Typed throws (Swift 6+)
func fetchUser() throws(NetworkError) -> User {
    // Implementation
}

// ✅ Good: Result type
func fetchUser() async -> Result<User, NetworkError> {
    // Implementation
}
```

**Checks:**
- [ ] No `try!` (force try)
- [ ] Proper error propagation
- [ ] Typed throws where appropriate
- [ ] Result type for recoverable errors
- [ ] Meaningful error messages

#### Optionals Handling
```swift
// ❌ Bad: Force unwrap
let user = userRepository.currentUser!

// ✅ Good: Guard or if-let
guard let user = userRepository.currentUser else {
    logger.error("No current user")
    return
}

// ✅ Good: Optional chaining
let username = userRepository.currentUser?.name ?? "Guest"
```

**Checks:**
- [ ] No force unwrapping (`!`)
- [ ] No forced casting (`as!`)
- [ ] Proper optional handling (guard, if-let, nil coalescing)
- [ ] Optional chaining used appropriately

#### Access Control
```swift
// ✅ Good: Explicit access control
public protocol AuthService {
    func login(email: String, password: String) async throws -> User
}

internal final class DefaultAuthService: AuthService {
    private let networkClient: NetworkClient
    private let tokenStorage: TokenStorage

    internal init(networkClient: NetworkClient, tokenStorage: TokenStorage) {
        self.networkClient = networkClient
        self.tokenStorage = tokenStorage
    }
}
```

**Checks:**
- [ ] Explicit access control (not relying on defaults)
- [ ] Private for internal implementation details
- [ ] Internal for module-level sharing
- [ ] Public only for API surface
- [ ] Final classes when inheritance not needed

#### Naming Conventions
```swift
// ✅ Good: Swift API Design Guidelines
func fetchUser(withID id: UUID) async throws -> User
func validate(email: String) -> Bool
var isLoading: Bool
let maximumRetryCount: Int
```

**Checks:**
- [ ] Clear, descriptive names
- [ ] Proper parameter labels (argument labels + parameter names)
- [ ] Bool properties start with `is`, `has`, `should`
- [ ] Methods start with verbs
- [ ] Types use UpperCamelCase
- [ ] Properties/variables use lowerCamelCase

### Step 2.2: SwiftUI Quality Check

**Reference**: `swiftui-expert-skill`

#### State Management
```swift
// ✅ Good: @Observable for view models
@Observable
final class LoginViewModel {
    var email: String = ""
    var isLoading: Bool = false

    func login() async {
        // Implementation
    }
}

struct LoginView: View {
    let viewModel: LoginViewModel

    var body: some View {
        // View updates automatically when viewModel properties change
    }
}
```

**Checks:**
- [ ] @Observable used for view models (iOS 17+)
- [ ] @State for view-local state
- [ ] @Binding for two-way bindings
- [ ] @Environment for dependency injection
- [ ] No @StateObject with @Observable
- [ ] No @ObservedObject with @Observable
- [ ] Correct state ownership

#### Property Wrapper Selection Guide
| Scenario | Property Wrapper |
|----------|-----------------|
| View-local state (private to view) | `@State` |
| Two-way binding from parent | `@Binding` |
| Observable view model (iOS 17+) | `@Observable` class |
| Legacy view model (iOS 16-) | `@StateObject` or `@ObservedObject` |
| Environment dependency | `@Environment` |
| App-wide shared state | `@Environment` with custom key |
| UserDefaults-backed | `@AppStorage` |
| Keychain-backed | Custom property wrapper |

**Checks:**
- [ ] Correct property wrapper for use case
- [ ] No unnecessary state (derived values computed)
- [ ] State changes trigger appropriate view updates
- [ ] No state in static views

#### Modern API Usage
```swift
// ❌ Bad: Deprecated API
.onAppear {
    viewModel.load()
}

// ✅ Good: Modern task modifier
.task {
    await viewModel.load()
}

// ❌ Bad: GeometryReader for simple cases
GeometryReader { geometry in
    Text("Hello")
        .frame(width: geometry.size.width)
}

// ✅ Good: Use frame with maxWidth
Text("Hello")
    .frame(maxWidth: .infinity)
```

**Checks:**
- [ ] No deprecated APIs (if modern alternatives exist)
- [ ] `.task` instead of `.onAppear` for async work
- [ ] `.onChange` with new syntax (iOS 17+)
- [ ] `NavigationStack` instead of `NavigationView`
- [ ] `@Observable` instead of `ObservableObject` (iOS 17+)
- [ ] Avoid GeometryReader unless necessary

#### View Composition
```swift
// ❌ Bad: Monolithic view
struct LoginView: View {
    var body: some View {
        VStack {
            // 200 lines of UI code
        }
    }
}

// ✅ Good: Extracted subviews
struct LoginView: View {
    var body: some View {
        VStack {
            LoginHeaderView()
            LoginFormView()
            LoginActionsView()
        }
    }
}
```

**Checks:**
- [ ] View body < 50 lines (guideline)
- [ ] Logical subviews extracted
- [ ] Reusable components identified
- [ ] Proper view hierarchy depth
- [ ] No excessive nesting (< 5 levels)

#### Accessibility
```swift
// ✅ Good: Accessibility support
TextField("Email", text: $email)
    .accessibilityLabel("Email address")
    .accessibilityHint("Enter your email to log in")
    .textContentType(.emailAddress)
    .keyboardType(.emailAddress)
    .textInputAutocapitalization(.never)

Button("Log In") {
    login()
}
.accessibilityLabel("Log in button")
.accessibilityAddTraits(.isButton)
```

**Checks:**
- [ ] Accessibility labels for non-text elements
- [ ] Accessibility hints for complex interactions
- [ ] Proper traits (button, header, etc.)
- [ ] Support for Dynamic Type
- [ ] Keyboard navigation support
- [ ] VoiceOver tested (if critical UI)

### Step 2.3: Performance Check

**Reference**: `swiftui-performance-audit`

#### View Optimization
```swift
// ❌ Bad: Heavy computation in body
struct ItemListView: View {
    let items: [Item]

    var body: some View {
        let sortedItems = items.sorted { $0.date > $1.date }  // ❌ Computed every render
        List(sortedItems) { item in
            ItemRow(item: item)
        }
    }
}

// ✅ Good: Computed property or view model
struct ItemListView: View {
    let viewModel: ItemListViewModel

    var body: some View {
        List(viewModel.sortedItems) { item in  // ✅ Cached in view model
            ItemRow(item: item)
        }
    }
}
```

**Checks:**
- [ ] No heavy computation in `body`
- [ ] No synchronous network calls in `body`
- [ ] No database queries in `body`
- [ ] Expensive computations cached or memoized
- [ ] View models have Equatable conformance

#### ForEach Performance
```swift
// ❌ Bad: Unstable identity
List {
    ForEach(items.indices, id: \.self) { index in  // ❌ Index-based
        ItemRow(item: items[index])
    }
}

// ✅ Good: Stable identity
List {
    ForEach(items) { item in  // ✅ Using Identifiable
        ItemRow(item: item)
    }
}
```

**Checks:**
- [ ] ForEach uses stable IDs (Identifiable or explicit id)
- [ ] No index-based iteration when data changes
- [ ] No array enumerated() in ForEach
- [ ] Proper identity for animations

#### Layout Performance
```swift
// ❌ Bad: Excessive GeometryReader
GeometryReader { geometry in
    VStack {
        ForEach(items) { item in
            GeometryReader { itemGeometry in  // ❌ Nested GeometryReader
                ItemView(item: item, width: itemGeometry.size.width)
            }
        }
    }
}

// ✅ Good: Use layout protocol or simple frames
VStack {
    ForEach(items) { item in
        ItemView(item: item)
            .frame(maxWidth: .infinity)  // ✅ Simple frame
    }
}
```

**Checks:**
- [ ] Minimal GeometryReader usage
- [ ] No nested GeometryReaders
- [ ] Layout protocol for custom layouts
- [ ] Efficient frame calculations

#### Resource Management
```swift
// ❌ Bad: Loading large image synchronously
struct PhotoView: View {
    let imageURL: URL

    var body: some View {
        if let data = try? Data(contentsOf: imageURL),  // ❌ Synchronous load
           let image = UIImage(data: data) {
            Image(uiImage: image)
        }
    }
}

// ✅ Good: Async loading with caching
struct PhotoView: View {
    let imageURL: URL

    var body: some View {
        AsyncImage(url: imageURL) { phase in  // ✅ Async with built-in caching
            switch phase {
            case .success(let image):
                image.resizable().aspectRatio(contentMode: .fit)
            case .failure:
                Image(systemName: "photo")
            case .empty:
                ProgressView()
            @unknown default:
                EmptyView()
            }
        }
    }
}
```

**Checks:**
- [ ] AsyncImage for remote images
- [ ] Image caching implemented
- [ ] No synchronous I/O on main thread
- [ ] Lazy loading for large lists
- [ ] Proper memory management (no retain cycles)

### Step 2.4: Security & Safety Check

#### Force Unwrap Audit
```bash
# Search for force unwraps
grep -n "!" *.swift | grep -v "// "  # Exclude comments
grep -n "as!" *.swift
grep -n "try!" *.swift
```

**Checks:**
- [ ] No `!` force unwraps
- [ ] No `as!` forced casts
- [ ] No `try!` forced try
- [ ] Justify exceptions with comments

#### Sensitive Data
```swift
// ❌ Bad: Storing password in UserDefaults
UserDefaults.standard.set(password, forKey: "password")

// ✅ Good: Using Keychain
KeychainService.shared.save(password, forKey: "user_password")

// ❌ Bad: Logging sensitive data
logger.debug("User password: \(password)")

// ✅ Good: Sanitized logging
logger.debug("User logged in successfully")
```

**Checks:**
- [ ] No sensitive data in UserDefaults
- [ ] Keychain used for passwords, tokens
- [ ] No sensitive data in logs
- [ ] Secure network communication (HTTPS)
- [ ] No hardcoded credentials

#### Input Validation
```swift
// ✅ Good: Email validation
func isValid(email: String) -> Bool {
    let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
    let predicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
    return predicate.evaluate(with: email)
}

// ✅ Good: Bounds checking
func fetchItem(at index: Int) -> Item? {
    guard items.indices.contains(index) else {
        return nil
    }
    return items[index]
}
```

**Checks:**
- [ ] User input validated
- [ ] Bounds checking for array access
- [ ] Type safety enforced
- [ ] SQL injection prevention (if using SQL)
- [ ] XSS prevention (if rendering web content)

### Step 2.5: Architecture & Maintainability Check

#### Project Architecture Compliance
```swift
// Example: MVVM Pattern

// ✅ Good: Clear separation
// View - Presentation only
struct LoginView: View {
    let viewModel: LoginViewModel

    var body: some View {
        // UI only, no business logic
    }
}

// ViewModel - Business logic
@Observable
final class LoginViewModel {
    private let authService: AuthService

    var email: String = ""
    var isLoading: Bool = false

    func login() async {
        // Business logic
    }
}

// Service - Data operations
protocol AuthService {
    func login(email: String, password: String) async throws -> User
}
```

**Checks:**
- [ ] Follows project architecture (MVVM, MVI, TCA)
- [ ] Clear layer separation (View/ViewModel/Service)
- [ ] No business logic in views
- [ ] No UI code in view models
- [ ] Dependency injection used
- [ ] Protocol-oriented design

#### Code Organization
```swift
// ✅ Good: Organized with extensions
struct LoginView: View {
    // MARK: - Properties
    let viewModel: LoginViewModel

    // MARK: - Body
    var body: some View {
        // Implementation
    }
}

// MARK: - Subviews
private extension LoginView {
    var headerView: some View {
        // Implementation
    }
}

// MARK: - Actions
private extension LoginView {
    func handleLogin() {
        // Implementation
    }
}
```

**Checks:**
- [ ] Logical file organization
- [ ] MARK comments for sections
- [ ] Extensions for protocol conformances
- [ ] Private extensions for private members
- [ ] Consistent file structure across project

#### Testability
```swift
// ✅ Good: Testable design
protocol AuthService {
    func login(email: String, password: String) async throws -> User
}

final class LoginViewModel {
    private let authService: AuthService  // ✅ Protocol for mocking

    init(authService: AuthService) {
        self.authService = authService
    }
}

// Test
final class LoginViewModelTests: XCTestCase {
    func testLogin() async throws {
        let mockAuthService = MockAuthService()  // ✅ Easy to mock
        let viewModel = LoginViewModel(authService: mockAuthService)
        // Test
    }
}
```

**Checks:**
- [ ] Dependencies are protocols (mockable)
- [ ] Constructor injection used
- [ ] No singletons (or testable singletons)
- [ ] Pure functions where possible
- [ ] Tests exist for critical paths

### Step 2.6: Project-Specific Standards Check

**Load Custom Guidelines:**
1. Read `.claude/CLAUDE.md`
2. Extract project-specific rules
3. Validate code against custom patterns

**Common Custom Standards:**

#### Example: Custom Error Handling
```swift
// Project standard: All errors must conform to AppError
protocol AppError: Error {
    var message: String { get }
    var code: Int { get }
}

// ✅ Good: Follows project standard
enum LoginError: AppError {
    case invalidCredentials
    case networkFailure

    var message: String {
        switch self {
        case .invalidCredentials: return "Invalid email or password"
        case .networkFailure: return "Network connection failed"
        }
    }

    var code: Int {
        switch self {
        case .invalidCredentials: return 1001
        case .networkFailure: return 2001
        }
    }
}
```

**Checks:**
- [ ] Custom error protocol conformance
- [ ] Project naming conventions
- [ ] Required ViewParsing patterns
- [ ] Design system usage (colors, fonts, spacing)
- [ ] Navigation patterns
- [ ] Testing coverage requirements

---

## Phase 3: Report Generation

### Step 3.1: Categorize Findings

**Severity Levels:**

#### Critical
- Security vulnerabilities
- Data races and concurrency issues
- Force unwraps that can crash
- Memory leaks
- Breaking API changes

#### High
- Performance problems (O(n²) algorithms, excessive renders)
- Anti-patterns (improper state management, retain cycles)
- Major architecture violations
- Missing error handling

#### Medium
- Code quality issues (complex methods, duplication)
- Missing documentation
- Minor architecture inconsistencies
- Accessibility gaps

#### Low
- Style inconsistencies
- Naming improvements
- Refactoring suggestions
- Minor optimizations

### Step 3.2: Include Positive Feedback

**Acknowledge Good Practices:**
```markdown
✅ **Excellent State Management** (LoginView.swift:23)
- Proper use of @Observable for view model
- Clean separation of concerns
- Immutable state design
```

**Types of Positive Feedback:**
- Modern API adoption
- Strong architecture adherence
- Excellent test coverage
- Clear documentation
- Performance optimizations
- Security best practices

### Step 3.3: Add Refactoring Suggestions

**Proactive Improvements:**
```markdown
💡 **Consider Extracting Subview** (LoginView.swift:45-78)
- The login form could be extracted into a reusable component
- Benefits: Better testability, improved reusability
- Suggested: Create `LoginFormView` component
```

### Step 3.4: Organize by File and Category

**Structure:**
```markdown
## File: LoginView.swift

### ✅ Positive Feedback
1. [positive item]

### 🔴 Critical Issues
1. [critical item]

### 🟡 High Priority
1. [high item]

### 🟠 Medium Priority
1. [medium item]

### 🔵 Low Priority
1. [low item]

### 💡 Refactoring Suggestions
1. [suggestion item]
```

---

## Phase 4: Delivery

### Step 4.1: Generate Summary

```markdown
# Code Review Report

## Summary
- **Files Reviewed**: 5
- **Total Findings**: 15
- **Critical**: 1
- **High**: 3
- **Medium**: 6
- **Low**: 5
- **Positive Feedback**: 12
- **Refactoring Suggestions**: 4

## Executive Summary
This PR adds email validation to the login flow. Overall code quality is good
with modern SwiftUI patterns and proper architecture. One critical concurrency
issue must be fixed before merge. Several opportunities for performance
optimization identified.
```

### Step 4.2: Format with Code Examples

**Before/After Examples:**
```markdown
#### 🔴 Data Race Risk (LoginViewModel.swift:45)
**Severity**: Critical
**Category**: Concurrency

**Issue**: Mutable state accessed without synchronization

**Current Code:**
```swift
class LoginViewModel {
    var isLoading = false  // ❌ Can be accessed from any thread
}
```

**Recommended Fix:**
```swift
@MainActor
class LoginViewModel: ObservableObject {
    @Published var isLoading = false  // ✅ MainActor-isolated
}
```

**Reference**: swift-best-practices/references/concurrency.md
```

### Step 4.3: Provide Actionable Items

```markdown
## Prioritized Action Items

### Must Fix (Before Merge)
- [ ] Fix data race in LoginViewModel.swift:45
- [ ] Remove force unwrap in LoginView.swift:89

### Should Fix (This Sprint)
- [ ] Add documentation to AuthService protocol
- [ ] Improve error handling in NetworkClient.swift
- [ ] Add unit tests for ValidationService

### Consider (Future)
- [ ] Extract login form into separate view
- [ ] Implement retry logic for network failures
- [ ] Add loading states for better UX
```

---

## Tips for Effective Reviews

### Do's
✅ Read project guidelines first
✅ Understand the context and purpose
✅ Provide balanced feedback (positive + negative)
✅ Be specific with file:line references
✅ Include code examples for fixes
✅ Explain *why* something is an issue
✅ Prioritize by severity
✅ Suggest improvements, not just problems
✅ Link to documentation and resources

### Don'ts
❌ Review without reading .claude/CLAUDE.md
❌ Only provide criticism (no positive feedback)
❌ Be vague ("this could be better")
❌ Nitpick style without real impact
❌ Ignore project-specific standards
❌ Review code you haven't read completely
❌ Suggest fixes without examples

---

## Appendix: Git Commands Reference

### Common Git Operations

```bash
# View diff
git diff                          # Uncommitted changes
git diff --cached                 # Staged changes
git diff HEAD~1                   # Last commit
git diff branch1..branch2         # Between branches

# View specific file diff
git diff path/to/file.swift

# View commit
git show <commit-hash>

# View file at specific commit
git show <commit-hash>:path/to/file.swift

# List changed files
git diff --name-only
git diff --name-status            # With status (M, A, D)

# View log
git log --oneline
git log --graph --oneline --all

# View file history
git log --follow -- path/to/file.swift
```

### GitHub CLI (gh)

```bash
# View PR
gh pr view 123
gh pr view 123 --json title,body,files

# View PR diff
gh pr diff 123

# View PR checks
gh pr checks 123

# List PR files
gh pr view 123 --json files -q '.files[].path'

# View PR comments
gh pr view 123 --json comments
```

### GitLab CLI (glab)

```bash
# View MR
glab mr view 456

# View MR diff
glab mr diff 456

# List MR files
glab mr view 456 --json

# View MR notes
glab mr note list 456
```

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
