# Custom Project Guidelines Integration

This guide explains how to read, parse, and validate code against project-specific standards defined in `.claude/CLAUDE.md` and related architecture documents.

---

## 1. Overview

### Purpose

Project-specific guidelines allow teams to:
- Define custom coding standards
- Document architecture decisions
- Establish testing requirements
- Define design system usage
- Set project-specific error handling patterns
- Document navigation patterns

### Common Locations

```
.claude/
├── CLAUDE.md                           # Main coding standards
├── DependencyInjection-Architecture.md # DI patterns
├── Design System Structure.md          # Design system usage
├── Navigation-Architecture.md          # Navigation patterns
├── Testing-Guidelines.md               # Testing requirements
├── Error-Handling.md                   # Error handling patterns
└── API-Guidelines.md                   # API design standards
```

---

## 2. Reading .claude/CLAUDE.md

### 2.1 Locating the File

**Check for:**
- [ ] `.claude/CLAUDE.md` exists in repository root
- [ ] Related architecture docs in `.claude/` directory
- [ ] Project-specific subdirectories

**Example Commands:**
```bash
# Check if .claude/CLAUDE.md exists
if [ -f .claude/CLAUDE.md ]; then
    echo "Project guidelines found"
fi

# List all .claude files
ls -la .claude/

# Find all markdown files in .claude
find .claude -name "*.md"
```

### 2.2 Common Sections in CLAUDE.md

**Typical Structure:**

```markdown
# Project Coding Standards

## Architecture
- Architecture pattern (MVVM, MVI, TCA, etc.)
- Layer organization
- Module structure

## Swift Style Guide
- Naming conventions
- Code formatting
- Documentation requirements

## SwiftUI Patterns
- State management approach
- Property wrapper usage
- View composition guidelines

## Dependency Injection
- DI approach (constructor, environment, etc.)
- Service location rules

## Error Handling
- Error type patterns
- Error reporting strategy
- User-facing error messages

## Testing
- Test coverage requirements
- Testing patterns
- Mock/stub conventions

## Design System
- Color palette usage
- Typography standards
- Spacing system
- Component library

## Navigation
- Navigation pattern
- Deep linking approach
- State restoration

## Performance
- Performance benchmarks
- Optimization priorities

## Security
- Authentication approach
- Data storage rules
- API security
```

### 2.3 Parsing Sections

**Strategy:**

1. **Read entire file**
2. **Identify sections** (markdown headers)
3. **Extract rules and patterns** from each section
4. **Create checklist** for validation

**Example Parsing Logic:**

```swift
struct ProjectGuidelines {
    let architecture: ArchitectureGuidelines
    let swiftStyle: SwiftStyleGuidelines
    let swiftUIPatterns: SwiftUIGuidelines
    let dependencyInjection: DIGuidelines
    let errorHandling: ErrorHandlingGuidelines
    let testing: TestingGuidelines
    let designSystem: DesignSystemGuidelines
    let navigation: NavigationGuidelines

    static func parse(from markdown: String) -> ProjectGuidelines {
        // Parse markdown sections into structured guidelines
    }
}
```

---

## 3. Extracting Coding Standards

### 3.1 Architecture Patterns

**What to Extract:**

```markdown
## Architecture

We use **MVVM with Coordinators**:

- Views: SwiftUI views, presentation only
- ViewModels: @Observable classes, business logic
- Models: Data structures and domain logic
- Coordinators: Navigation flow management
- Repositories: Data access abstraction
- Use Cases: Single business operations

### Rules
1. ViewModels MUST use @Observable (iOS 17+)
2. All dependencies MUST be injected via constructor
3. Views MUST NOT contain business logic
4. Navigation MUST go through Coordinator
```

**Extracted Rules:**
- ✅ ViewModels use @Observable
- ✅ Constructor injection required
- ✅ No business logic in views
- ✅ Coordinator-based navigation

**Validation:**
```swift
// Check: ViewModel uses @Observable
// ❌ Violation
class UserViewModel: ObservableObject { }

// ✅ Compliant
@Observable
final class UserViewModel { }

// Check: Dependencies injected
// ❌ Violation
class ViewModel {
    let service = NetworkService.shared
}

// ✅ Compliant
class ViewModel {
    let service: NetworkService
    init(service: NetworkService) {
        self.service = service
    }
}
```

### 3.2 Swift Style Guidelines

**What to Extract:**

