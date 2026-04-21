# Changelog

All notable changes to the Swift Code Reviewer Agent Skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2026-04-21

### Fixed

- `bin/install.js` now copies `skills/` and `templates/` directories during install — companion skill references in `SKILL.md` and `init` command templates were silently missing from `~/.claude/skills/` after install

## [1.2.0] - 2026-04-21

### Added

- **Bundled companion skills** under `skills/` — five Swift/SwiftUI knowledge bases ship in-tree:
  - `swiftui-expert-skill` — SwiftUI state management, view composition, Liquid Glass, macOS patterns ([@Dimillian](https://github.com/Dimillian))
  - `swift-concurrency` — actors, Sendable, async/await, Swift 6 migration ([@AvdLee](https://github.com/AvdLee))
  - `swift-testing` — Swift Testing framework, test doubles, snapshots, XCTest migration ([@AvdLee](https://github.com/AvdLee))
  - `swift-expert` — Swift 6+ specialist: protocols, memory, concurrency, architecture ([@bocato](https://github.com/bocato))
  - `swiftui-ui-patterns` — 32 component-level SwiftUI pattern references ([@Dimillian](https://github.com/Dimillian))
- `skills/README.md` — full index with attribution table and update instructions
- `NOTICE.md` per bundled skill with primary-author attribution and license note
- `bundledSkills` array in `skill.json` for tooling enumeration
- **`init` command**: scaffold review agent + `/review` slash command into any project via `npx swift-code-reviewer-skill init`
- **templates/ directory**: bundled agent (`swift-code-reviewer.md`) and command (`review.md`) templates
- `setup` alias for `init` in both installers
- **skill-review GitHub Action**: auto-reviews any `SKILL.md` changed in a PR for instant quality signal ([#2](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/pull/2), [@yogesh-tessl](https://github.com/yogesh-tessl))
- `npx skills add` as primary installation method in README

### Changed

- `SKILL.md` cut by 71% — condensed to structured format with finding examples and phase checkpoints
- `SKILL.md` "Integration with Existing Skills" replaced by "Bundled Companion Skills" — cross-references point to in-tree `skills/<name>/references/` paths
- README "Integration with Other Skills" replaced by "Bundled Companion Skills" section with directory layout, author credits, and per-skill links
- README rewritten with `npx skills add` as primary install method; `init` as step 2
- `package.json` `files` array now includes `skills/` so bundled skills ship in the npm tarball
- `bin/install.js` and `install-skill.sh` now show `init` hint after install

### Fixed

- Resolves [#1](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/issues/1): companion knowledge bases now bundled directly in-repo instead of requiring a separate install step

## [1.1.1] - 2026-03-24

### Fixed

- Replace `install-skill.sh` with the correct installer for this skill (previously contained the XcodeBuildMCP installer by mistake)
- Add `uninstall` command support to `install-skill.sh`

## [1.1.0] - 2026-03-16

### Added

- Increase adjusts from Dimillian skill and more scenarios to cover

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

#### Platform Support

- Swift 6.0+
- iOS 17+, macOS 14+, watchOS 10+, tvOS 17+, visionOS 1+
- GitHub and GitLab integration
- Local git repository support

---

## Version History Summary

- **1.2.1** (2026-04-21): Fix installer not copying `skills/` and `templates/` directories
- **1.2.0** (2026-04-21): Bundle five companion Swift skills, add `init` scaffolding command, skill-review CI action, SKILL.md condensed 71%
- **1.1.1** (2026-03-24): Fix incorrect `install-skill.sh` (was XcodeBuildMCP installer)
- **1.1.0** (2026-03-16): Increase adjusts from Dimillian skill and more scenarios to cover
- **1.0.0** (2026-02-10): Initial release with comprehensive review capabilities

---

**Note**: This skill follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible functionality additions
- **PATCH**: Backward-compatible bug fixes
