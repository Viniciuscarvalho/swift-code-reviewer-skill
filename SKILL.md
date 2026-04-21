---
name: swift-code-reviewer
description: "Multi-layer code review agent for Swift and SwiftUI projects. Analyzes PRs, diffs, and files across six dimensions: Swift 6+ concurrency safety, SwiftUI state management and modern APIs, performance (view updates, ForEach identity, lazy loading), security (force unwraps, Keychain, input validation), architecture compliance (MVVM/MVI/TCA, dependency injection), and project-specific standards from .claude/CLAUDE.md. Outputs structured reports with Critical/High/Medium/Low severity, positive feedback, and prioritized action items with file:line references. Use when the user says review this PR, review my code, review my changes, check this file, code review, audit this codebase, check code quality, review uncommitted changes, review all ViewModels, or mentions reviewing .swift files, navigation, sheets, theming, or async patterns."
---

# Swift/SwiftUI Code Review Skill

## Overview

This skill provides comprehensive code review capabilities for Swift and SwiftUI projects, combining Apple's best practices with project-specific coding standards. It performs multi-layer analysis covering code quality, architecture, performance, security, and maintainability.

### Key Capabilities

- **Project-Aware Reviews**: Reads `.claude/CLAUDE.md` and related architecture documents to validate against project-specific standards
- **Multi-Layer Analysis**: Combines Swift 6+ best practices, SwiftUI patterns, performance optimization, and security checks
- **Comprehensive Feedback**: Provides Critical/High/Medium/Low severity issues, positive feedback, and refactoring suggestions
- **Bundled Companion Skills**: Ships `swiftui-expert-skill`, `swift-concurrency`, `swift-testing`, `swift-expert`, and `swiftui-ui-patterns` in-tree under `skills/` — no extra installation required
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
   - Explain _why_ something is an issue
   - Reference best practices or standards
   - Suggest specific fixes with examples
   - Link to learning resources

## Core Review Categories

Each category has a dedicated reference file with full checklists:

1. **Swift Language Quality** — concurrency, error handling, optionals, access control, naming (`references/swift-quality-checklist.md`)
2. **SwiftUI Patterns** — property wrappers, state management, modern APIs, accessibility (`references/swiftui-review-checklist.md`)
3. **Performance** — view updates, ForEach identity, lazy loading, memory management (`references/performance-review.md`)
4. **Security & Safety** — force unwrap detection, input validation, Keychain, network security (`references/security-checklist.md`)
5. **Architecture & Design** — MVVM/MVI/TCA compliance, dependency injection, testability (`references/architecture-patterns.md`)
6. **Project-Specific Standards** — `.claude/CLAUDE.md` compliance, design system, navigation patterns (`references/custom-guidelines.md`)

## Bundled Companion Skills

Five companion skills ship inside this repo under `skills/` and are available immediately after cloning or installing — no extra setup required. Each contains a full `SKILL.md` and a `references/` directory.

