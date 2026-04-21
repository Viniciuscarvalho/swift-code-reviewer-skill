# Swift Code Reviewer Agent Skill

[![GitHub Sponsors](https://img.shields.io/github/sponsors/Viniciuscarvalho?style=social)](https://github.com/sponsors/Viniciuscarvalho)
[![npm version](https://img.shields.io/npm/v/swift-code-reviewer-skill)](https://www.npmjs.com/package/swift-code-reviewer-skill)

A code review skill for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that performs multi-layer analysis of Swift and SwiftUI code, combining Apple's best practices with your project-specific coding standards.

## Quick Start

### 1. Install the skill (global, once)

```bash
npx skills add Viniciuscarvalho/swift-code-reviewer-skill
```

To update to the latest version later:

```bash
npx swift-code-reviewer-skill@latest
```

### 2. Add the review agent to your project (optional)

```bash
cd ~/Projects/YourApp
npx swift-code-reviewer-skill init
```

This scaffolds two files into your project:

```
.claude/
  agents/swift-code-reviewer.md   # review agent
  commands/review.md              # /review slash command
```

Existing files are never overwritten.

### The review flow

```
You code  -->  /review before push (free, local)  -->  done
```

- `/review` runs the full review checklist against your staged or unstaged Swift changes
- `@swift-code-reviewer` invokes the agent directly for deeper analysis

## Usage

![Swift Code Reviewer in action](assets/demo.png)

Ask Claude to review your code:

```
Review this PR
Review LoginView.swift
Review my uncommitted changes
Review all ViewModels in the Features folder
Check if this follows our coding standards
```

Or use the slash command after running `init`:

```
/review
```

The skill automatically activates, reads your `.claude/CLAUDE.md` for project standards, and generates a structured report with severity levels, code examples, and prioritized action items.

### Example Output

```markdown
# Code Review Report

## Summary

- Files Reviewed: 3 | Critical: 0 | High: 1 | Medium: 2 | Low: 1

## File: LoginViewModel.swift

Pass **Excellent Modern API Usage** (line 12)

- Using @Observable instead of ObservableObject

Issue **Force Unwrap Detected** (line 89)
Current: `let user = repository.currentUser!`
Fix:
guard let user = repository.currentUser else {
logger.error("No current user")
return
}

Issue **Violates Design System Standard** (line 45)
Current: `.foregroundColor(.blue)`
Fix: `.foregroundColor(AppColors.primary)`

## Prioritized Action Items

1. [Must fix] Remove force unwrap at line 89
2. [Should fix] Use design system colors at line 45
```

## What It Reviews

| Category              | Checks                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **Swift Quality**     | Concurrency safety, actor isolation, Sendable, error handling, optionals, access control, naming          |
| **SwiftUI Patterns**  | @Observable, state management, property wrappers, NavigationStack, .task, view composition, accessibility |
| **Performance**       | View updates, Equatable, ForEach identity, GeometryReader, lazy loading, memory leaks                     |
| **Security**          | Keychain, input validation, HTTPS, certificate pinning, API key protection, sensitive data logging        |
| **Architecture**      | MVVM/MVI/TCA compliance, dependency injection, code organization, testability                             |
| **Project Standards** | `.claude/CLAUDE.md` rules, design system, custom error patterns, testing requirements                     |

### Severity Levels

| Icon     | Severity | Action                  |
| -------- | -------- | ----------------------- |
| Critical | Critical | Must fix before merge   |
| High     | High     | Should fix before merge |
| Medium   | Medium   | Fix in current sprint   |
| Low      | Low      | Consider for future     |

## Platform Support

- Works with **GitHub PRs** (`gh`), **GitLab MRs** (`glab`), and **local git changes**
- Swift 6.0+ | iOS 17+ | macOS 14+ | watchOS 10+ | tvOS 17+ | visionOS 1+

## Project-Specific Standards

Add a `.claude/CLAUDE.md` to your project and the skill will validate against your rules:

```markdown
# MyApp Standards

## Architecture

- ViewModels MUST use @Observable (iOS 17+)
- All dependencies MUST be injected via constructor
- Views MUST NOT contain business logic

## Design System

- Use AppColors enum ONLY
- Use AppFonts enum ONLY

## Testing

- Minimum coverage: 80%
- All ViewModels MUST have unit tests
```

## Alternative Installation

<details>
<summary>NPX installer (installs skill only)</summary>

```bash
npx swift-code-reviewer-skill
```

</details>

<details>
<summary>Clone this repository</summary>

```bash
git clone https://github.com/Viniciuscarvalho/swift-code-reviewer-skill.git ~/.claude/skills/swift-code-reviewer-skill
```

</details>

<details>
<summary>Update to latest version</summary>

```bash
npx swift-code-reviewer-skill@latest
```

This replaces the existing `~/.claude/skills/swift-code-reviewer-skill/` with the latest files.

</details>

<details>
<summary>Uninstall</summary>

```bash
npx swift-code-reviewer-skill uninstall
```

</details>

## Bundled Companion Skills

This repo ships five companion skills under `skills/` so you get a complete, self-contained knowledge base after a single install — no extra steps required.

```
skills/
├── README.md                    ← full index + attribution
├── swiftui-expert-skill/        ← SwiftUI state, Liquid Glass, macOS patterns
├── swift-concurrency/           ← actors, Sendable, Swift 6 migration
├── swift-testing/               ← Swift Testing framework, doubles, snapshots
├── swift-expert/                ← Swift 6+ specialist: protocols, memory, architecture
└── swiftui-ui-patterns/         ← 32 component references (nav, sheets, grids…)
```

The reviewer's `SKILL.md` points to specific reference files inside each skill, so during a review Claude can read the exact guidance it needs without any extra configuration.

### Thanks to the original authors

The bundled skills are based on the public Swift/SwiftUI work of:

| Author              | GitHub                                     |
| ------------------- | ------------------------------------------ |
| Antoine van der Lee | [@AvdLee](https://github.com/AvdLee)       |
| Thomas Ricouard     | [@Dimillian](https://github.com/Dimillian) |
| Eduardo Bocato      | [@bocato](https://github.com/bocato)       |

Each skill folder contains a `NOTICE.md` with attribution details. Upstream folders carried no `LICENSE` or `AUTHORS` files — if you are an original author and want attribution updated or content removed, please [open an issue](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/issues).

## Contributing

1. Edit `SKILL.md` for main skill logic
2. Update reference files in `references/` for specific checklists
3. Add/modify templates in `templates/` for agent and command scaffolding
4. Test with real Swift/SwiftUI code
5. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Made with care for the Swift community**

If this skill helps your code reviews, please star the repository!

- [Issues](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/issues) | [Discussions](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/discussions)
