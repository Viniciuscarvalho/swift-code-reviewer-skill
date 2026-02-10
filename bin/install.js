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

function install() {
  log('\n  Swift Code Reviewer Skill Installer', colors.cyan + colors.bright);
  log('  ====================================\n', colors.cyan);

  // Determine paths
  const homeDir = os.homedir();
  const skillsDir = path.join(homeDir, '.claude', 'skills');
  const targetDir = path.join(skillsDir, SKILL_NAME);

  // Find package root (where SKILL.md is located)
  let packageRoot = __dirname;
  while (!fs.existsSync(path.join(packageRoot, 'SKILL.md'))) {
    const parent = path.dirname(packageRoot);
    if (parent === packageRoot) {
      log('  Error: Could not find SKILL.md in package', colors.red);
      process.exit(1);
    }
    packageRoot = parent;
  }

  // Check if Claude Code skills directory exists
  if (!fs.existsSync(skillsDir)) {
    log(`  Creating skills directory: ${skillsDir}`, colors.yellow);
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  // Check for existing installation
  if (fs.existsSync(targetDir)) {
    log(`  Updating existing installation at:`, colors.yellow);
    log(`  ${targetDir}\n`, colors.yellow);
    fs.rmSync(targetDir, { recursive: true, force: true });
  } else {
    log(`  Installing to:`, colors.blue);
    log(`  ${targetDir}\n`, colors.blue);
  }

  // Create target directory
  fs.mkdirSync(targetDir, { recursive: true });

  // Files to copy
  const filesToCopy = [
    'SKILL.md',
    'README.md',
    'LICENSE',
    'CONTRIBUTING.md',
    'CHANGELOG.md'
  ];

  // Directories to copy
  const dirsToCopy = ['references'];

  // Copy files
  for (const file of filesToCopy) {
    const src = path.join(packageRoot, file);
    const dest = path.join(targetDir, file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      log(`  Copied: ${file}`, colors.green);
    }
  }

  // Copy directories
  for (const dir of dirsToCopy) {
    const src = path.join(packageRoot, dir);
    const dest = path.join(targetDir, dir);

    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
      log(`  Copied: ${dir}/`, colors.green);
    }
  }

  // Success message
  log('\n  Installation complete!', colors.green + colors.bright);
  log('\n  The skill is now available in Claude Code.', colors.reset);
  log('  Use it by asking Claude to:', colors.reset);
  log('\n    - "Review this PR"', colors.cyan);
  log('    - "Review LoginView.swift"', colors.cyan);
  log('    - "Review my uncommitted changes"', colors.cyan);
  log('    - "Check if this follows our coding standards"\n', colors.cyan);

  log(`  Skill location: ${targetDir}`, colors.blue);
  log('  Documentation: https://github.com/Viniciuscarvalho/swift-code-reviewer-skill\n', colors.blue);
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
  log('    uninstall  Remove the skill from ~/.claude/skills/', colors.reset);
  log('    help       Show this help message\n', colors.reset);
  log('  Examples:', colors.bright);
  log('    npx swift-code-reviewer-skill', colors.cyan);
  log('    npx swift-code-reviewer-skill uninstall\n', colors.cyan);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
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
