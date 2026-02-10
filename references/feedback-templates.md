# Feedback Templates

This document provides templates for code review feedback, including positive acknowledgments, issue reports across all severity levels, and refactoring suggestions. Use these templates to ensure consistent, constructive, and actionable code reviews.

---

## 1. Severity Classification

### Severity Levels

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **Critical** | Security vulnerabilities, crashes, data loss, data races | Must fix before merge | Force unwraps with user data, data races, SQL injection, exposed credentials |
| **High** | Performance issues, anti-patterns, major architecture violations | Should fix before merge | Blocking main thread, memory leaks, O(n²) algorithms, improper concurrency |
| **Medium** | Code quality issues, missing documentation, minor violations | Fix in current sprint | Complex methods, code duplication, missing tests, accessibility gaps |
| **Low** | Style inconsistencies, suggestions, minor improvements | Consider for future | Naming improvements, refactoring opportunities, minor optimizations |

### Classification Guidelines

**Critical Severity:**
- Can cause app crashes
- Security vulnerabilities (data leaks, injection attacks)
- Data races or concurrency issues
- Data corruption or loss

**High Severity:**
- Significant performance degradation
- Memory leaks or excessive memory usage
- Major architecture violations
- Breaking API changes without migration

**Medium Severity:**
- Code complexity (cyclomatic complexity > 10)
- Missing error handling
- Incomplete test coverage
- Minor accessibility issues
- Missing documentation for public APIs

**Low Severity:**
- Style guide violations (spacing, naming)
- Opportunities for refactoring
- Minor optimizations
- Suggestions for improvement

---

## 2. Positive Feedback Templates

### 2.1 Modern API Adoption

**Template:**
```markdown
✅ **Excellent Modern API Usage** ([file]:[line])
- [Specific modern API or pattern used]
- Benefits: [List benefits: better performance, cleaner code, etc.]
- Great example for other developers to follow
```

**Examples:**
```markdown
✅ **Excellent Modern API Usage** (LoginView.swift:45)
- Using @Observable instead of ObservableObject for iOS 17+
- Benefits: Cleaner syntax, better performance, automatic dependency tracking
- Great example for other developers to follow
```

```markdown
✅ **Outstanding Async/Await Implementation** (NetworkService.swift:23)
- Properly structured async operations with error handling
- Uses TaskGroup for concurrent operations
- Excellent concurrency safety with MainActor isolation
```

### 2.2 Architecture Excellence

**Template:**
```markdown
✅ **Strong Architecture Adherence** ([file]:[line])
- [Specific pattern or principle followed]
- Clear separation of concerns
- Easy to test and maintain
```

**Examples:**
```markdown
✅ **Strong Architecture Adherence** (UserViewModel.swift:12)
- Perfect MVVM implementation with dependency injection
- Clear separation between business logic and presentation
- All dependencies are protocol-based for easy testing
```

```markdown
✅ **Excellent Repository Pattern** (UserRepository.swift:34)
- Well-structured caching strategy
- Proper error handling at all levels
- Clear abstraction over data sources
```

### 2.3 Code Quality

**Template:**
```markdown
✅ **High Code Quality** ([file]:[line])
- [Specific quality aspect]
- [Impact on codebase]
```

**Examples:**
```markdown
✅ **High Code Quality** (ValidationService.swift:56)
- Comprehensive input validation
- Clear, descriptive error messages
- Excellent test coverage (95%)
```

```markdown
✅ **Outstanding Error Handling** (LoginUseCase.swift:78)
- Typed throws for specific error cases
- Graceful degradation on failures
- Helpful error messages for users
```

### 2.4 Performance Optimization

**Template:**
```markdown
✅ **Great Performance Optimization** ([file]:[line])
- [Specific optimization]
- Impact: [Performance improvement]
```

**Examples:**
```markdown
✅ **Great Performance Optimization** (ItemListView.swift:123)
- Using LazyVStack for efficient rendering
- Stable ForEach identity for smooth animations
- Equatable conformance reduces unnecessary updates
```

### 2.5 Accessibility Support

**Template:**
```markdown
✅ **Excellent Accessibility Support** ([file]:[line])
- Comprehensive accessibility labels and hints
- Dynamic Type support
- VoiceOver friendly
```

**Examples:**
```markdown
✅ **Excellent Accessibility Support** (ProfileView.swift:89)
- Clear accessibility labels for all interactive elements
- Proper trait assignment (.isButton, .isHeader)
- Adapts layout for large text sizes
```

### 2.6 Security Awareness

**Template:**
```markdown
✅ **Strong Security Practices** ([file]:[line])
- [Specific security measure]
- Protects against: [Security threat]
```

**Examples:**
```markdown
✅ **Strong Security Practices** (AuthService.swift:34)
- Using Keychain for credential storage
- Biometric authentication implemented
- No sensitive data in logs
```

---

## 3. Issue Report Templates

### 3.1 Critical Issues

