#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'swift-code-reviewer-skill';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function findPackageRoot() {
  let packageRoot = __dirname;
  while (!fs.existsSync(path.join(packageRoot, 'SKILL.md'))) {
    const parent = path.dirname(packageRoot);
    if (parent === packageRoot) {
      log('  Error: Could not find SKILL.md in package', colors.red);
      process.exit(1);
    }
    packageRoot = parent;
  }
  return packageRoot;
}

function install() {
  log('\n  Swift Code Reviewer Skill Installer', colors.cyan + colors.bright);
  log('  ====================================\n', colors.cyan);

  const homeDir = os.homedir();
  const skillsDir = path.join(homeDir, '.claude', 'skills');
  const targetDir = path.join(skillsDir, SKILL_NAME);
  const packageRoot = findPackageRoot();

  if (!fs.existsSync(skillsDir)) {
    log(`  Creating skills directory: ${skillsDir}`, colors.yellow);
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  if (fs.existsSync(targetDir)) {
    log(`  Updating existing installation at:`, colors.yellow);
    log(`  ${targetDir}\n`, colors.yellow);
    fs.rmSync(targetDir, { recursive: true, force: true });
  } else {
    log(`  Installing to:`, colors.blue);
    log(`  ${targetDir}\n`, colors.blue);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const filesToCopy = [
    'SKILL.md',
    'README.md',
    'LICENSE',
    'CONTRIBUTING.md',
    'CHANGELOG.md'
  ];

  const dirsToCopy = ['references', 'skills', 'templates'];

  for (const file of filesToCopy) {
    const src = path.join(packageRoot, file);
    const dest = path.join(targetDir, file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      log(`  Copied: ${file}`, colors.green);
    }
  }

  for (const dir of dirsToCopy) {
    const src = path.join(packageRoot, dir);
    const dest = path.join(targetDir, dir);

    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
      log(`  Copied: ${dir}/`, colors.green);
    }
  }

  log('\n  Installation complete!', colors.green + colors.bright);
  log('\n  The skill is now available in Claude Code.', colors.reset);
  log('  To add the review agent and /review command to a project, run:', colors.reset);
  log('\n    npx swift-code-reviewer-skill init\n', colors.cyan);
  log('  Or use it directly by asking Claude to:', colors.reset);
  log('\n    - "Review this PR"', colors.cyan);
  log('    - "Review LoginView.swift"', colors.cyan);
  log('    - "Review my uncommitted changes"', colors.cyan);
  log('    - "Check if this follows our coding standards"\n', colors.cyan);

  log(`  Skill location: ${targetDir}`, colors.blue);
  log('  Documentation: https://github.com/Viniciuscarvalho/swift-code-reviewer-skill\n', colors.blue);
}

function init() {
  log('\n  Swift Code Reviewer — Project Setup', colors.cyan + colors.bright);
  log('  =====================================\n', colors.cyan);

  const packageRoot = findPackageRoot();
  const cwd = process.cwd();

  // Verify we're in a git repo (likely a real project)
  if (!fs.existsSync(path.join(cwd, '.git'))) {
    log('  Warning: Not a git repository. Running anyway.\n', colors.yellow);
  }

  const claudeDir = path.join(cwd, '.claude');
  const agentsDir = path.join(claudeDir, 'agents');
  const commandsDir = path.join(claudeDir, 'commands');

  const templateAgentSrc = path.join(packageRoot, 'templates', 'agents', 'swift-code-reviewer.md');
  const templateCommandSrc = path.join(packageRoot, 'templates', 'commands', 'review.md');

  // Check templates exist
  if (!fs.existsSync(templateAgentSrc)) {
    log('  Error: Agent template not found. Reinstall the skill with:', colors.red);
    log('    npx swift-code-reviewer-skill\n', colors.cyan);
    process.exit(1);
  }

  fs.mkdirSync(agentsDir, { recursive: true });
  fs.mkdirSync(commandsDir, { recursive: true });

  let created = 0;
  let skipped = 0;

  // Copy agent
  const agentDest = path.join(agentsDir, 'swift-code-reviewer.md');
  if (fs.existsSync(agentDest)) {
    log('  Skipped: .claude/agents/swift-code-reviewer.md (already exists)', colors.yellow);
    skipped++;
  } else {
    fs.copyFileSync(templateAgentSrc, agentDest);
    log('  Created: .claude/agents/swift-code-reviewer.md', colors.green);
    created++;
  }

  // Copy command
  const commandDest = path.join(commandsDir, 'review.md');
  if (fs.existsSync(commandDest)) {
    log('  Skipped: .claude/commands/review.md (already exists)', colors.yellow);
    skipped++;
  } else {
    fs.copyFileSync(templateCommandSrc, commandDest);
    log('  Created: .claude/commands/review.md', colors.green);
    created++;
  }

  log(`\n  Done! ${created} file(s) created, ${skipped} skipped.`, colors.green + colors.bright);

  if (created > 0) {
    log('\n  Usage:', colors.reset);
    log('    /review          — run a full code review before pushing', colors.cyan);
    log('    @swift-code-reviewer — invoke the agent directly\n', colors.cyan);
  }
}

function uninstall() {
  log('\n  Uninstalling Swift Code Reviewer Skill', colors.yellow + colors.bright);
  log('  ======================================\n', colors.yellow);

  const homeDir = os.homedir();
  const targetDir = path.join(homeDir, '.claude', 'skills', SKILL_NAME);

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    log(`  Removed: ${targetDir}`, colors.green);
    log('\n  Uninstallation complete!\n', colors.green + colors.bright);
  } else {
    log('  Skill not found. Nothing to uninstall.\n', colors.yellow);
  }
}

function showHelp() {
  log('\n  Swift Code Reviewer Skill', colors.cyan + colors.bright);
  log('  =========================\n', colors.cyan);
  log('  Usage: npx swift-code-reviewer-skill [command]\n', colors.reset);
  log('  Commands:', colors.bright);
  log('    (none)     Install the skill to ~/.claude/skills/', colors.reset);
  log('    init       Scaffold agent + /review command into current project', colors.reset);
  log('    uninstall  Remove the skill from ~/.claude/skills/', colors.reset);
  log('    help       Show this help message\n', colors.reset);
  log('  Examples:', colors.bright);
  log('    npx swift-code-reviewer-skill              # install skill globally', colors.cyan);
  log('    npx swift-code-reviewer-skill init          # add agent + command to project', colors.cyan);
  log('    npx swift-code-reviewer-skill uninstall     # remove skill\n', colors.cyan);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
  case 'setup':
    init();
    break;
  case 'uninstall':
  case 'remove':
    uninstall();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    install();
    break;
}
