#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="swift-code-reviewer-skill"
SKILL_VERSION="1.2.0"

# Colors and formatting
if [[ -t 1 ]] && [[ "${TERM:-}" != "dumb" ]]; then
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BLUE='\033[0;34m'
  CYAN='\033[0;36m'
else
  BOLD=''
  DIM=''
  RESET=''
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  CYAN=''
fi

CHECK="${GREEN}✓${RESET}"
CROSS="${RED}✗${RESET}"
ARROW="${CYAN}→${RESET}"

print_header() {
  printf "\n"
  printf "${BOLD}${BLUE}╭──────────────────────────────────────╮${RESET}\n"
  printf "${BOLD}${BLUE}│${RESET}  ${BOLD}Swift Code Reviewer Skill Installer${RESET}  ${BOLD}${BLUE}│${RESET}\n"
  printf "${BOLD}${BLUE}│${RESET}  ${DIM}v${SKILL_VERSION}${RESET}                                 ${BOLD}${BLUE}│${RESET}\n"
  printf "${BOLD}${BLUE}╰──────────────────────────────────────╯${RESET}\n\n"
}

print_success() { printf "  ${CHECK} ${GREEN}%s${RESET}\n" "$1"; }
print_error()   { printf "  ${CROSS} ${RED}%s${RESET}\n" "$1" >&2; }
print_info()    { printf "  ${ARROW} %s\n" "$1"; }
print_step()    { printf "\n${BOLD}%s${RESET}\n" "$1"; }
print_skip()    { printf "  ${YELLOW}⊘ %s${RESET}\n" "$1"; }

usage() {
  cat <<EOF
${BOLD}Usage:${RESET} install-skill.sh [command]

${BOLD}Commands:${RESET}
  (none)      Install the skill to ~/.claude/skills/
  init        Scaffold agent + /review command into current project
  uninstall   Remove the skill from ~/.claude/skills/
  -h, --help  Show this help message

${BOLD}Examples:${RESET}
  ./install-skill.sh              # install skill globally
  ./install-skill.sh init          # add agent + command to project
  ./install-skill.sh uninstall
EOF
}

install_skill() {
  print_header

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  TARGET_DIR="${HOME}/.claude/skills/${SKILL_NAME}"

  print_step "Installing"

  if [[ ! -d "${HOME}/.claude/skills" ]]; then
    mkdir -p "${HOME}/.claude/skills"
    print_info "Created ~/.claude/skills/"
  fi

  if [[ -d "${TARGET_DIR}" ]]; then
    rm -rf "${TARGET_DIR}"
    print_info "Replacing existing installation"
  fi

  mkdir -p "${TARGET_DIR}"

  for file in SKILL.md README.md LICENSE CONTRIBUTING.md CHANGELOG.md; do
    if [[ -f "${SCRIPT_DIR}/${file}" ]]; then
      cp "${SCRIPT_DIR}/${file}" "${TARGET_DIR}/${file}"
      print_success "Copied ${file}"
    fi
  done

  if [[ -d "${SCRIPT_DIR}/references" ]]; then
    cp -r "${SCRIPT_DIR}/references" "${TARGET_DIR}/references"
    print_success "Copied references/"
  fi

  printf "\n"
  printf "${BOLD}${GREEN}╭──────────────────────────────────────╮${RESET}\n"
  printf "${BOLD}${GREEN}│${RESET}      ${CHECK} ${BOLD}Installation Complete!${RESET}        ${BOLD}${GREEN}│${RESET}\n"
  printf "${BOLD}${GREEN}╰──────────────────────────────────────╯${RESET}\n\n"

  printf "  ${BOLD}Skill:${RESET}    %s\n" "${SKILL_NAME}"
  printf "  ${BOLD}Location:${RESET} %s\n" "${TARGET_DIR}"
  printf "\n"
  printf "  ${DIM}To add the review agent and /review command to a project:${RESET}\n"
  printf "  ${CYAN}→${RESET} ./install-skill.sh init\n"
  printf "\n"
  printf "  ${DIM}Or use it directly in Claude Code by asking:${RESET}\n"
  printf "  ${CYAN}→${RESET} \"Review this PR\"\n"
  printf "  ${CYAN}→${RESET} \"Review LoginView.swift\"\n"
  printf "  ${CYAN}→${RESET} \"Review my uncommitted changes\"\n"
  printf "  ${CYAN}→${RESET} \"Check if this follows our coding standards\"\n\n"
}

init_project() {
  print_header

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  TEMPLATES_DIR="${SCRIPT_DIR}/templates"

  print_step "Scaffolding agent + command into project"

  if [[ ! -d ".git" ]]; then
    printf "  ${YELLOW}Warning: Not a git repository. Running anyway.${RESET}\n\n"
  fi

  if [[ ! -d "${TEMPLATES_DIR}/agents" ]]; then
    print_error "Templates not found. Make sure you're running from the skill repo."
    exit 1
  fi

  mkdir -p .claude/agents .claude/commands

  local created=0
  local skipped=0

  # Agent
  if [[ -f ".claude/agents/swift-code-reviewer.md" ]]; then
    print_skip "Skipped .claude/agents/swift-code-reviewer.md (already exists)"
    ((skipped++))
  else
    cp "${TEMPLATES_DIR}/agents/swift-code-reviewer.md" ".claude/agents/swift-code-reviewer.md"
    print_success "Created .claude/agents/swift-code-reviewer.md"
    ((created++))
  fi

  # Command
  if [[ -f ".claude/commands/review.md" ]]; then
    print_skip "Skipped .claude/commands/review.md (already exists)"
    ((skipped++))
  else
    cp "${TEMPLATES_DIR}/commands/review.md" ".claude/commands/review.md"
    print_success "Created .claude/commands/review.md"
    ((created++))
  fi

  printf "\n  ${BOLD}${GREEN}Done!${RESET} ${created} file(s) created, ${skipped} skipped.\n"

  if [[ ${created} -gt 0 ]]; then
    printf "\n  ${BOLD}Usage:${RESET}\n"
    printf "  ${CYAN}→${RESET} /review                    — run a full code review before pushing\n"
    printf "  ${CYAN}→${RESET} @swift-code-reviewer       — invoke the agent directly\n\n"
  fi
}

uninstall_skill() {
  print_header

  TARGET_DIR="${HOME}/.claude/skills/${SKILL_NAME}"

  print_step "Uninstalling"

  if [[ -d "${TARGET_DIR}" ]]; then
    rm -rf "${TARGET_DIR}"
    print_success "Removed ${TARGET_DIR}"
    printf "\n  ${BOLD}Uninstallation complete.${RESET}\n\n"
  else
    print_info "Skill not found at ${TARGET_DIR}. Nothing to uninstall."
  fi
}

case "${1:-}" in
  init|setup)
    init_project
    ;;
  uninstall|remove)
    uninstall_skill
    ;;
  -h|--help|help)
    usage
    ;;
  "")
    install_skill
    ;;
  *)
    print_error "Unknown command: $1"
    usage
    exit 1
    ;;
esac
