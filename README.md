# Swift Code Reviewer Agent Skill

A comprehensive code review skill for Claude that performs multi-layer analysis of Swift and SwiftUI code, combining Apple's best practices with project-specific coding standards.

## Features

- 🔍 **Multi-Layer Analysis**: Combines Swift 6+ best practices, SwiftUI patterns, performance optimization, and security checks
- 📋 **Project-Aware Reviews**: Reads `.claude/CLAUDE.md` to validate against project-specific standards and architecture patterns
- 🎯 **Comprehensive Feedback**: Provides Critical/High/Medium/Low severity issues, positive feedback, and refactoring suggestions
- 🔗 **Skill Integration**: Leverages existing `swift-best-practices`, `swiftui-expert-skill`, and `swiftui-performance-audit` skills
- 📊 **Actionable Output**: Structured reports with file:line references, code examples, and prioritized action items
- 🚀 **Platform Support**: Works with GitHub PRs, GitLab MRs, and local git changes

## What It Reviews

### Swift Quality
- **Concurrency Safety**: Actor isolation, MainActor usage, Sendable conformance, data race prevention
- **Error Handling**: Typed throws, Result types, proper error propagation
- **Optionals**: Safe unwrapping, guard statements, no force unwraps
- **Access Control**: Explicit access modifiers, minimal API surface
- **Naming**: Swift API Design Guidelines compliance

### SwiftUI Patterns
- **State Management**: @Observable, @State, @Binding, @Environment usage
- **Property Wrappers**: Correct wrapper selection for each use case
- **Modern APIs**: NavigationStack, .task, latest SwiftUI features
- **View Composition**: Extracted subviews, ViewBuilder patterns
- **Accessibility**: Labels, hints, Dynamic Type support

### Performance
- **View Optimization**: Unnecessary updates, Equatable conformance
- **ForEach Performance**: Stable identity, lazy loading
- **Layout Efficiency**: GeometryReader usage, layout thrash
- **Resource Management**: Image loading, memory leaks, async patterns

### Security & Safety
- **Input Validation**: Sanitization, bounds checking, type safety
- **Sensitive Data**: Keychain storage, biometric authentication, secure logging
- **Network Security**: HTTPS enforcement, certificate pinning, API key protection
- **Permissions**: Privacy descriptions, permission timing, graceful handling

### Architecture
- **Pattern Compliance**: MVVM, MVI, TCA adherence
- **Dependency Injection**: Constructor injection, protocol-based dependencies
- **Code Organization**: File structure, MARK comments, logical grouping
- **Testability**: Unit test coverage, mock usage, test structure

### Project Standards
- **Custom Guidelines**: Validates against `.claude/CLAUDE.md` rules
- **Design System**: Color palette, typography, spacing token usage
- **Error Patterns**: Custom error type conformance
- **Testing Requirements**: Coverage thresholds, testing patterns

## Installation

### Option 1: NPX (Recommended)

The fastest way to install - no cloning required:

```bash
npx swift-code-reviewer-skill
```

This automatically installs the skill to `~/.claude/skills/swift-code-reviewer-skill/`

To uninstall:

```bash
npx swift-code-reviewer-skill uninstall
```

### Option 2: Clone This Repository

```bash
# Clone the skill
git clone https://github.com/Viniciuscarvalho/swift-code-reviewer-skill.git ~/.claude/skills/swift-code-reviewer-skill

# The skill is now ready to use!
```

### Option 3: Manual Installation

1. Create the skill directory:
```bash
mkdir -p ~/.claude/skills/swift-code-reviewer-skill/references
```

2. Download the files from this repository into the directory

3. Restart Claude or reload skills

### Verify Installation

```bash
ls ~/.claude/skills/swift-code-reviewer-skill/
# Should show: SKILL.md, README.md, references/, and more
```

## Usage

### Basic Usage

The skill automatically activates when you ask Claude to review Swift/SwiftUI code:

```
Review this PR

Review LoginView.swift

Review my uncommitted changes

Check if this follows our coding standards
```

### Review Specific Files

```
Review UserProfileView.swift
```

**What it does:**
1. Reads `.claude/CLAUDE.md` for project standards
2. Analyzes the file against all quality dimensions
3. Provides structured feedback with severity levels
4. Includes positive feedback and refactoring suggestions

### Review Git Changes

```
Review my uncommitted changes
```

**What it does:**
1. Runs `git diff` to identify changes
2. Analyzes modified files
3. Focuses on changed lines for efficiency
4. Generates comprehensive review report

### Review Pull Requests (GitHub)

```
Review PR #123
```

**What it does:**
1. Fetches PR details using `gh pr view 123`
2. Gets diff using `gh pr diff 123`
3. Reads all changed files for context
4. Generates detailed review with file:line references

