# /review — Swift Code Review

Use the agent defined in .claude/agents/swift-code-reviewer.md as your primary review rules. Combine its skill-based analysis with the checklist below.

Run the full code review checklist against current Swift changes.

## Behavior

When invoked:

1. **Resolve scope** — execute Phase 0 from the swift-code-reviewer-skill (see `SKILL.md`). Print the scope banner. The resulting `scope.modified` is the authoritative file list for all subsequent steps.
2. **Load CLAUDE.md** — read project conventions if `.claude/CLAUDE.md` exists.
3. **Run SwiftLint** — if available, collect warnings/errors.
4. **Run the universal checklist** against the diff.
5. **Run Swift-specific checks** using the swift-code-reviewer-skill rules.
6. **Run CLAUDE.md-specific checks** — any custom rules defined in the project.
7. **Report findings** using the signal system.

## Output Format

```
Code Review — [N files changed]

Universal:
  Pass  Naming: consistent with project conventions
  Pass  Error handling: all errors handled
  Issue Edge case: `processItems` doesn't handle empty array
  Suggestion Complexity: `calculateTotal` could extract tax logic

Swift/SwiftUI:
  Pass  No force unwraps
  Issue Retain cycle: closure in `fetchData` captures self strongly
  Pass  Accessibility labels present

CLAUDE.md:
  Convention Line 23: uses `if let` but CLAUDE.md requires `guard let` for early returns
  Pass  Architecture: follows MVVM pattern

Result: 2 issues to fix, 1 suggestion
```

## Signal Words

| Signal         | Meaning                            |
| -------------- | ---------------------------------- |
| **Pass**       | Item satisfied                     |
| **Suggestion** | Optional improvement, non-blocking |
| **Issue**      | Must be fixed before commit        |
| **Convention** | Violation from CLAUDE.md           |

## Important

- Only flag items relevant to actual changes, not the entire codebase
- One line per item — be thorough but concise
- After listing issues, offer to help fix them
- If no issues found, confirm with a clean summary
