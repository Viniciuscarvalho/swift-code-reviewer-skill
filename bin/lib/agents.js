'use strict';

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function writeFile(dest, src, label, dryRun) {
  const exists = fs.existsSync(dest);
  if (dryRun) {
    log(`  [dry-run] ${exists ? 'Update' : 'Create'}: ${label}`, colors.blue);
    return;
  }
  if (exists) {
    log(`  Updated: ${label}`, colors.yellow);
  } else {
    log(`  Created: ${label}`, colors.green);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function skipFile(label, dryRun) {
  if (dryRun) {
    log(`  [dry-run] Skip (exists): ${label}`, colors.yellow);
  } else {
    log(`  Skipped: ${label} (already exists)`, colors.yellow);
  }
}

function installClaude(packageRoot, cwd, { dryRun = false, force = false } = {}) {
  log('\n  Installing for Claude Code…', colors.cyan);

  const agentSrc = path.join(packageRoot, 'templates', 'agents', 'claude', 'swift-code-reviewer.md');
  const cmdSrc = path.join(packageRoot, 'templates', 'commands', 'claude', 'review.md');

  const agentDest = path.join(cwd, '.claude', 'agents', 'swift-code-reviewer.md');
  const cmdDest = path.join(cwd, '.claude', 'commands', 'review.md');

  if (!force && fs.existsSync(agentDest)) {
    skipFile('.claude/agents/swift-code-reviewer.md', dryRun);
  } else {
    writeFile(agentDest, agentSrc, '.claude/agents/swift-code-reviewer.md', dryRun);
  }

  if (!force && fs.existsSync(cmdDest)) {
    skipFile('.claude/commands/review.md', dryRun);
  } else {
    writeFile(cmdDest, cmdSrc, '.claude/commands/review.md', dryRun);
  }

  log('\n  Claude Code hints:', colors.reset);
  log('    /review              — run a full Swift code review', colors.cyan);
  log('    @swift-code-reviewer — invoke the agent directly\n', colors.cyan);
}

function installCodex(packageRoot, cwd, { dryRun = false, force = false } = {}) {
  log('\n  Installing for OpenAI Codex CLI…', colors.cyan);

  const agentSrc = path.join(packageRoot, 'templates', 'agents', 'codex', 'swift-code-reviewer.md');
  const agentDest = path.join(cwd, 'swift-code-reviewer.md');

  if (!force && fs.existsSync(agentDest)) {
    skipFile('swift-code-reviewer.md', dryRun);
  } else {
    writeFile(agentDest, agentSrc, 'swift-code-reviewer.md', dryRun);
  }

  log('\n  Codex post-install — add this to your AGENTS.md:\n', colors.reset);
  log('    ## Swift code review', colors.cyan);
  log('    See swift-code-reviewer.md for the full review guide.\n', colors.cyan);
  log('  Note: Codex concatenates AGENTS.md into the system prompt and does not', colors.yellow);
  log('  auto-resolve @-path mentions. Paste the snippet above manually.\n', colors.yellow);
}

function installGemini(packageRoot, cwd, { dryRun = false, force = false } = {}) {
  log('\n  Installing for Google Gemini CLI…', colors.cyan);

  const agentSrc = path.join(packageRoot, 'templates', 'agents', 'gemini', 'swift-code-reviewer.md');
  const cmdSrc = path.join(packageRoot, 'templates', 'commands', 'gemini', 'review.toml');

  const agentDest = path.join(cwd, 'swift-code-reviewer.md');
  const cmdDest = path.join(cwd, '.gemini', 'commands', 'review.toml');

  if (!force && fs.existsSync(agentDest)) {
    skipFile('swift-code-reviewer.md', dryRun);
  } else {
    writeFile(agentDest, agentSrc, 'swift-code-reviewer.md', dryRun);
  }

  if (!force && fs.existsSync(cmdDest)) {
    skipFile('.gemini/commands/review.toml', dryRun);
  } else {
    writeFile(cmdDest, cmdSrc, '.gemini/commands/review.toml', dryRun);
  }

  log('\n  Gemini CLI hints:', colors.reset);
  log('    /review              — run a full Swift code review (via review.toml)', colors.cyan);
  log('    The command uses @./swift-code-reviewer.md to load the guide.\n', colors.cyan);
}

function installKiro(packageRoot, cwd, { dryRun = false, force = false } = {}) {
  log('\n  Installing for Kiro…', colors.cyan);

  const agentSrc = path.join(packageRoot, 'templates', 'agents', 'kiro', 'swift-code-reviewer.md');
  const agentDest = path.join(cwd, '.kiro', 'steering', 'swift-code-reviewer.md');

  if (!force && fs.existsSync(agentDest)) {
    skipFile('.kiro/steering/swift-code-reviewer.md', dryRun);
  } else {
    writeFile(agentDest, agentSrc, '.kiro/steering/swift-code-reviewer.md', dryRun);
  }

  log('\n  Kiro hints:', colors.reset);
  log('    Steering auto-activates for any *.swift file (fileMatch inclusion).', colors.cyan);
  log('    Note: workspace-scoped steering only — global steering has a known', colors.yellow);
  log('    bug (https://github.com/kirodotdev/Kiro/issues/6171).\n', colors.yellow);
}

const AGENT_INSTALLERS = { claude: installClaude, codex: installCodex, gemini: installGemini, kiro: installKiro };
const VALID_AGENTS = Object.keys(AGENT_INSTALLERS);

module.exports = { installClaude, installCodex, installGemini, installKiro, AGENT_INSTALLERS, VALID_AGENTS };
