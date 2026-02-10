# Contributing to Swift Code Reviewer Agent Skill

Thank you for your interest in contributing! This document provides guidelines for contributing to the Swift Code Reviewer skill.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Detailed description of the issue or suggestion
   - Code examples (if applicable)
   - Expected vs actual behavior
   - Swift/SwiftUI version and platform

### Suggesting Enhancements

We welcome suggestions for:

- New review patterns to detect
- Additional best practices to check
- Improved feedback templates
- Better project standard integration
- Performance optimizations
- Documentation improvements

### Contributing Code

#### Setting Up Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/swift-code-reviewer-skill.git
   cd swift-code-reviewer-skill
   ```

3. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Making Changes

**Skill Logic (SKILL.md)**

When modifying the main skill file:

1. Maintain YAML frontmatter format
2. Keep sections well-organized
3. Update table of contents if adding sections
4. Test with real Swift/SwiftUI code

**Reference Files (references/*.md)**

When updating reference documentation:

1. **swift-quality-checklist.md**: Add Swift language patterns
2. **swiftui-review-checklist.md**: Add SwiftUI patterns
3. **performance-review.md**: Add performance anti-patterns
4. **security-checklist.md**: Add security concerns
5. **architecture-patterns.md**: Add architectural patterns
6. **feedback-templates.md**: Add review templates
7. **custom-guidelines.md**: Update guidelines parsing logic
8. **review-workflow.md**: Update review process steps

**Format Guidelines:**

- Use clear, descriptive headings
- Include code examples (bad ❌ and good ✅)
- Add comments explaining why something is an issue
- Reference official documentation when possible
- Keep examples concise and focused

#### Code Example Format

Always use this format for examples:

```markdown
**Check for:**
- [ ] Pattern or rule to check

**Examples:**

❌ **Bad: [Description]**
```swift
// Code showing the anti-pattern
```

✅ **Good: [Description]**
```swift
// Code showing the correct pattern
```

**Why This Matters**: [Explanation of impact]
```

#### Testing Your Changes

1. **Test with real code**: Review actual Swift/SwiftUI files
2. **Test different scenarios**:
   - Single file review
   - Git diff review
   - PR/MR review
   - Project standards validation

3. **Verify output**:
   - All severity levels work
   - File:line references are correct
   - Code examples are accurate
   - Positive feedback is included

4. **Check integration**:
   - References to other skills work
   - Project standards (.claude/CLAUDE.md) parsing works
   - Git commands execute correctly

#### Commit Guidelines

Write clear, descriptive commit messages:

```
Add force unwrap detection in security checklist

- Added pattern detection for !, as!, and try!
- Included examples of safe alternatives
- Updated security-checklist.md with new section
```

**Format:**
- First line: Summary (50 chars or less)
- Blank line
- Detailed description (if needed)
- List specific changes

#### Pull Request Process

1. **Update documentation** if you changed functionality
2. **Add examples** demonstrating your changes
3. **Test thoroughly** with various Swift/SwiftUI code
4. **Create pull request** with:
   - Clear title and description
   - Reference related issues
   - List of changes
   - Examples of new functionality

5. **Respond to feedback** from reviewers
6. **Keep commits clean** (squash if needed)

## What to Contribute

### High Priority

- **New Swift 6 patterns**: Add checks for latest Swift features
- **iOS 18 patterns**: Add SwiftUI iOS 18+ patterns
- **Performance patterns**: Add new performance anti-patterns
- **Security checks**: Add security vulnerability detection
- **Real-world examples**: Add examples from actual code reviews

### Medium Priority

- **Improved templates**: Better feedback templates
- **Documentation**: Clearer explanations and examples
- **Edge cases**: Handle unusual code patterns
- **Integration**: Better integration with other skills

### Low Priority

- **Formatting**: Improve markdown formatting
- **Typos**: Fix spelling and grammar
- **Organization**: Reorganize sections for clarity

## Style Guide

### Markdown

- Use `#` for main headings, `##` for sections, `###` for subsections
- Use **bold** for emphasis
- Use `code` for inline code
- Use code blocks with language tags: ```swift
- Use tables for structured data
- Use lists for sequential items
- Use checkboxes `- [ ]` for checklist items

### Code Examples

- Always show both bad ❌ and good ✅ examples
- Include comments explaining key points
- Keep examples minimal but complete
- Use realistic variable/function names
- Follow Swift naming conventions

### Writing Style

- **Clear and concise**: Avoid unnecessary words
- **Active voice**: "Use @Observable" not "@ Observable should be used"
- **Specific**: "View body exceeds 50 lines" not "View is too large"
- **Educational**: Explain *why*, not just *what*
- **Respectful**: Assume good intentions, be constructive

## Review Criteria

Pull requests are evaluated on:

1. **Correctness**: Does it accurately identify issues?
2. **Completeness**: Are examples clear and comprehensive?
3. **Clarity**: Is documentation easy to understand?
4. **Consistency**: Does it match existing style?
5. **Value**: Does it improve the skill's effectiveness?

## Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Thanked in the community

Significant contributions may result in becoming a maintainer.

## Questions?

- **General questions**: Open a discussion
- **Bug reports**: Open an issue
- **Feature ideas**: Open an issue with [Feature Request] tag
- **Code questions**: Comment on relevant PR

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Background
- Identity
- Location

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them learn
- Give and accept constructive feedback gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

### Enforcement

Violations will result in:
1. Warning
2. Temporary ban
3. Permanent ban (severe or repeated violations)

Report violations to [maintainer email].

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making Swift code reviews better! 🎉