```markdown
## Swift Style Guide

### Naming Conventions
- Types: `UpperCamelCase`
- Properties/Methods: `lowerCamelCase`
- Protocols describing capabilities: `-able` or `-ing` suffix
- Bool properties: Prefix with `is`, `has`, `should`

### Code Organization
- Maximum file length: 400 lines
- Maximum method length: 50 lines
- Use MARK comments for sections

### Access Control
- Default to `private`
- Mark `internal` explicitly
- Public API requires DocC comments

### Error Handling
- Custom error types conform to `AppError` protocol
- Use typed throws (Swift 6+)
- No force try except for bundled resources
```

**Extracted Rules:**
- ✅ Naming conventions enforced
- ✅ File length < 400 lines
- ✅ Method length < 50 lines
- ✅ MARK comments required
- ✅ Explicit access control
- ✅ Custom errors conform to AppError
- ✅ No force try

**Validation:**
```swift
// Check: Custom error conforms to AppError
// ❌ Violation
enum LoginError: Error {
    case invalidCredentials
}

// ✅ Compliant
enum LoginError: AppError {
    case invalidCredentials

    var message: String {
        switch self {
        case .invalidCredentials: return "Invalid email or password"
        }
    }

    var code: Int {
        switch self {
        case .invalidCredentials: return 1001
        }
    }
}
```

### 3.3 SwiftUI Patterns

**What to Extract:**

```markdown
## SwiftUI Patterns

### State Management
- Use @Observable for all ViewModels (iOS 17+)
- @State for view-local state only
- @Binding for parent-child communication
- @Environment for dependency injection
- NO @StateObject or @ObservedObject with @Observable

### View Composition
- Maximum view body: 50 lines
- Extract subviews for reusability
- Use private struct for local subviews

### Property Wrappers
| Use Case | Property Wrapper |
|----------|-----------------|
| ViewModel | @Observable class |
| View-local state | @State |
| Two-way binding | @Binding |
| Dependency | @Environment |
```

**Extracted Rules:**
- ✅ @Observable for ViewModels
- ✅ No @StateObject with @Observable
- ✅ View body < 50 lines
- ✅ Proper property wrapper usage

### 3.4 Design System

**What to Extract:**

```markdown
## Design System

### Colors
Use AppColors enum only. No hardcoded colors.

```swift
// ✅ Correct
.foregroundColor(AppColors.primary)

// ❌ Wrong
.foregroundColor(.blue)
```

### Typography
Use AppFonts enum only.

```swift
// ✅ Correct
.font(AppFonts.title)

// ❌ Wrong
.font(.system(size: 24))
```

### Spacing
Use AppSpacing for all padding and spacing.

```swift
// ✅ Correct
.padding(AppSpacing.medium)

// ❌ Wrong
.padding(16)
```
```

**Extracted Rules:**
- ✅ Use AppColors, no hardcoded colors
- ✅ Use AppFonts, no system fonts
- ✅ Use AppSpacing, no magic numbers

**Validation:**
```swift
// Check: No hardcoded colors
// Search for:
.foregroundColor(.red)      // ❌ Violation
.background(.blue)          // ❌ Violation
Color(red: 0.5, ...)       // ❌ Violation

// Expected:
.foregroundColor(AppColors.primary)  // ✅ Compliant
```

### 3.5 Testing Requirements

**What to Extract:**

```markdown
## Testing Guidelines

### Requirements
- Minimum test coverage: 80%
- All ViewModels MUST have unit tests
- All Use Cases MUST have unit tests
- Critical user flows MUST have UI tests

### Testing Patterns
- Arrange-Act-Assert pattern
- Mock all dependencies
- One assertion per test (when possible)
- Descriptive test names: `test[Method]_[Scenario]_[ExpectedOutcome]`

### Example
```swift
func testLogin_withValidCredentials_succeeds() async {
    // Arrange
    mockAuthService.loginResult = .success(user)
    viewModel.email = "test@example.com"
    viewModel.password = "password"

    // Act
    await viewModel.login()

    // Assert
    XCTAssertNil(viewModel.error)
}
```
```

**Extracted Rules:**
- ✅ 80% test coverage minimum
- ✅ ViewModels tested
- ✅ Use Cases tested
- ✅ Arrange-Act-Assert pattern
- ✅ Descriptive test names

---

## 4. Validation Against Custom Guidelines

### 4.1 Architecture Validation

**Checklist:**

```markdown
Architecture Compliance:
- [ ] Follows defined pattern (MVVM, etc.)
- [ ] Layer separation enforced
- [ ] Dependencies injected properly
- [ ] No architecture violations
```

**Example Validation:**

