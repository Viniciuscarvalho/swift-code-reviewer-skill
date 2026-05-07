'use strict';

const { VALID_AGENTS } = require('./agents');

/**
 * Resolve which agents to install based on CLI flags and TTY state.
 *
 * Priority:
 *   1. --all flag → all agents
 *   2. --agent <name[,name]> flag → named agents
 *   3. TTY available → interactive @inquirer/prompts checkbox
 *   4. Non-TTY without flags → ['claude'] (CI-safe fallback)
 */
async function selectAgents({ allFlag, agentFlag, isTTY } = {}) {
  if (allFlag) return [...VALID_AGENTS];

  if (agentFlag) {
    const requested = agentFlag.split(',').map((s) => s.trim().toLowerCase());
    const invalid = requested.filter((a) => !VALID_AGENTS.includes(a));
    if (invalid.length > 0) {
      console.error(`  Unknown agent(s): ${invalid.join(', ')}`);
      console.error(`  Valid options: ${VALID_AGENTS.join(', ')}`);
      process.exit(1);
    }
    return requested;
  }

  if (!isTTY) {
    return ['claude'];
  }

  const { checkbox } = require('@inquirer/prompts');
  const choices = VALID_AGENTS.map((name) => ({
    name: agentLabel(name),
    value: name,
    checked: name === 'claude',
  }));

  const selected = await checkbox({
    message: 'Which agent(s) should the review guide be installed for?',
    choices,
    validate: (val) => val.length > 0 || 'Select at least one agent.',
  });

  return selected;
}

function agentLabel(name) {
  const labels = {
    claude: 'Claude Code  (.claude/agents/ + .claude/commands/)',
    codex:  'OpenAI Codex CLI  (swift-code-reviewer.md at repo root)',
    gemini: 'Google Gemini CLI  (swift-code-reviewer.md + .gemini/commands/review.toml)',
    kiro:   'Kiro  (.kiro/steering/swift-code-reviewer.md, fileMatch: **/*.swift)',
  };
  return labels[name] || name;
}

module.exports = { selectAgents };
