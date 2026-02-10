---
name: swift-code-reviewer
description: Perform thorough code reviews for Swift/SwiftUI code, analyzing code quality, architecture, performance, security, and adherence to Swift 6+ best practices, SwiftUI patterns, iOS/macOS platform guidelines, and project-specific coding standards from .claude/CLAUDE.md. Use when reviewing code changes, performing quality audits, or providing structured feedback on Swift codebases with all severity levels and positive feedback.
---

# Swift/SwiftUI Code Review Skill

## Overview

This skill provides comprehensive code review capabilities for Swift and SwiftUI projects, combining Apple's best practices with project-specific coding standards. It performs multi-layer analysis covering code quality, architecture, performance, security, and maintainability.

### Key Capabilities

- **Project-Aware Reviews**: Reads `.claude/CLAUDE.md` and related architecture documents to validate against project-specific standards
- **Multi-Layer Analysis**: Combines Swift 6+ best practices, SwiftUI patterns, performance optimization, and security checks
- **Comprehensive Feedback**: Provides Critical/High/Medium/Low severity issues, positive feedback, and refactoring suggestions
- **Integration with Existing Skills**: Leverages `swift-best-practices`, `swiftui-expert-skill`, and `swiftui-performance-audit` for domain expertise
- **Actionable Output**: Structured feedback with file:line references, code examples, and prioritized action items

## When to Use This Skill

Use this skill when you need to:

- Review Pull Requests or Merge Requests for Swift/SwiftUI projects
- Perform code quality audits on existing codebases
- Validate code changes against project-specific standards
- Analyze individual Swift/SwiftUI files for best practices
- Review uncommitted git changes before committing
- Assess architecture and maintainability of Swift code
- Provide structured feedback to team members

**Trigger patterns:**
- "Review this PR"
- "Review [filename].swift"
- "Review my changes"
- "Code review for [component]"
- "Check if this follows our coding standards"
- "Review against .claude/CLAUDE.md"

## Review Workflow

The skill follows a **four-phase workflow** to ensure comprehensive and actionable feedback:

### Phase 1: Context Gathering

**Objective**: Understand the project context and scope of review

1. **Read Project Guidelines**
   - Load `.claude/CLAUDE.md` if it exists in the repository
   - Read related architecture documents (e.g., `DependencyInjection-Architecture.md`, `Design System Structure.md`)
   - Extract custom coding standards, patterns, and rules

2. **Identify Review Scope**
   - Determine files to review:
     - User-specified files
     - Git diff (uncommitted or PR/MR changes)
     - Modified files in a specific directory
   - Categorize changes by type (UI, logic, tests, configuration)

3. **Gather File Context**
   - Read all files that will be reviewed
   - Understand the broader context (related files, dependencies)
   - Identify the purpose and role of each component

### Phase 2: Automated Analysis

**Objective**: Run parallel checks across multiple quality dimensions

Execute checks across **six core categories**:

#### 1. Swift Best Practices
Reference: `swift-best-practices` skill knowledge base

- **Concurrency Safety**
  - Actor isolation correctness
  - MainActor usage for UI code
  - Sendable conformance
  - Data race prevention
  - Async/await patterns

- **API Design**
  - Naming conventions (Swift API Design Guidelines)
  - Parameter labels clarity
  - Return type appropriateness
  - Error handling (typed throws)

- **Language Features**
  - Availability attributes for new APIs
  - Migration to Swift 6 features
  - Avoiding deprecated patterns
  - Proper use of optionals

#### 2. SwiftUI Quality
Reference: `swiftui-expert-skill` knowledge base

- **State Management**
  - Correct property wrapper selection (@Observable, @State, @Binding, @Environment)
  - State ownership and data flow
  - Avoiding unnecessary state
  - View model patterns

- **Modern API Usage**
  - Replace deprecated APIs with modern equivalents
  - Use latest SwiftUI features (iOS 17+, macOS 14+)
  - Proper use of view modifiers
  - Composition over inheritance

