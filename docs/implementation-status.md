# Implementation evidence

This page preserves Phase 1 evidence. For current state and subsequent fixes, use the [current audit](current-audit.md); Phase 2 results are in [its evidence record](phase2-evidence.md).

## Phase 1

Foundation implemented 2026-09-28. Attribution follows both original git commits dated 2025-05-18 by Mohamed Maher Nada and the repository remote; the original license explicitly stated MIT. Inventory initially marks all 21 original lessons draft.

Documentation checks, broken-link fixtures and ignore-rule verification are recorded after execution. External availability is advisory. Hosted CI has not run in this workspace.

Verification on 2026-09-28: `node scripts/check-docs.mjs` checked 30 Markdown files with zero errors. `node --test --test-isolation=none scripts/check-docs.test.mjs` passed 9/9 regression tests, including broken paths, missing fragments, escaped filenames, missing inventory and fenced-heading exclusion. Standard isolated test execution hit sandbox `spawn EPERM`; CI retains standard isolation and hosted execution remains unverified.

`git check-ignore` confirmed state, private tfvars, provider cache and .kilo files are ignored. It returned no matches (expected exit 1) for `.terraform.lock.hcl` and sanitized `.tfvars.example`. All original pages visibly identify themselves as drafts. Workflow: `.github/workflows/docs.yml`, pinned action commits and Node, Windows/Ubuntu matrix, read-only permissions, five-minute timeout.

The built-in checker is deliberately narrower than a full Markdown parser; inline Markdown paths/fragments are covered, reference-style and raw HTML links are not. External URLs are not fetched by the gating check. External link availability must be reviewed separately during content review; outages do not invalidate local links.
