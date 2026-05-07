Output assets/init-demo.gif
Set FontSize 14
Set Width 900
Set Height 550
Set Theme "Catppuccin Mocha"
Set Padding 20
Set Shell zsh
Set TypingSpeed 40ms

# Start in a fresh temp project directory
Type "TMPDIR=$(mktemp -d) && cd $TMPDIR && git init"
Enter
Sleep 1s

# Show the install command (--all skips interactive prompt, works reliably in VHS)
Type "node /Users/viniciuscarvalho/Documents/swift-code-reviewer-skill/bin/install.js init --all"
Sleep 500ms
Enter
Sleep 4s

# Show the scaffolded files
Type "find .claude .gemini .kiro -type f 2>/dev/null | sort"
Enter
Sleep 1500ms

# Show the sidecar file created for Codex/Gemini at the repo root
Type "ls swift-code-reviewer.md"
Enter
Sleep 1s

# Final pause so viewer can read the output
Sleep 2s
