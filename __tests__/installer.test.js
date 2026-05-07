'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const { installClaude, installCodex, installGemini, installKiro, VALID_AGENTS } = require('../bin/lib/agents');
const { selectAgents } = require('../bin/lib/prompt');

// ---------- helpers ----------

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'scr-test-'));
}

function packageRoot() {
  return path.resolve(__dirname, '..');
}

// ---------- VALID_AGENTS ----------

describe('VALID_AGENTS', () => {
  test('contains exactly the four v1 targets', () => {
    assert.deepEqual([...VALID_AGENTS].sort(), ['claude', 'codex', 'gemini', 'kiro']);
  });
});

// ---------- selectAgents ----------

describe('selectAgents', () => {
  test('--all returns all agents', async () => {
    const result = await selectAgents({ allFlag: true, isTTY: false });
    assert.deepEqual([...result].sort(), ['claude', 'codex', 'gemini', 'kiro']);
  });

  test('--agent single returns that agent', async () => {
    const result = await selectAgents({ agentFlag: 'codex', isTTY: false });
    assert.deepEqual(result, ['codex']);
  });

  test('--agent comma-list returns multiple agents', async () => {
    const result = await selectAgents({ agentFlag: 'claude,gemini', isTTY: false });
    assert.deepEqual(result, ['claude', 'gemini']);
  });

  test('non-TTY without flags defaults to claude', async () => {
    const result = await selectAgents({ isTTY: false });
    assert.deepEqual(result, ['claude']);
  });

  test('unknown agent name exits with code 1', async () => {
    // Intercept process.exit
    const originalExit = process.exit;
    let exitCode = null;
    process.exit = (code) => { exitCode = code; throw new Error('exit'); };
    try {
      await selectAgents({ agentFlag: 'unknown-agent', isTTY: false });
    } catch (_) {}
    process.exit = originalExit;
    assert.equal(exitCode, 1);
  });
});

// ---------- installClaude ----------

describe('installClaude', () => {
  let dir;
  before(() => { dir = tmpDir(); });
  after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  test('creates expected files', () => {
    installClaude(packageRoot(), dir);
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'agents', 'swift-code-reviewer.md')));
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'commands', 'review.md')));
  });

  test('skips existing files on second run (idempotency)', () => {
    const agentPath = path.join(dir, '.claude', 'agents', 'swift-code-reviewer.md');
    const before = fs.statSync(agentPath).mtimeMs;
    installClaude(packageRoot(), dir);
    const after = fs.statSync(agentPath).mtimeMs;
    assert.equal(before, after, 'file should not be overwritten on second run');
  });

  test('force flag overwrites existing files', () => {
    const agentPath = path.join(dir, '.claude', 'agents', 'swift-code-reviewer.md');
    const before = fs.statSync(agentPath).mtimeMs;
    installClaude(packageRoot(), dir, { force: true });
    const after = fs.statSync(agentPath).mtimeMs;
    assert.ok(after >= before);
  });

  test('dry-run creates no files in a fresh dir', () => {
    const fresh = tmpDir();
    installClaude(packageRoot(), fresh, { dryRun: true });
    assert.ok(!fs.existsSync(path.join(fresh, '.claude')));
    fs.rmSync(fresh, { recursive: true, force: true });
  });
});

// ---------- installCodex ----------

describe('installCodex', () => {
  let dir;
  before(() => { dir = tmpDir(); });
  after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  test('creates swift-code-reviewer.md at repo root', () => {
    installCodex(packageRoot(), dir);
    assert.ok(fs.existsSync(path.join(dir, 'swift-code-reviewer.md')));
  });

  test('file has no YAML frontmatter', () => {
    const content = fs.readFileSync(path.join(dir, 'swift-code-reviewer.md'), 'utf8');
    assert.ok(!content.startsWith('---'), 'Codex wrapper must not have YAML frontmatter');
  });

  test('dry-run creates no files', () => {
    const fresh = tmpDir();
    installCodex(packageRoot(), fresh, { dryRun: true });
    assert.ok(!fs.existsSync(path.join(fresh, 'swift-code-reviewer.md')));
    fs.rmSync(fresh, { recursive: true, force: true });
  });
});

// ---------- installGemini ----------

describe('installGemini', () => {
  let dir;
  before(() => { dir = tmpDir(); });
  after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  test('creates sidecar and toml command', () => {
    installGemini(packageRoot(), dir);
    assert.ok(fs.existsSync(path.join(dir, 'swift-code-reviewer.md')));
    assert.ok(fs.existsSync(path.join(dir, '.gemini', 'commands', 'review.toml')));
  });

  test('review.toml includes @./swift-code-reviewer.md reference', () => {
    const toml = fs.readFileSync(path.join(dir, '.gemini', 'commands', 'review.toml'), 'utf8');
    assert.ok(toml.includes('@./swift-code-reviewer.md'));
  });
});

// ---------- installKiro ----------

describe('installKiro', () => {
  let dir;
  before(() => { dir = tmpDir(); });
  after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  test('creates steering file in .kiro/steering/', () => {
    installKiro(packageRoot(), dir);
    assert.ok(fs.existsSync(path.join(dir, '.kiro', 'steering', 'swift-code-reviewer.md')));
  });

  test('steering file has inclusion: fileMatch frontmatter', () => {
    const content = fs.readFileSync(
      path.join(dir, '.kiro', 'steering', 'swift-code-reviewer.md'),
      'utf8',
    );
    assert.ok(content.includes('inclusion: fileMatch'));
  });

  test('steering file uses recursive glob **/*.swift', () => {
    const content = fs.readFileSync(
      path.join(dir, '.kiro', 'steering', 'swift-code-reviewer.md'),
      'utf8',
    );
    assert.ok(content.includes('**/*.swift'));
  });
});
