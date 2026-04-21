# Changelog

## [Unreleased]

### Added

- **Bundled companion skills** under `skills/` — five Swift/SwiftUI knowledge bases now ship in-tree:
  - `swiftui-expert-skill` — SwiftUI state management, view composition, Liquid Glass, macOS patterns ([@Dimillian](https://github.com/Dimillian))
  - `swift-concurrency` — actors, Sendable, async/await, Swift 6 migration ([@AvdLee](https://github.com/AvdLee))
  - `swift-testing` — Swift Testing framework, test doubles, snapshots, XCTest migration ([@AvdLee](https://github.com/AvdLee))
  - `swift-expert` — Swift 6+ specialist: protocols, memory, concurrency, architecture ([@bocato](https://github.com/bocato))
  - `swiftui-ui-patterns` — 32 component-level SwiftUI pattern references ([@Dimillian](https://github.com/Dimillian))
- `skills/README.md` — full index with attribution table and update instructions
- `NOTICE.md` per bundled skill with primary-author attribution and license note
- `bundledSkills` array in `skill.json` for tooling enumeration

### Changed

- `SKILL.md` "Integration with Existing Skills" section replaced by "Bundled Companion Skills" — cross-references now point to in-tree `skills/<name>/references/` paths instead of external `~/.claude/skills/` paths
- README "Integration with Other Skills" replaced by "Bundled Companion Skills" section showing directory layout, author credits, and per-skill links
- `package.json` `files` array now includes `skills/` so bundled skills ship in the npm tarball

### Fixed

- Resolves [#1](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/issues/1): swift-best-practices resource location — companion knowledge bases are now bundled directly in the repo

All notable changes to the Swift Code Reviewer Agent Skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-10

### Added

- **`init` command**: Scaffold review agent + `/review` slash command into any project via `npx swift-code-reviewer-skill init`
- **templates/ directory**: Bundled agent (`swift-code-reviewer.md`) and command (`review.md`) templates
- `setup` alias for `init` in both installers
- `npx skills add` as primary installation method in README

### Changed

- README rewritten with `npx skills add` as primary install, `init` as step 2
- `install-skill.sh` and `bin/install.js` now show `init` hint after install
- Post-install message updated to guide users toward project scaffolding

## [1.1.1] - 2026-03-24

### Fixed

- Replace `install-skill.sh` with the correct installer for this skill (previously contained the XcodeBuildMCP installer by mistake)
- Add `uninstall` command support to `install-skill.sh`

## [1.1.0] - 2026-03-16

### Added

- increase adjusts from Dimillian skill and more scenarios to cover

## [1.0.0] - 2026-02-10

### Added

#### Core Functionality

- **Four-phase review workflow**: Context Gathering → Analysis → Report Generation → Delivery
- **Multi-layer analysis** across 6 core categories:
  - Swift Best Practices (Swift 6+ concurrency, error handling, optionals)
  - SwiftUI Quality (state management, modern APIs, view composition)
  - Performance (view optimization, ForEach performance, resource management)
  - Security & Safety (input validation, sensitive data, network security)
  - Architecture (MVVM, Repository, DI patterns, testability)
  - Project-Specific Standards (.claude/CLAUDE.md integration)

#### Review Capabilities

- **GitHub PR reviews** via `gh` CLI integration
- **GitLab MR reviews** via `glab` CLI integration
- **Git diff analysis** for uncommitted changes
- **Single file reviews** with context awareness
- **Directory reviews** for multiple files
- **Project standards validation** via .claude/CLAUDE.md

#### Feedback System

- **Severity classification**: Critical, High, Medium, Low
- **Positive feedback** for good practices
- **Refactoring suggestions** for improvements
- **File:line references** for precise issue location
- **Code examples** showing current vs recommended code
- **Prioritized action items** for structured follow-up

#### Reference Documentation (7,700+ lines)

- **review-workflow.md** (1,131 lines): Complete review process and git integration
- **swift-quality-checklist.md** (928 lines): Swift 6+ patterns and best practices
- **swiftui-review-checklist.md** (909 lines): SwiftUI state management and modern APIs
- **performance-review.md** (914 lines): Performance anti-patterns and optimization
- **security-checklist.md** (781 lines): Security vulnerabilities and safe practices
- **architecture-patterns.md** (862 lines): MVVM, Repository, DI, Coordinator patterns
- **feedback-templates.md** (666 lines): Review templates and severity guidelines
- **custom-guidelines.md** (852 lines): Project standards integration guide

#### Integration Features

- **swift-best-practices skill** integration for Swift 6+ language patterns
- **swiftui-expert-skill** integration for SwiftUI best practices
- **swiftui-performance-audit** integration for performance analysis
- **Independent operation** with comprehensive built-in checklists

#### Platform Support

- Swift 6.0+
- iOS 17+, macOS 14+, watchOS 10+, tvOS 17+, visionOS 1+
- GitHub and GitLab integration
- Local git repository support

### Documentation

- **README.md**: Comprehensive overview with examples and usage patterns
- **CONTRIBUTING.md**: Contribution guidelines and development setup
- **LICENSE**: MIT License
- **CHANGELOG.md**: Version history and change tracking
- **.gitignore**: Standard macOS and editor ignores

### Features in Detail

#### Swift Quality Checks

- Actor isolation and MainActor usage
- Sendable conformance validation
- Data race prevention
- Typed throws (Swift 6+)
- Force unwrap detection (!, as!, try!)
- Optional handling patterns
- Access control enforcement
- Swift API Design Guidelines compliance

#### SwiftUI Checks

- @Observable pattern adoption (iOS 17+)
- Property wrapper selection guide
- NavigationStack vs NavigationView
- .task vs .onAppear for async work
- Modern .onChange syntax
- State ownership rules
- View composition guidelines
- Accessibility compliance

#### Performance Checks

- View update optimization
- Equatable conformance for ViewModels
- ForEach identity stability
- GeometryReader overuse detection
- Layout thrash prevention
- AsyncImage for remote images
- Memory leak detection
- Retain cycle prevention

#### Security Checks

- Keychain usage for credentials
- Biometric authentication
- HTTPS enforcement
- Certificate pinning
- API key protection
- Input validation
- SQL injection prevention
- XSS prevention in WebViews
- Sensitive data logging prevention

#### Architecture Checks

- MVVM pattern validation
- Repository pattern implementation
- Dependency injection verification
- Use Case pattern detection
- Coordinator pattern for navigation
- Protocol-based abstractions
- Testability assessment
- Code organization (MARK comments, extensions)

#### Project Standards

- .claude/CLAUDE.md parsing and validation
- Custom architecture pattern validation
- Design system compliance (colors, fonts, spacing)
- Error handling pattern conformance
- Testing requirement verification
- Navigation pattern compliance

### Templates and Examples

#### Positive Feedback Templates

- Modern API adoption
- Architecture excellence
- Code quality
- Performance optimization
- Accessibility support
- Security awareness

#### Issue Report Templates

- Critical issues (security, crashes, data races)
- High priority (performance, anti-patterns)
- Medium priority (code quality, documentation)
- Low priority (style, suggestions)

#### Refactoring Suggestions

- Extract subview
- Simplify complex logic
- Extract reusable component
- Performance optimization opportunities

### Example Review Reports

Provided complete examples for:

- Reviewing uncommitted changes
- Reviewing against project standards
- Pull request reviews
- File-specific reviews
- Multi-file reviews

## [Unreleased]

### Planned Features

- **Swift 6.1 support**: Add new language features
- **iOS 18 patterns**: Add latest SwiftUI APIs
- **Xcode 16 integration**: Better Xcode project analysis
- **Custom rule engine**: User-defined review rules
- **Machine learning**: Pattern learning from reviewed code
- **Team metrics**: Aggregate review statistics
- **CI/CD integration**: Automated PR review comments
- **VSCode extension**: Direct editor integration

### Potential Enhancements

- **Video tutorials**: Screen recordings showing usage
- **Interactive examples**: Live code review demonstrations
- **Best practices database**: Searchable pattern library
- **Quick fixes**: Automated code corrections
- **Review presets**: Configurable review profiles
- **Multi-language support**: Objective-C, C++, SwiftUI previews

## Version History Summary

- **1.2.0** (2026-04-10): Add `init` command with agent + /review scaffolding, `npx skills` as primary install
- **1.1.1** (2026-03-24): Fix incorrect `install-skill.sh` (was XcodeBuildMCP installer)
- **1.1.0** (2026-03-16): Increase adjusts from Dimillian skill and more scenarios to cover
- **1.0.0** (2026-02-10): Initial release with comprehensive review capabilities

---

## How to Read This Changelog

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on proposing changes.

## Release Process

1. Update version in SKILL.md
2. Update CHANGELOG.md with changes
3. Create git tag: `git tag -a v1.0.0 -m "Release 1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release with notes from CHANGELOG

---

**Note**: This skill follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible functionality additions
- **PATCH**: Backward-compatible bug fixes