**Template:**
```markdown
🔴 **[Issue Title]** ([file]:[line])
**Severity**: Critical
**Category**: [Concurrency/Security/Safety/etc.]

**Issue**: [Clear description of the problem]

**Risk**: [What could happen - crashes, data loss, security breach]

**Current Code:**
```swift
[Show problematic code]
```

**Recommended Fix:**
```swift
[Show corrected code]
```

**Reference**: [Link to documentation or best practice guide]
```

**Examples:**

```markdown
🔴 **Data Race Risk** (LoginViewModel.swift:45)
**Severity**: Critical
**Category**: Concurrency

**Issue**: Mutable state accessed from multiple threads without synchronization

**Risk**: Can cause data corruption, crashes, or undefined behavior when multiple threads access `isLoading` simultaneously

**Current Code:**
```swift
class LoginViewModel {
    var isLoading = false  // ❌ Can be accessed from any thread

    func login() {
        Task {
            isLoading = true  // ❌ Potential data race
            // Login logic
            isLoading = false
        }
    }
}
```

**Recommended Fix:**
```swift
@MainActor
class LoginViewModel: ObservableObject {
    @Published var isLoading = false  // ✅ MainActor-isolated

    func login() async {
        isLoading = true
        // Login logic
        isLoading = false
    }
}
```

**Reference**: swift-best-practices/references/concurrency.md
```

```markdown
🔴 **Force Unwrap Can Crash** (UserDetailView.swift:89)
**Severity**: Critical
**Category**: Safety

**Issue**: Force unwrapping optional user data that may be nil

**Risk**: App will crash if user data is nil (e.g., network failure, cache miss)

**Current Code:**
```swift
let user = userRepository.currentUser!  // ❌ Can crash
let name = user.name!
```

**Recommended Fix:**
```swift
guard let user = userRepository.currentUser else {
    logger.error("No current user")
    return
}
let name = user.name ?? "Unknown"
```

**Reference**: Project coding standard (.claude/CLAUDE.md:45)
```

### 3.2 High Priority Issues

**Template:**
```markdown
🟡 **[Issue Title]** ([file]:[line])
**Severity**: High
**Category**: [Performance/Architecture/etc.]

**Issue**: [Description]

**Impact**: [Performance degradation, maintainability, etc.]

**Current Code:**
```swift
[Problematic code]
```

**Recommended Fix:**
```swift
[Better approach]
```

**Why This Matters**: [Explanation]
```

**Examples:**

