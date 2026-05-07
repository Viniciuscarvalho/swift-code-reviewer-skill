Output assets/init-demo.gif
Set FontSize 14
Set Width 900
Set Height 550
Set Theme "Catppuccin Mocha"
Set Padding 20
Set Shell zsh

# Start in a fresh temp project directory
Type "cd $(mktemp -d) && git init"
Enter
Sleep 600ms

# Show the install command
Type "npx swift-code-reviewer-skill init"
Sleep 400ms
Enter
Sleep 2000ms

# @inquirer/prompts checkbox renders — navigate it
# Claude Code is pre-checked; also select Gemini
Down
Sleep 300ms
Space
Sleep 300ms
Enter
Sleep 1500ms

# Post-install output for Claude Code
Sleep 500ms

# Post-install output for Gemini
Sleep 500ms

# Show the created files
Type "find .claude .gemini -type f 2>/dev/null | sort"
Enter
Sleep 800ms

# Final pause so viewer can read the output
Sleep 1500ms
