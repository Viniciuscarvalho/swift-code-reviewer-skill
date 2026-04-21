# Bundled Companion Skills

This directory contains five companion skills vendored directly into `swift-code-reviewer-skill` so that reviewers have a complete, self-contained knowledge base after a single install or clone — no extra setup required.

## Thanks to the original authors

These skills are based on the public Swift/SwiftUI work of three community contributors:

| Author              | GitHub                                     | Known for                                                     |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| Antoine van der Lee | [@AvdLee](https://github.com/AvdLee)       | SwiftLee — concurrency, testing, Swift 6 migration            |
| Thomas Ricouard     | [@Dimillian](https://github.com/Dimillian) | IceCubesApp — SwiftUI architecture, Liquid Glass, UI patterns |
| Eduardo Bocato      | [@bocato](https://github.com/bocato)       | Clean Architecture, protocol-oriented Swift, Swift expert     |

Attribution is best-effort — upstream folders carried no `LICENSE` or `AUTHORS` files. If you are one of the original authors and want the attribution corrected or content removed, please [open an issue](https://github.com/Viniciuscarvalho/swift-code-reviewer-skill/issues).

---

## Skills index

| Skill                                                 | Primary author | Description                                                                                     | References                                                                              |
| ----------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [swiftui-expert-skill](swiftui-expert-skill/SKILL.md) | @Dimillian     | Write, review, or improve SwiftUI code: state management, view composition, Liquid Glass, macOS | [19 files](swiftui-expert-skill/references/) · [NOTICE](swiftui-expert-skill/NOTICE.md) |
| [swift-concurrency](swift-concurrency/SKILL.md)       | @AvdLee        | Expert guidance on actors, Sendable, async/await, Swift 6 migration, data races                 | [13 files](swift-concurrency/references/) · [NOTICE](swift-concurrency/NOTICE.md)       |
| [swift-testing](swift-testing/SKILL.md)               | @AvdLee        | Modern Swift Testing framework: @Test, #expect, doubles, snapshots, XCTest migration            | [9 files](swift-testing/references/) · [NOTICE](swift-testing/NOTICE.md)                |
| [swift-expert](swift-expert/SKILL.md)                 | @bocato        | Senior Swift 6+ specialist: protocol-oriented design, memory, concurrency, SwiftUI patterns     | [5 files](swift-expert/references/) · [NOTICE](swift-expert/NOTICE.md)                  |
| [swiftui-ui-patterns](swiftui-ui-patterns/SKILL.md)   | @Dimillian     | Component-level SwiftUI patterns: navigation, lists, sheets, grids, theming, gestures           | [32 files](swiftui-ui-patterns/references/) · [NOTICE](swiftui-ui-patterns/NOTICE.md)   |

---

## Updating a skill

Each skill is a verbatim copy of its source. To refresh one:

```bash
rsync -rL --exclude='.DS_Store' ~/.agents/skills/swiftui-expert-skill/ skills/swiftui-expert-skill/
rsync -rL --exclude='.DS_Store' ~/.claude/skills/swift-concurrency/ skills/swift-concurrency/
rsync -rL --exclude='.DS_Store' ~/.claude/skills/swift-testing/ skills/swift-testing/
rsync -rL --exclude='.DS_Store' ~/.maestro/skills/swift-expert/ skills/swift-expert/
rsync -rL --exclude='.DS_Store' ~/.maestro/skills/swiftui-ui-patterns/ skills/swiftui-ui-patterns/
```

Do not edit files under `skills/` directly — changes will be overwritten on the next sync.