- **View Composition**
  - View extraction appropriateness
  - Component reusability
  - View hierarchy depth
  - Subview organization

- **Accessibility**
  - Accessibility labels and hints
  - VoiceOver support
  - Dynamic Type support
  - Keyboard navigation

#### 3. Performance
Reference: `swiftui-performance-audit` knowledge base

- **View Optimization**
  - Unnecessary view updates
  - Heavy computation in body
  - Equatable conformance for view models
  - Lazy loading patterns

- **List Performance**
  - ForEach identity stability
  - Cell reuse patterns
  - Scroll performance
  - Large dataset handling

- **Layout Efficiency**
  - Layout thrash detection
  - GeometryReader overuse
  - Frame calculations
  - Animation performance

- **Resource Management**
  - Image loading and caching
  - Memory leaks (retain cycles)
  - Background task management
  - Network request optimization

#### 4. Security & Safety

- **Data Validation**
  - Input sanitization
  - Type safety
  - Boundary checking
  - Force unwrap audit (avoid `!` and `as!`)

- **Sensitive Data Handling**
  - Password and token management
  - Keychain usage for credentials
  - Secure data transmission
  - Log sanitization (no sensitive data in logs)

- **Platform Security**
  - Permission handling (camera, location, etc.)
  - Network security (TLS, certificate pinning)
  - Secure storage (UserDefaults vs Keychain)
  - Code signing and entitlements

#### 5. Architecture & Maintainability

- **Project Architecture Compliance**
  - Adherence to defined patterns (MVVM, MVI, TCA, etc.)
  - Layer separation (View/ViewModel/Repository/UseCase)
  - Dependency injection patterns
  - Module boundaries

- **Code Organization**
  - File structure and naming
  - Logical grouping
  - Extension organization
  - Protocol conformances

- **Testability**
  - Unit test coverage
  - Test structure (Arrange-Act-Assert)
  - Mock/stub usage
  - Test isolation

- **Documentation**
  - DocC comments for public APIs
  - Complex logic explanations
  - Architecture decision records
  - README and guides

#### 6. Project-Specific Standards

- **Custom Coding Standards**
  - Validate against `.claude/CLAUDE.md` rules
  - Check custom error handling patterns
  - Verify project-specific naming conventions
  - Validate testing requirements

- **Design System Compliance**
  - Use of design tokens
  - Consistent spacing and typography
  - Color palette adherence
  - Component library usage

- **Navigation Patterns**
  - Coordinator pattern compliance
  - Deep linking support
  - State restoration
  - Navigation flow consistency

### Phase 3: Report Generation

**Objective**: Aggregate findings into a structured, actionable report

1. **Categorize Findings by Severity**
   - **Critical**: Security vulnerabilities, data races, crashes, breaking changes
   - **High**: Performance issues, anti-patterns, major architecture violations
   - **Medium**: Code quality improvements, missing documentation, minor violations
   - **Low**: Style inconsistencies, suggestions for refactoring

2. **Include Positive Feedback**
   - Acknowledge good practices and patterns
   - Highlight excellent code quality
   - Recognize proper use of modern APIs
   - Note strong architecture decisions

3. **Add Refactoring Suggestions**
   - Proactive improvement opportunities
   - Modernization suggestions
   - Code simplification ideas
   - Performance optimization hints

4. **Group and Organize**
   - Group by file, then by category
   - Sort by severity within each file
   - Include code location references (file:line)
   - Provide specific code examples

### Phase 4: Delivery

**Objective**: Present findings in a clear, actionable format

1. **Format as Structured Markdown**
   - Executive summary with key metrics
   - Severity breakdown
   - File-by-file detailed findings
   - Positive feedback section
   - Prioritized action items

2. **Include Code References**
   - Exact file and line numbers (file.swift:123)
   - Before/after code examples
   - Links to relevant documentation
   - Comparison with project guidelines