### Review Merge Requests (GitLab)

```
Review MR #456
```

**What it does:**
1. Fetches MR details using `glab mr view 456`
2. Gets diff and changed files
3. Performs multi-layer analysis
4. Generates actionable feedback

### Review Against Custom Standards

```
Review LoginViewModel.swift against our coding standards
```

**What it does:**
1. Reads `.claude/CLAUDE.md` and related architecture docs
2. Extracts project-specific rules
3. Validates code against both Apple and project standards
4. Reports compliance and violations

### Review Multiple Files

```
Review all ViewModels in the Features folder
```

**What it does:**
1. Finds all matching files
2. Analyzes each against architecture patterns
3. Provides file-by-file review
4. Summarizes common patterns and issues

## How It Works

The skill follows a **four-phase workflow**:

### Phase 1: Context Gathering

1. **Read Project Guidelines**
   - Loads `.claude/CLAUDE.md` if it exists
   - Reads related architecture documents
   - Extracts custom coding standards

2. **Identify Review Scope**
   - Determines files to review (user-specified, git diff, PR/MR)
   - Categorizes changes by type (UI, logic, tests)

3. **Gather Context**
   - Reads all files completely
   - Understands broader context
   - Identifies component relationships

### Phase 2: Automated Analysis

Runs parallel checks across **six core categories**:

1. **Swift Best Practices** (leverages `swift-best-practices` skill)
   - Concurrency safety and actor isolation
   - API design and naming conventions
   - Swift 6+ feature adoption

2. **SwiftUI Quality** (leverages `swiftui-expert-skill`)
   - State management patterns
   - Modern API usage
   - View composition

3. **Performance** (leverages `swiftui-performance-audit`)
   - View update optimization
   - ForEach performance
   - Resource management

4. **Security & Safety**
   - Force unwrap detection
   - Sensitive data handling
   - Network security

5. **Architecture & Maintainability**
   - Pattern compliance
   - Dependency injection
   - Testability

6. **Project-Specific Standards**
   - `.claude/CLAUDE.md` compliance
   - Design system usage
   - Custom error patterns

### Phase 3: Report Generation

1. **Categorizes findings** by severity (Critical, High, Medium, Low)
2. **Includes positive feedback** for good practices
3. **Adds refactoring suggestions** for improvements
4. **Groups by file** and category
5. **Provides code examples** for all issues

### Phase 4: Delivery

Generates a structured markdown report:

```markdown
# Code Review Report

## Summary
- Files Reviewed: 5
- Critical: 0
- High: 2
- Medium: 5
- Low: 3
- Positive Feedback: 8

## Detailed Findings

### File: LoginView.swift

#### ✅ Positive Feedback
1. Excellent use of @Observable for state management

#### 🟡 High Priority
1. Force unwrap detected at line 89 (potential crash)

#### 💡 Refactoring Suggestions
1. Consider extracting login form into separate view

## Prioritized Action Items
[Must fix, should fix, consider items]
```

## Review Report Structure

### Severity Levels

| Severity | Icon | Description | Response Time |
|----------|------|-------------|---------------|
| **Critical** | 🔴 | Security vulnerabilities, crashes, data races | Must fix before merge |
| **High** | 🟡 | Performance issues, anti-patterns, major violations | Should fix before merge |
| **Medium** | 🟠 | Code quality, documentation, minor violations | Fix in current sprint |
| **Low** | 🔵 | Style, suggestions, minor improvements | Consider for future |

### Feedback Types

**Positive Feedback** ✅
- Acknowledges good practices
- Highlights excellent implementations
- Recognizes proper patterns

**Issues** 🔴🟡🟠🔵
- File and line references
- Code examples (before/after)
- Specific fixes with explanations
- Links to documentation

**Refactoring Suggestions** 💡
- Proactive improvements
- Modernization opportunities
- Code simplification ideas

## Project-Specific Standards

The skill reads `.claude/CLAUDE.md` to understand your project's:

- Architecture pattern (MVVM, MVI, TCA, etc.)
- Dependency injection approach
- Error handling patterns
- Testing requirements
- Design system guidelines
- Navigation patterns
- Custom naming conventions

### Example .claude/CLAUDE.md

```markdown
# MyApp Coding Standards

## Architecture
We use **MVVM with Coordinators**:
- ViewModels MUST use @Observable (iOS 17+)
- All dependencies MUST be injected via constructor
- Views MUST NOT contain business logic

## Error Handling
All errors MUST conform to AppError:
```swift
protocol AppError: Error {
    var message: String { get }
    var code: Int { get }
}
```

## Design System
- Use AppColors enum ONLY
- Use AppFonts enum ONLY
- Use AppSpacing for all padding

## Testing
- Minimum coverage: 80%
- All ViewModels MUST have unit tests
```