```markdown
🟡 **Blocking Main Thread** (ImageLoader.swift:56)
**Severity**: High
**Category**: Performance

**Issue**: Synchronous image loading blocks the main thread

**Impact**: UI freezes during image download, poor user experience

**Current Code:**
```swift
if let data = try? Data(contentsOf: imageURL),  // ❌ Blocks main thread
   let image = UIImage(data: data) {
    self.image = image
}
```

**Recommended Fix:**
```swift
AsyncImage(url: imageURL) { phase in  // ✅ Async loading
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
```

**Why This Matters**: Blocking the main thread causes the UI to freeze, creating a poor user experience. AsyncImage handles loading asynchronously with built-in caching.
```

### 3.3 Medium Priority Issues

**Template:**
```markdown
🟠 **[Issue Title]** ([file]:[line])
**Severity**: Medium
**Category**: [Code Quality/Documentation/etc.]

**Issue**: [Description]

**Suggestion**: [How to improve]

**Benefits**: [Why this improvement helps]
```

**Examples:**

```markdown
🟠 **Missing Documentation** (AuthService.swift:12)
**Severity**: Medium
**Category**: Documentation

**Issue**: Public protocol methods lack documentation

**Suggestion**: Add DocC comments explaining parameters, return values, and potential errors

**Benefits**:
- Improves code discoverability
- Helps other developers understand API usage
- Generates better documentation

**Example:**
```swift
/// Authenticates a user with email and password
///
/// - Parameters:
///   - email: User's email address
///   - password: User's password
/// - Returns: Authenticated user object
/// - Throws: `LoginError` if credentials are invalid or network fails
func login(email: String, password: String) async throws -> User
```
```

### 3.4 Low Priority Issues

**Template:**
```markdown
🔵 **[Suggestion Title]** ([file]:[line])
**Severity**: Low
**Category**: [Style/Refactoring/etc.]

**Observation**: [What you noticed]

**Suggestion**: [Optional improvement]

**Note**: This is a minor suggestion and not required
```

**Examples:**

```markdown
🔵 **Consider More Descriptive Name** (UserViewModel.swift:78)
**Severity**: Low
**Category**: Style

**Observation**: Method name `process()` is vague

**Suggestion**: Consider renaming to `processUserData()` or `transformUsersForDisplay()`

**Note**: This is a minor suggestion to improve code clarity
```

---

## 4. Refactoring Suggestion Templates

### 4.1 Extract Subview

**Template:**
```markdown
💡 **Consider Extracting Subview** ([file]:[lines])

**Observation**: View body is lengthy and could be broken down

**Suggestion**: Extract [specific section] into a separate view component

**Benefits**:
- Improved readability
- Better testability
- Potential reusability

**Example:**
```swift
// Extract this section into LoginFormView
private struct LoginFormView: View {
    // Extracted view
}
```
```

### 4.2 Simplify Logic

**Template:**
```markdown
💡 **Simplify Complex Logic** ([file]:[line])

**Observation**: [What makes it complex]

**Suggestion**: [How to simplify]

**Benefits**: Easier to understand and maintain

**Example:**
```swift
// Current approach
[Current code]

// Simplified approach
[Simpler code]
```
```

### 4.3 Extract Reusable Component

**Template:**
```markdown
💡 **Potential Reusable Component** ([file]:[line])

**Observation**: Similar pattern used in [other files]

**Suggestion**: Extract into shared component in design system

**Benefits**:
- Consistency across app
- Single source of truth
- Easier to update globally
```

### 4.4 Performance Optimization

**Template:**
```markdown
💡 **Performance Optimization Opportunity** ([file]:[line])

**Observation**: [Current approach and its limitation]

**Suggestion**: [Optimized approach]

**Expected Impact**: [Performance improvement]

**Trade-offs**: [Any downsides to consider]
```

---

## 5. Complete Review Report Template

```markdown
# Code Review Report

## Summary
- **Files Reviewed**: [X]
- **Total Findings**: [Y]
- **Critical**: [N]
- **High**: [N]
- **Medium**: [N]
- **Low**: [N]
- **Positive Feedback**: [N]
- **Refactoring Suggestions**: [N]

## Executive Summary
[Brief overview of the changes and overall code quality assessment]

---

## Detailed Findings

### File: [FilePath]

#### ✅ Positive Feedback

1. **[Positive Item Title]** (line [N])
   - [Details]

#### 🔴 Critical Issues

1. **[Issue Title]** (line [N])
   - **Severity**: Critical
   - **Category**: [Category]
   - **Issue**: [Description]
   - **Fix**: [Solution]

#### 🟡 High Priority

1. **[Issue Title]** (line [N])
   - **Severity**: High
   - **Category**: [Category]
   - **Issue**: [Description]
   - **Fix**: [Solution]

#### 🟠 Medium Priority

1. **[Issue Title]** (line [N])
   - **Severity**: Medium
   - **Category**: [Category]
   - **Issue**: [Description]
   - **Suggestion**: [Improvement]

#### 🔵 Low Priority

1. **[Suggestion Title]** (line [N])
   - **Severity**: Low
   - **Category**: [Category]
   - **Observation**: [What was noticed]
   - **Suggestion**: [Optional improvement]

#### 💡 Refactoring Suggestions

1. **[Suggestion Title]** (lines [N-M])
   - [Description and benefits]

---

## Prioritized Action Items

### Must Fix (Critical/High)
- [ ] [Critical item 1]
- [ ] [Critical item 2]
- [ ] [High priority item 1]

### Should Fix (Medium)
- [ ] [Medium item 1]
- [ ] [Medium item 2]

### Consider (Low)
- [ ] [Low priority item 1]
- [ ] [Refactoring suggestion 1]

---

## Positive Patterns Observed
- [Positive pattern 1]
- [Positive pattern 2]
- [Positive pattern 3]

## References
- [Swift Best Practices](~/.claude/skills/swift-best-practices/SKILL.md)
- [SwiftUI Expert Guide](~/.claude/skills/swiftui-expert-skill/SKILL.md)
- [Project Coding Standards](.claude/CLAUDE.md)

---

## Overall Assessment

**Code Quality**: [Excellent/Good/Fair/Needs Improvement]

**Architecture**: [Well-designed/Acceptable/Needs refactoring]

**Testing**: [Comprehensive/Adequate/Insufficient]

**Recommendation**: [Approve/Approve with comments/Request changes]

**Additional Notes**: [Any other observations or recommendations]
```

---

## 6. Best Practices for Feedback

### Do's
✅ Be specific with file and line numbers
✅ Provide code examples for fixes
✅ Explain *why* something is an issue
✅ Balance criticism with positive feedback
✅ Prioritize by severity
✅ Link to relevant documentation
✅ Suggest improvements, not just problems
✅ Be constructive and respectful

### Don'ts
❌ Be vague ("this could be better")
❌ Only provide criticism (no positive feedback)
❌ Nitpick style without impact
❌ Use harsh or dismissive language
❌ Suggest fixes without explaining why
❌ Ignore project-specific standards
❌ Review without reading the full context

---

## 7. Tone and Language Guidelines

### Constructive Tone

❌ **Poor Tone:**
"This code is terrible. You don't know how to use Swift properly."

✅ **Good Tone:**
"This approach can lead to data races. Consider using @MainActor to ensure thread safety."

### Suggest, Don't Demand

❌ **Demanding:**
"You must change this immediately."

✅ **Suggesting:**
"Consider refactoring this for better maintainability."

### Acknowledge Good Work

❌ **Ignoring Positives:**
[Only lists issues]

✅ **Balanced:**
"Great job on the error handling! I noticed one area where we can improve performance..."

### Educational Approach

❌ **Just Pointing Out:**
"This is wrong."

✅ **Educational:**
"This can cause memory leaks. When using closures with self, use [weak self] to avoid retain cycles. Here's an example..."

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