3. **Provide Context**
   - Explain *why* something is an issue
   - Reference best practices or standards
   - Suggest specific fixes with examples
   - Link to learning resources

## Core Review Categories

### 1. Swift Language Quality

**What to Check:**
- Concurrency patterns (actors, async/await, Sendable)
- Error handling (typed throws, Result type)
- Optionals handling (avoid force unwrapping)
- Access control (public, internal, private, fileprivate)
- Naming conventions (Swift API Design Guidelines)
- Type inference vs explicit types
- Value types vs reference types

**Reference:** `references/swift-quality-checklist.md`

### 2. SwiftUI Patterns

**What to Check:**
- Property wrapper selection and usage
- State management patterns
- View lifecycle understanding
- Modern API usage (avoid deprecated)
- View composition and extraction
- Accessibility implementation
- Preview configurations

**Reference:** `references/swiftui-review-checklist.md`

### 3. Performance Optimization

**What to Check:**
- View update optimization
- ForEach identity and performance
- Heavy work in view body
- Image loading and caching
- Memory management
- Background task efficiency
- Layout performance

**Reference:** `references/performance-review.md`

### 4. Security & Safety

**What to Check:**
- Force unwrap detection (`!`, `as!`, `try!`)
- Input validation and sanitization
- Sensitive data handling (passwords, tokens)
- Keychain usage for credentials
- Network security (HTTPS, certificate pinning)
- Permission handling
- Logging safety (no sensitive data in logs)

**Reference:** `references/security-checklist.md`

### 5. Architecture & Design

**What to Check:**
- MVVM, MVI, TCA, or other architecture compliance
- Dependency injection patterns
- Separation of concerns
- Module boundaries
- Code organization
- Testability
- Documentation quality

**Reference:** `references/architecture-patterns.md`

### 6. Project-Specific Standards

**What to Check:**
- `.claude/CLAUDE.md` compliance
- Custom architecture patterns
- Design system usage
- Navigation patterns
- Error handling standards
- Testing requirements

**Reference:** `references/custom-guidelines.md`

## Integration with Existing Skills

This skill **references** (not duplicates) three foundational skills for domain expertise:

### 1. swift-best-practices
**When to Use:** Reviewing Swift language usage, concurrency patterns, API design, or Swift 6+ migration

**What it Provides:**
- Swift 6+ concurrency patterns (actors, async/await, Sendable)
- API design guidelines compliance
- Availability pattern validation
- Breaking changes detection
- Modern Swift feature adoption

**How to Leverage:**
- Read `~/.claude/skills/swift-best-practices/references/concurrency.md` for concurrency checks
- Reference `swift6-features.md` for Swift 6 migration patterns
- Use `api-design.md` for naming and parameter validation

### 2. swiftui-expert-skill
**When to Use:** Reviewing SwiftUI views, state management, or UI code

**What it Provides:**
- State management patterns (@Observable, @State, @Binding)
- Modern SwiftUI API guidance (iOS 17+, macOS 14+)
- View composition best practices
- Property wrapper selection guide
- Accessibility patterns

**How to Leverage:**
- Read `~/.claude/skills/swiftui-expert-skill/references/state-management.md` for property wrapper checks
- Reference `modern-apis.md` for deprecation detection
- Use `view-composition.md` for component structure validation

### 3. swiftui-performance-audit
**When to Use:** Performance concerns identified or mentioned in PR description

**What it Provides:**
- View update optimization patterns
- ForEach performance analysis
- Layout thrash detection
- Image handling best practices
- Memory management

**How to Leverage:**
- Read `~/.claude/skills/swiftui-performance-audit/SKILL.md` for performance audit workflow
- Reference performance-specific checks when reviewing view code
- Apply recommendations from the skill to performance-sensitive paths

**Integration Strategy:**
1. Load relevant reference files from these skills as needed
2. Apply their checklist items to the review
3. Reference their documentation in feedback
4. Avoid duplicating content—point to their knowledge base

