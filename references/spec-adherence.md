# Spec Adherence Reference

This document describes how the reviewer extracts the *intent* of a change from
its PR description and linked issues, and how it then judges whether the code
delivers on that intent. Spec adherence runs before the language- and
framework-level checks: a clean diff that misses the point shouldn't pass.

---

## 1. Parsing `gh` / `glab` JSON Output

Always prefer the JSON output of the platform CLI over scraping the web UI —
it is stable, scriptable, and includes linked-issue metadata.

### GitHub

```bash
# PR body, title, labels, and the issues this PR closes
gh pr view <num> --json title,body,closingIssuesReferences,labels

# Linked issue (one per closing reference)
gh issue view <num> --json title,body,labels

# Reviewer-friendly summary in one shot
gh pr view <num> --json title,body,closingIssuesReferences \
  --jq '{title, body, issues: [.closingIssuesReferences[].number]}'
```

Fields to read:

| Field                       | Use                                               |
| --------------------------- | ------------------------------------------------- |
| `title`                     | Short statement of intent — start here.           |
| `body`                      | Acceptance criteria, scope, non-goals.            |
| `closingIssuesReferences`   | Numbers of issues that this PR will close.        |
| `labels`                    | `bug`, `feature`, `tech-debt` shape expectations. |

### GitLab

```bash
glab mr view <num>           # human-readable; pipe to less
glab mr view <num> --output json
glab issue view <num> --output json
```

GitLab's MR description and linked issues serve the same role as GitHub's PR
body and `closingIssuesReferences`.

---

## 2. Finding Acceptance Criteria

Acceptance criteria are rarely labeled as such. Look for these patterns, in
roughly this order:

1. **Markdown checkboxes** — `- [ ] ...` or `- [x] ...`. The most reliable
   signal. Each box is a discrete requirement.
2. **Gherkin / Given-When-Then** — phrases starting with `Given`, `When`,
   `Then`, or `And`. Common in BDD-flavored teams.
3. **Modal verbs** — `must`, `should`, `shall`, `will`, `needs to`. Each
   sentence is a candidate requirement; `must`/`shall` outrank `should`.
4. **Numbered or bulleted lists** under headings like `Acceptance Criteria`,
   `Requirements`, `Scope`, `Goals`, `What this PR does`.
5. **"Closes #N" / "Fixes #N"** — pull the linked issue and repeat 1–4 there.

If the PR has none of the above, treat the **title** as the single requirement
and note the lack of explicit criteria in the report.

---

## 3. Deleted Files and Test Coverage

### Deleted Files (`scope.deleted`)

Files in `scope.deleted` were removed in this PR. Do not include them in the per-file analysis loop. Do include them in the Requirement Coverage table when their removal is spec-relevant.

Ask: does the deletion satisfy a requirement ("remove legacy endpoint") or violate one ("auth service removed but login flow still referenced")? Flag unexplained deletions of non-trivial files as `⚠️ Partial` in the table with a note: *"File removed — confirm this is intentional and that callers are updated."*

### Test Coverage (`scope.testsForModified`)

For each file in `scope.testsForModified`:
- Check whether tests cover the scenarios described in the spec. Coverage gaps (new branches, new functions, changed behaviour with no test) → **first-class findings in the main report**.
- Other issues found in those test files (e.g., force-unwrap in test helper, bad assertion pattern) → **Adjacent Observations** (out of scope for this PR).

If no file in `scope.testsForModified` exists for a modified source file, add a finding:
> `⚠️ No test file found for <SourceFile.swift> — consider adding one or updating an existing test suite.`

---

## 4. Handling PRs With No Description

A blank or near-blank description is itself a finding. Do not invent intent.

1. Note in the report: _"PR description is empty / minimal — spec adherence
   inferred from diff and commit messages, may be incomplete."_
2. Use, in order: linked issues, commit messages (`git log <base>..HEAD`),
   branch name, file paths touched.
3. List every inferred requirement explicitly so the author can correct any
   misreading, prefixed with `(inferred)`.
4. Do not penalize the diff for failing to satisfy a requirement that was
   only inferred — flag the missing description instead.

---

## 4. Scope Creep vs. Legitimate Adjacent Fixes

Not every out-of-spec change is scope creep. Use this rubric:

| Change type                                                                  | Verdict                               |
| ---------------------------------------------------------------------------- | ------------------------------------- |
| Touches a file required by the spec, fixes an obvious nearby bug, < ~10 LOC  | **Allow** — note it; don't flag.      |
| Renames or restructures a file the spec requires editing                     | **Allow if minimal**, otherwise flag. |
| Drive-by formatting / style changes across many files                        | **Flag** — recommend separate PR.     |
| Refactor of a module unrelated to the spec                                   | **Flag** — scope creep.               |
| New feature not mentioned anywhere in spec                                   | **Flag** — scope creep, must justify. |
| Dependency version bumps                                                     | **Flag** — separate PR by convention. |
| Test additions for the spec'd code                                           | **Allow** — expected.                 |
| Test additions for unrelated existing code                                   | **Allow but note** — usually welcome. |

When flagging scope creep, always recommend the concrete remediation
("split out into a follow-up PR" or "move to a separate commit if the team
allows partial review").

---

## 5. Intent Drift

The trickier failure mode: the diff *runs* but solves a subtly different
problem than the spec. Symptoms:

- Naming uses different domain terms than the spec (e.g., spec says
  "session", code says "token").
- Data flow contradicts the spec's mental model (e.g., spec says the server
  is the source of truth, code caches and treats local as authoritative).
- Edge cases the spec called out are silently excluded by an early `return`.
- The PR title says "fix" but the diff is a rewrite, or vice versa.

When you suspect intent drift, quote both the spec sentence and the code
location side-by-side in the finding.

---

## 6. Requirement Coverage Table — Template

Drop this into the Spec Adherence section of the report, one row per
requirement extracted in step 2.

```markdown
## Spec Adherence

**Source**: PR #<num> / Issue #<num>

| Requirement                              | Status                              | Location                       |
|------------------------------------------|-------------------------------------|--------------------------------|
| <verbatim or paraphrased criterion>      | ✅ Implemented                       | `<file>:<line>`                |
| <criterion with edge case>               | ⚠️ Partial — <what's missing>        | `<file>:<line>`                |
| <criterion>                              | ❌ Not implemented                   | —                              |
| <inferred criterion>                     | ✅ Implemented (inferred)            | `<file>:<line>`                |

**Scope creep**: <count> unrelated change(s) — <one-line summary, recommend split>.

**Spec gaps**: <count> criterion/criteria not addressed — see "Must fix" in
prioritized action items.
```

Status legend (use these exact glyphs for greppability):

- ✅ Implemented — code satisfies the criterion and tests, if any, cover it.
- ⚠️ Partial — happy path works, but at least one edge case or branch is
  missing. Always say *what* is missing.
- ❌ Not implemented — no code addresses the criterion.
- ➖ Not assessed — no spec context available; do not guess.

If `status` is anything other than ✅, the corresponding action item belongs
in **Must fix** or **Should fix** depending on whether the criterion was
flagged `must`/`shall` versus `should`.