```swift
// File: LoginViewModel.swift

// Check 1: Uses @Observable (project requirement)
@Observable  // ✅ Compliant
final class LoginViewModel {

    // Check 2: Dependencies injected via constructor
    private let authService: AuthService  // ✅ Protocol
    private let loginUseCase: LoginUseCase

    init(authService: AuthService, loginUseCase: LoginUseCase) {  // ✅ Injected
        self.authService = authService
        self.loginUseCase = loginUseCase
    }

    // Check 3: Business logic in ViewModel, not View
    func login() async {  // ✅ Business logic here
        // Implementation
    }
}

// File: LoginView.swift
struct LoginView: View {
    let viewModel: LoginViewModel  // ✅ ViewModel injected

    var body: some View {
        // ✅ Only presentation code, no business logic
        VStack {
            TextField("Email", text: $viewModel.email)
            Button("Login") {
                Task { await viewModel.login() }  // ✅ Delegates to ViewModel
            }
        }
    }
}
```

### 4.2 Error Handling Validation

**Project Standard:**
```markdown
## Error Handling

All errors MUST conform to AppError protocol:

```swift
protocol AppError: Error {
    var message: String { get }
    var code: Int { get }
}
```

Error codes:
- 1000-1999: Authentication errors
- 2000-2999: Network errors
- 3000-3999: Database errors
- 4000-4999: Validation errors
```

**Validation:**

```swift
// ❌ Violation: Doesn't conform to AppError
enum LoginError: Error {
    case invalidCredentials
}

// ✅ Compliant: Conforms to AppError with correct code range
enum LoginError: AppError {
    case invalidCredentials
    case accountLocked

    var message: String {
        switch self {
        case .invalidCredentials: return "Invalid email or password"
        case .accountLocked: return "Account locked"
        }
    }

    var code: Int {
        switch self {
        case .invalidCredentials: return 1001  // ✅ In auth range (1000-1999)
        case .accountLocked: return 1002
        }
    }
}
```

### 4.3 Design System Validation

**Automated Checks:**

```bash
# Search for hardcoded colors
grep -r "\.foregroundColor(\." --include="*.swift" | grep -v "AppColors"

# Search for hardcoded font sizes
grep -r "\.font(\.system(size:" --include="*.swift"

# Search for magic numbers in padding
grep -r "\.padding([0-9]" --include="*.swift"
```

**Example Violations:**

```swift
// ❌ Violation: Hardcoded color
Text("Hello")
    .foregroundColor(.blue)

// ✅ Compliant: Uses design system
Text("Hello")
    .foregroundColor(AppColors.primary)

// ❌ Violation: Hardcoded spacing
VStack(spacing: 16) { }

// ✅ Compliant: Uses design system
VStack(spacing: AppSpacing.medium) { }
```

---

## 5. Reporting Custom Guideline Violations

### 5.1 Violation Template

```markdown
🔴 **Violates Project Standard: [Standard Name]** ([file]:[line])
**Severity**: [Critical/High/Medium]
**Category**: Project Standards

**Project Guideline**: [Quote from .claude/CLAUDE.md]

**Violation**: [What doesn't comply]

**Current Code:**
```swift
[Code that violates]
```

**Expected Code:**
```swift
[Code that complies]
```

**Reference**: .claude/CLAUDE.md:[section]
```

### 5.2 Example Violation Report

```markdown
🔴 **Violates Project Standard: Error Handling** (LoginViewModel.swift:45)
**Severity**: High
**Category**: Project Standards

**Project Guideline**: "All errors MUST conform to AppError protocol" (.claude/CLAUDE.md:Error Handling)

**Violation**: LoginError does not conform to AppError protocol

**Current Code:**
```swift
enum LoginError: Error {
    case invalidCredentials
}
```

**Expected Code:**
```swift
enum LoginError: AppError {
    case invalidCredentials

    var message: String {
        switch self {
        case .invalidCredentials: return "Invalid email or password"
        }
    }

    var code: Int {
        switch self {
        case .invalidCredentials: return 1001
        }
    }
}
```

**Reference**: .claude/CLAUDE.md:Error Handling
```

---

## 6. Integration with Review Process

### 6.1 Review Checklist

**Step-by-Step:**

1. **Load Project Guidelines**
   ```
   - Read .claude/CLAUDE.md
   - Read related architecture docs
   - Extract all rules and patterns
   ```

2. **Create Validation Checklist**
   ```
   - Architecture compliance
   - Coding style adherence
   - Error handling patterns
   - Design system usage
   - Testing requirements
   ```

3. **Validate Code**
   ```
   - Compare code against each rule
   - Flag violations
   - Acknowledge compliance
   ```

4. **Generate Report**
   ```
   - List all violations with references to .claude/CLAUDE.md
   - Provide positive feedback for compliance
   - Include specific line numbers and fixes
   ```

### 6.2 Prioritization