## Platform Support

### GitHub Pull Requests
Use `gh` CLI for fetching PR data:

```bash
# Get PR details
gh pr view <PR-number>

# Get PR diff
gh pr diff <PR-number>

# List PR files
gh pr view <PR-number> --json files

# Get PR comments
gh pr view <PR-number> --json comments
```

### GitLab Merge Requests
Use `glab` CLI for fetching MR data:

```bash
# Get MR details
glab mr view <MR-number>

# Get MR diff
glab mr diff <MR-number>

# List MR files
glab mr view <MR-number> --json

# Get MR comments
glab mr note list <MR-number>
```

### Local Git Changes
For uncommitted changes or manual review:

```bash
# Get uncommitted changes
git diff

# Get staged changes
git diff --cached

# Get changes in specific files
git diff -- path/to/file.swift

# Get commit diff
git show <commit-hash>
```

## Output Format

The review report follows this structure:

```markdown
# Code Review Report

## Summary
- **Files Reviewed**: X
- **Total Findings**: Y
- **Critical**: 0
- **High**: 2
- **Medium**: 5
- **Low**: 3
- **Positive Feedback**: 8
- **Refactoring Suggestions**: 4

## Executive Summary
[Brief overview of the changes and overall code quality]

---

## Detailed Findings

### File: Sources/Features/Login/LoginView.swift

#### ✅ Positive Feedback
1. **Excellent State Management** (line 23)
   - Proper use of @Observable for view model
   - Clean separation of concerns

2. **Modern API Usage** (line 45)
   - Using new SwiftUI APIs effectively
   - Proper async/await integration

#### 🔴 Critical Issues
1. **Data Race Risk** (line 67)
   - **Severity**: Critical
   - **Category**: Concurrency
   - **Issue**: Mutable state accessed from multiple actors without synchronization
   - **Fix**:
     ```swift
     // Before
     class LoginViewModel {
         var isLoading = false
     }

     // After
     @MainActor
     class LoginViewModel: ObservableObject {
         @Published var isLoading = false
     }
     ```
   - **Reference**: swift-best-practices/references/concurrency.md

#### 🟡 High Priority
1. **Force Unwrap Detected** (line 89)
   - **Severity**: High
   - **Category**: Safety
   - **Issue**: Force unwrapping optional can cause crash
   - **Fix**:
     ```swift
     // Before
     let user = fetchUser()!

     // After
     guard let user = fetchUser() else {
         logger.error("Failed to fetch user")
         return
     }
     ```
   - **Reference**: Project coding standard (.claude/CLAUDE.md:45)

#### 💡 Refactoring Suggestions
1. **Extract Subview** (lines 120-150)
   - Consider extracting login form into separate view
   - Improves testability and reusability

---

## Prioritized Action Items

### Must Fix (Critical/High)
1. [ ] Fix data race in LoginViewModel.swift:67
2. [ ] Remove force unwrap in LoginView.swift:89

### Should Fix (Medium)
1. [ ] Add documentation to public APIs
2. [ ] Improve error handling in NetworkService.swift

### Consider (Low)
1. [ ] Refactor login form into separate view
2. [ ] Add more unit tests for edge cases

---

## Positive Patterns Observed
- Excellent use of @Observable for state management
- Consistent adherence to project architecture (MVVM)
- Comprehensive accessibility support
- Strong error handling in most areas
- Good test coverage for core functionality

## References
- [Swift Best Practices](~/.claude/skills/swift-best-practices/SKILL.md)
- [SwiftUI Expert Guide](~/.claude/skills/swiftui-expert-skill/SKILL.md)
- [Project Coding Standards](.claude/CLAUDE.md)
```

## How to Use

### Example 1: Review Specific File
```
User: "Review UserProfileView.swift"

Steps:
1. Read .claude/CLAUDE.md for project standards
2. Read UserProfileView.swift
3. Run multi-layer analysis
4. Provide structured feedback with severity levels and positive feedback
```