> See [`skills/README.md`](skills/README.md) for the full index and attribution details.
> Original authors: [@AvdLee](https://github.com/AvdLee), [@Dimillian](https://github.com/Dimillian), [@bocato](https://github.com/bocato).

### 1. swiftui-expert-skill · `skills/swiftui-expert-skill/`

**When to use:** Reviewing SwiftUI views, state management, modern APIs, macOS scenes, Liquid Glass (iOS 26+)

**Key references:**

| File                                   | When to consult                                                          |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `references/state-management.md`       | Property wrapper selection (@State, @Binding, @Observable, @Environment) |
| `references/latest-apis.md`            | Deprecation detection — always check before flagging an API              |
| `references/view-structure.md`         | View extraction rules and composition patterns                           |
| `references/performance-patterns.md`   | Equatable conformance, body evaluation cost                              |
| `references/accessibility-patterns.md` | VoiceOver grouping, traits, Dynamic Type                                 |
| `references/liquid-glass.md`           | iOS 26+ Liquid Glass adoption and availability gating                    |

### 2. swift-concurrency · `skills/swift-concurrency/`

**When to use:** Any concurrency-related finding — actor isolation, MainActor, Sendable, async/await, Swift 6 migration

**Key references:**

| File                               | When to consult                                              |
| ---------------------------------- | ------------------------------------------------------------ |
| `references/sendable.md`           | Sendable conformance and `@unchecked Sendable` justification |
| `references/actors.md`             | Actor isolation, custom actors vs MainActor                  |
| `references/async-await-basics.md` | Structured vs unstructured tasks, `Task.detached` rationale  |
| `references/migration.md`          | Swift 6 migration patterns and blast-radius minimisation     |
| `references/testing.md`            | Concurrency-safe test patterns                               |

### 3. swift-testing · `skills/swift-testing/`

**When to use:** Reviewing test files, test doubles, snapshot tests, or XCTest migrations

**Key references:**

| File                                | When to consult                                 |
| ----------------------------------- | ----------------------------------------------- |
| `references/test-organization.md`   | Suite hierarchy, naming, and tagging            |
| `references/test-doubles.md`        | Dummy / Fake / Stub / Spy / Mock taxonomy       |
| `references/async-testing.md`       | `#expect(throws:)`, async confirmation patterns |
| `references/parameterized-tests.md` | `@Test(arguments:)` for data-driven tests       |
| `references/migration-xctest.md`    | XCTest → Swift Testing migration checklist      |

### 4. swift-expert · `skills/swift-expert/`

**When to use:** Deep Swift 6+ language questions — protocol-oriented design, memory, performance, general architecture

**Key references:**

| File                               | When to consult                                      |
| ---------------------------------- | ---------------------------------------------------- |
| `references/async-concurrency.md`  | Cross-cutting concurrency patterns                   |
| `references/protocol-oriented.md`  | Protocol hierarchies, associated types, existentials |
| `references/memory-performance.md` | Value vs reference semantics, ARC, retain cycles     |
| `references/swiftui-patterns.md`   | Additional SwiftUI architectural guidance            |

### 5. swiftui-ui-patterns · `skills/swiftui-ui-patterns/`

**When to use:** Navigation, sheets, TabView, theming, async state, focus, grids, lists, macOS menus

**Key references:**

| File                             | When to consult                                           |
| -------------------------------- | --------------------------------------------------------- |
| `references/navigationstack.md`  | Route enums, RouterPath, `navigationDestination`          |
| `references/sheets.md`           | Item-driven sheets, SheetDestination enum                 |
| `references/theming.md`          | Semantic color enforcement via `@Environment(Theme.self)` |
| `references/async-state.md`      | `.task(id:)`, LoadState enum, CancellationError           |
| `references/components-index.md` | Full component catalogue — start here for any UI pattern  |

**Integration Strategy:**

1. When a review finding maps to a category above, read the relevant reference file before writing the finding.
2. Cite the bundled reference in your feedback so developers can read the rationale.
3. Do not duplicate content from these files — link or summarise.

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

The review report is structured markdown with these sections:

1. **Summary** — files reviewed, finding counts by severity (Critical/High/Medium/Low), positive feedback count
2. **Executive Summary** — brief overview of changes and overall code quality
3. **Detailed Findings** — grouped by file, then by severity, each with:
   - Severity and category labels
   - Issue description with file:line reference
   - Before/after code examples
   - Reference to relevant checklist or standard
4. **Positive Feedback** — good practices and patterns observed
5. **Prioritized Action Items** — must fix (Critical/High), should fix (Medium), consider (Low) as checklists

See `references/feedback-templates.md` for full templates and severity classification guidelines.

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

### Example 6: Review Navigation / Routing Code

```
User: "Review our navigation setup and routing code"

Steps:
1. Read .claude/CLAUDE.md for project navigation patterns
2. Read router/coordinator files (RouterPath, AppCoordinator, TabRouter)
3. Read root views that set up NavigationStack and TabView
4. Run navigation architecture checks:
   - Route destinations use typed Hashable enum (not String/Int)
   - RouterPath @Observable owns path (not ad-hoc @State)
   - Single centralized .navigationDestination per stack
   - .sheet(item:) preferred over .sheet(isPresented:) when model selected
   - Multiple sheets use SheetDestination enum (not multiple booleans)
   - Each tab has independent RouterPath (not shared)
   - .onOpenURL at app root, not scattered in feature views
5. Run async state checks:
   - .task(id:) for input-driven async work
   - CancellationError silenced
   - LoadState<T> enum instead of multiple booleans
6. Generate report with navigation-specific findings
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

## Limitations

- Static analysis only — cannot execute code, run tests, or profile runtime performance
- Limited to code accessible via git or provided directly
- For runtime analysis, use Instruments or other profiling tools
