#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'swift-code-reviewer-skill';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function findPackageRoot() {
  let dir = __dirname;
  while (!fs.existsSync(path.join(dir, 'SKILL.md'))) {
    const parent = path.dirname(dir);
    if (parent === dir) {
      log('  Error: Could not find SKILL.md in package', colors.red);
      process.exit(1);
    }
    dir = parent;
  }
  return dir;
}

// ---------- global install (default command) ----------

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

  const filesToCopy = ['SKILL.md', 'README.md', 'LICENSE', 'CONTRIBUTING.md', 'CHANGELOG.md'];
  const dirsToCopy = ['core', 'references', 'skills', 'templates'];

  for (const file of filesToCopy) {
    const src = path.join(packageRoot, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(targetDir, file));
      log(`  Copied: ${file}`, colors.green);
    }
  }

  for (const dir of dirsToCopy) {
    const src = path.join(packageRoot, dir);
    if (fs.existsSync(src)) {
      copyRecursive(src, path.join(targetDir, dir));
      log(`  Copied: ${dir}/`, colors.green);
    }
  }

  log('\n  Installation complete!', colors.green + colors.bright);
  log('\n  The skill is now available in Claude Code.', colors.reset);
  log('  To scaffold the review agent into a project, run:', colors.reset);
  log('\n    npx swift-code-reviewer-skill init\n', colors.cyan);
  log(`  Skill location: ${targetDir}`, colors.blue);
  log('  Documentation: https://github.com/Viniciuscarvalho/swift-code-reviewer-skill\n', colors.blue);
}

// ---------- init (project scaffolding) ----------

async function init(flags) {
  log('\n  Swift Code Reviewer — Project Setup', colors.cyan + colors.bright);
  log('  =====================================\n', colors.cyan);

  const packageRoot = findPackageRoot();
  const cwd = process.cwd();

  if (!fs.existsSync(path.join(cwd, '.git'))) {
    log('  Warning: Not a git repository. Running anyway.\n', colors.yellow);
  }

  const { selectAgents } = require('./lib/prompt');
  const { AGENT_INSTALLERS } = require('./lib/agents');

  const agents = await selectAgents({
    allFlag: flags.all,
    agentFlag: flags.agent,
    isTTY: Boolean(process.stdout.isTTY),
  });

  if (agents.length === 0) {
    log('  No agents selected. Nothing to do.\n', colors.yellow);
    return;
  }

  const opts = { dryRun: flags.dryRun, force: flags.force };
  for (const agent of agents) {
    AGENT_INSTALLERS[agent](packageRoot, cwd, opts);
  }

  log('\n  Done!\n', colors.green + colors.bright);
}

// ---------- uninstall ----------

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

// ---------- help ----------

function showHelp() {
  log('\n  Swift Code Reviewer Skill', colors.cyan + colors.bright);
  log('  =========================\n', colors.cyan);
  log('  Usage: npx swift-code-reviewer-skill [command] [options]\n', colors.reset);
  log('  Commands:', colors.bright);
  log('    (none)     Install the skill to ~/.claude/skills/', colors.reset);
  log('    init       Scaffold review agent into the current project', colors.reset);
  log('    uninstall  Remove the skill from ~/.claude/skills/', colors.reset);
  log('    help       Show this help message\n', colors.reset);
  log('  Options for init:', colors.bright);
  log('    --agent <name[,name]>   Target specific agent(s): claude, codex, gemini, kiro', colors.reset);
  log('    --all                   Install for all supported agents', colors.reset);
  log('    --force                 Overwrite existing files', colors.reset);
  log('    --dry-run               Preview writes without touching the filesystem\n', colors.reset);
  log('  Examples:', colors.bright);
  log('    npx swift-code-reviewer-skill              # install skill globally (Claude)', colors.cyan);
  log('    npx swift-code-reviewer-skill init          # interactive agent picker', colors.cyan);
  log('    npx swift-code-reviewer-skill init --all    # all agents at once', colors.cyan);
  log('    npx swift-code-reviewer-skill init --agent codex,gemini', colors.cyan);
  log('    npx swift-code-reviewer-skill init --dry-run', colors.cyan);
  log('    npx swift-code-reviewer-skill uninstall\n', colors.cyan);
}

// ---------- arg parsing ----------

function parseFlags(argv) {
  const flags = { all: false, agent: null, dryRun: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--all') flags.all = true;
    else if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--force') flags.force = true;
    else if (arg === '--agent' && argv[i + 1]) { flags.agent = argv[++i]; }
    else if (arg.startsWith('--agent=')) { flags.agent = arg.slice('--agent='.length); }
  }
  return flags;
}

// ---------- entry point ----------

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith('-')) || '';
const flags = parseFlags(args.filter((a) => a.startsWith('-') || args.indexOf(a) > 0));

switch (command) {
  case 'init':
  case 'setup':
    init(flags).catch((err) => { console.error(err); process.exit(1); });
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