### Example 2: Review Git Changes
```
User: "Review my uncommitted changes"

Steps:
1. Read .claude/CLAUDE.md
2. Execute `git diff` to get changes
3. Identify modified files
4. Run analysis on each file
5. Generate comprehensive review report
```

### Example 3: Review Pull Request
```
User: "Review PR #123"

Steps:
1. Read .claude/CLAUDE.md
2. Execute `gh pr view 123` and `gh pr diff 123`
3. Identify changed files
4. Read affected files for context
5. Run multi-layer analysis
6. Generate report with file:line references
```

### Example 4: Review Against Custom Guidelines
```
User: "Review LoginViewModel.swift against our coding standards"

Steps:
1. Read .claude/CLAUDE.md
2. Read related docs (DependencyInjection-Architecture.md)
3. Read LoginViewModel.swift
4. Validate against project-specific patterns
5. Provide detailed feedback comparing with standards
```

### Example 5: Review Multiple Files
```
User: "Review all ViewModels in the Features folder"

Steps:
1. Read .claude/CLAUDE.md
2. Find all *ViewModel.swift files in Features/
3. Analyze each against architecture patterns
4. Provide file-by-file review
5. Summarize common patterns and issues across all files
```

## Resources

This skill includes the following reference materials:

### Core References
- **review-workflow.md**: Detailed step-by-step review process, git commands, and diff parsing strategies
- **feedback-templates.md**: Templates for positive/negative comments, severity classification guidelines

### Quality Checklists
- **swift-quality-checklist.md**: Swift 6+ concurrency, error handling, optionals, access control, naming
- **swiftui-review-checklist.md**: Property wrappers, state management, modern APIs, view composition
- **performance-review.md**: View updates, ForEach optimization, layout efficiency, resource management
- **security-checklist.md**: Input validation, sensitive data, keychain, network security

### Architecture & Customization
- **architecture-patterns.md**: MVVM, MVI, TCA patterns, dependency injection, testing strategies
- **custom-guidelines.md**: How to read and parse .claude/CLAUDE.md and project-specific standards

## Best Practices

1. **Always Read Project Guidelines First**
   - Load `.claude/CLAUDE.md` before starting review
   - Understand project-specific patterns and rules
   - Merge project standards with Apple guidelines

2. **Provide Balanced Feedback**
   - Include positive feedback for good practices
   - Don't just criticize—acknowledge what's done well
   - Suggest improvements, not just problems

3. **Be Specific and Actionable**
   - Include exact file:line references
   - Provide code examples for fixes
   - Explain *why* something is an issue
   - Link to relevant documentation

4. **Prioritize by Severity**
   - Critical: Must fix before merge (security, crashes, data races)
   - High: Should fix before merge (anti-patterns, performance issues)
   - Medium: Address soon (code quality, documentation)
   - Low: Consider for future (style, refactoring suggestions)

5. **Leverage Existing Skills**
   - Reference swift-best-practices for language patterns
   - Use swiftui-expert-skill for UI code
   - Apply swiftui-performance-audit for performance concerns
   - Don't duplicate their content—point to their knowledge

6. **Focus on Education**
   - Explain the reasoning behind feedback
   - Link to learning resources
   - Help developers understand best practices
   - Foster continuous improvement

## Limitations

- Cannot execute code or run tests (can only analyze statically)
- Cannot access external systems or APIs
- Limited to analyzing code provided or accessible via git
- Cannot detect runtime issues that require execution
- Performance analysis is based on patterns, not profiling data

For runtime analysis, recommend using Instruments or other profiling tools.

## Version

**Version**: 1.0.0
**Last Updated**: 2026-02-10
**Compatible with**: Swift 6+, SwiftUI (iOS 17+, macOS 14+, watchOS 10+, tvOS 17+, visionOS 1+)