The skill will validate your code against these standards and report violations.

## Reference Documentation

The skill includes comprehensive reference guides:

- **review-workflow.md**: Step-by-step review process and git commands
- **swift-quality-checklist.md**: Swift 6+ concurrency, error handling, optionals
- **swiftui-review-checklist.md**: State management, property wrappers, modern APIs
- **performance-review.md**: View optimization, ForEach performance, layout efficiency
- **security-checklist.md**: Input validation, sensitive data, network security
- **architecture-patterns.md**: MVVM, Repository, DI, Use Case, Coordinator patterns
- **feedback-templates.md**: Review comment templates and severity guidelines
- **custom-guidelines.md**: How to parse and validate `.claude/CLAUDE.md`

## Integration with Other Skills

This skill **leverages** three foundational skills:

### swift-best-practices
For Swift 6+ language patterns, concurrency, and API design
- Loads when reviewing Swift language usage
- References: `concurrency.md`, `swift6-features.md`, `api-design.md`

### swiftui-expert-skill
For SwiftUI state management and modern APIs
- Loads when reviewing SwiftUI views
- References: `state-management.md`, `modern-apis.md`, `view-composition.md`

### swiftui-performance-audit
For performance analysis
- Loads when performance concerns identified
- Runs focused audit on performance-sensitive paths

**Note**: These skills should be installed separately for full functionality, but the code reviewer works independently with its own comprehensive checklists.

## Examples

### Example 1: Review Uncommitted Changes

**Input:**
```
Review my uncommitted changes
```

**Output:**
```markdown
# Code Review Report

## Summary
- Files Reviewed: 3
- Critical: 0
- High: 1
- Medium: 2
- Low: 1
- Positive Feedback: 5

## File: LoginViewModel.swift

✅ **Excellent Modern API Usage** (line 12)
- Using @Observable instead of ObservableObject
- Clean, modern pattern for iOS 17+

🟡 **Force Unwrap Detected** (line 89)
**Severity**: High
**Issue**: Force unwrapping can crash if data is nil

Current Code:
```swift
let user = repository.currentUser!
```

Recommended Fix:
```swift
guard let user = repository.currentUser else {
    logger.error("No current user")
    return
}
```
```

### Example 2: Review Against Project Standards

**Input:**
```
Review LoginView.swift against our coding standards
```

**Output:**
```markdown
# Project Standards Review

## .claude/CLAUDE.md Compliance

✅ **Architecture Adherence**
- Follows MVVM pattern correctly
- No business logic in view
- Dependencies injected properly

🔴 **Violates Design System Standard** (line 45)
**Project Guideline**: "Use AppColors enum ONLY. No hardcoded colors"

Current Code:
```swift
.foregroundColor(.blue)  // ❌ Hardcoded
```

Expected Code:
```swift
.foregroundColor(AppColors.primary)  // ✅ Design system
```

Reference: .claude/CLAUDE.md:Design System
```

## Requirements

- Claude Code CLI
- Git (for reviewing diffs and PRs)
- Optional: `gh` CLI for GitHub integration
- Optional: `glab` CLI for GitLab integration
- Swift 6.0+
- iOS 17+, macOS 14+, watchOS 10+, tvOS 17+, or visionOS 1+

## Limitations

- Cannot execute code or run tests (static analysis only)
- Cannot access external systems or APIs
- Limited to analyzing provided code or git-accessible code
- Cannot detect runtime issues requiring execution
- Performance analysis based on patterns, not profiling data

For runtime analysis, use Instruments or other profiling tools alongside this skill.

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report Issues**: Found a bug or have a suggestion? Open an issue
2. **Improve Checklists**: Add new patterns or update existing checks
3. **Add Examples**: Contribute real-world review examples
4. **Update Documentation**: Improve clarity and add use cases
5. **Add Templates**: Create new feedback templates

### Development

To modify the skill:

1. Edit `SKILL.md` for main skill logic
2. Update reference files in `references/` for specific checklists
3. Test with real Swift/SwiftUI code
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) file for details

## Acknowledgments

- Inspired by Apple's Swift API Design Guidelines
- Leverages best practices from the Swift and SwiftUI communities
- Built on top of Claude's code analysis capabilities
- Designed to complement existing Swift development skills

## Support

- **Issues**: [GitHub Issues](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/discussions)

## Version History

### 1.0.0 (2026-02-10)
- Initial release
- Comprehensive Swift 6+ and SwiftUI review capabilities
- Project-specific standards integration
- Multi-layer analysis (6 categories)
- Structured feedback with all severity levels
- Integration with existing skills
- 7,700+ lines of comprehensive documentation

---

**Made with ❤️ for the Swift community**

If this skill helps improve your code reviews, please ⭐️ star the repository!