**Severity Based on Impact:**

| Violation Type | Severity | Example |
|----------------|----------|---------|
| Architecture violation | High | Business logic in View |
| Security pattern violation | Critical | Credentials in UserDefaults |
| Error handling violation | High | No AppError conformance |
| Design system violation | Medium | Hardcoded colors |
| Style guide violation | Low | Naming convention |
| Testing requirement | Medium | Missing tests |

---

## 7. Example Project Guidelines

### 7.1 Complete .claude/CLAUDE.md Example

```markdown
# MyApp Coding Standards

## Architecture

We use **MVVM with Coordinators and Repositories**.

### Layers
- **View**: SwiftUI views, presentation only
- **ViewModel**: @Observable classes, business logic
- **Coordinator**: Navigation management
- **Repository**: Data access abstraction
- **Use Case**: Single business operations

### Rules
1. ViewModels MUST use @Observable (iOS 17+)
2. All dependencies MUST be injected via constructor
3. Views MUST NOT contain business logic
4. Navigation MUST go through Coordinator

## Error Handling

All errors MUST conform to AppError:

```swift
protocol AppError: Error {
    var message: String { get }
    var code: Int { get }
}
```

Error code ranges:
- 1000-1999: Authentication
- 2000-2999: Network
- 3000-3999: Database

## Design System

### Colors
Use `AppColors` enum ONLY. No hardcoded colors.

### Typography
Use `AppFonts` enum ONLY. No system fonts.

### Spacing
Use `AppSpacing` enum ONLY. No magic numbers.

## Testing

### Requirements
- Minimum coverage: 80%
- All ViewModels MUST have unit tests
- All Use Cases MUST have unit tests
- Critical flows MUST have UI tests

### Patterns
- Arrange-Act-Assert
- Mock all dependencies
- Descriptive names: `test[Method]_[Scenario]_[Expected]`

## SwiftUI Patterns

- @Observable for ViewModels
- @State for view-local state
- @Environment for dependencies
- View body < 50 lines
- Extract reusable subviews
```

### 7.2 Validation Example

**Code to Review:**

```swift
// LoginViewModel.swift
@Observable
final class LoginViewModel {
    private let loginUseCase: LoginUseCase

    var email: String = ""
    var password: String = ""
    var isLoading: Bool = false

    init(loginUseCase: LoginUseCase) {
        self.loginUseCase = loginUseCase
    }

    func login() async {
        // Implementation
    }
}

// LoginError.swift
enum LoginError: AppError {
    case invalidCredentials

    var message: String {
        switch self {
        case .invalidCredentials: return "Invalid email or password"
        }
    }

    var code: Int {
        switch self {
        case .invalidCredentials: return 1001  // Auth range
        }
    }
}

// LoginView.swift
struct LoginView: View {
    let viewModel: LoginViewModel

    var body: some View {
        VStack(spacing: AppSpacing.medium) {
            TextField("Email", text: $viewModel.email)
                .textFieldStyle(.roundedBorder)

            SecureField("Password", text: $viewModel.password)
                .textFieldStyle(.roundedBorder)

            Button("Login") {
                Task { await viewModel.login() }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(AppSpacing.large)
    }
}
```

**Review Report:**

```markdown
## Project Standards Compliance

✅ **Excellent Architecture Adherence**
- LoginViewModel uses @Observable (required for iOS 17+)
- Dependencies injected via constructor
- No business logic in LoginView
- Clear layer separation

✅ **Error Handling Compliance**
- LoginError conforms to AppError protocol
- Error code in correct range (1000-1999 for auth)
- Descriptive error messages

✅ **Design System Usage**
- Uses AppSpacing for all spacing
- No hardcoded values
- Consistent design token usage

✅ **SwiftUI Best Practices**
- Proper property wrapper usage (@Observable)
- View body is concise (< 50 lines)
- Clear separation of concerns

**Overall**: Fully compliant with project coding standards
```

---

## 8. Quick Reference

### Files to Check
1. `.claude/CLAUDE.md` - Main standards
2. `.claude/DependencyInjection-Architecture.md` - DI patterns
3. `.claude/Design System Structure.md` - Design system
4. `.claude/Testing-Guidelines.md` - Testing standards

### Key Validation Points
- [ ] Architecture pattern followed
- [ ] Error handling conforms to project standard
- [ ] Design system used (no hardcoded values)
- [ ] Testing requirements met
- [ ] Naming conventions followed
- [ ] Dependency injection pattern used

### Severity Guidelines
- **Critical**: Security, architecture violations
- **High**: Error handling, major patterns
- **Medium**: Design system, testing
- **Low**: Style, naming

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
