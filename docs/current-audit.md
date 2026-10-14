# Current audit and remediation record

Review started 2026-09-29; local verification completed 2026-09-30. Scope: the working tree, including uncommitted guide implementation and the newly added engineering assistant layer. The historical baseline at `113baa4` is retained in [the initial audit](../AUDIT.md). Existing changes were preserved; no reset, commit, push, cloud deployment or publication was performed.

## Executive assessment

The project has a useful local learning foundation, but is not production-ready as a complete multi-cloud guide. Before this review there were 22 inventoried lessons: five reviewed and seventeen placeholder drafts; one runnable Terraform root, four native tests, no child modules, and a docs-only workflow. The README described a different product, the imported engineering tooling. The documentation gate failed on 24 role files. These integration regressions and checker defects are remediated below. Missing curriculum, live cloud evidence and publishing infrastructure remain explicit release work.

Production-ready means an accurately scoped, accessible, maintainable documentation product with reproducible labs and demonstrated cleanup. It does not mean every teaching example is a universal production infrastructure template. No application server, account database or Kubernetes cluster is needed to publish this product.

## Method and limits

Inspected root inventory, git status, lesson inventory, reviewed lessons and draft markers, example configurations/tests, scripts, workflows, backend templates, assistant adapters, bootstrap packaging and project records. Used independent read-only content and tooling reviews, targeted regression fixtures and local execution. Source links and allowed interfaces appear in [the roadmap](production-roadmap.md).

Unverified: hosted workflow results, branch protection, private reporting configuration, cloud identities/permissions, live backend locking, billable lab cleanup, actual CLI adapter execution, Linux/macOS learner walkthroughs, historical secret exposure and deployed site behavior. These limitations are not passing results.

## Issues fixed in this review

| ID | Priority | Evidence before remediation | Change and proof |
| --- | --- | --- | --- |
| F01 | Must Have / P0 | Root README introduced AI Engineering OS, with no learner checks | Restored Terraform entry point and navigation; preserved tooling documentation separately |
| F02 | Must Have / P0 | Documentation check reported 24 multiple-H1 errors | Normalized role titles and section hierarchy without weakening the gate |
| F03 | Must Have / P1 | Lesson checker accepted unsafe/incomplete records or crashed on malformed shapes | Added schema/type/path/file/date/evidence checks, reviewed-placeholder rejection and lesson coverage detection; negative regression fixtures |
| F04 | Should Have / P1 | Heading IDs collided; shorter fences ended longer fences; valid dot-prefixed paths failed | Corrected anchor allocation, delimiter matching and containment check; regression fixtures |
| F05 | Should Have / P1 | Explicit reference-style links were silently skipped | Validate full/collapsed references and reject undefined references; raw HTML/shortcut syntax remains outside checker coverage |
| F06 | Must Have / P1 | Local/mocked examples could pass without test files or actual runs | Require native test files and a nonzero passing JSON test summary; discover test setup Terraform directories; validate lesson realpaths; preserve fixtures if tests fail |
| F07 | Must Have / P1 | Verification copied implicit private variables and non-default state artifacts | Shared input filter excludes variable files, state, saved plans and provider cache; lifecycle uses same filter |
| F08 | Must Have / P1 | Workflow omitted manifest tests, native tests, lifecycle and recovery | Added credential-free Terraform job, both OS runners, pinned setup action and exact Terraform version; disabled persisted checkout credentials; hosted result pending |
| F09 | Should Have / P1 | Reviewed lessons linked Phase 1 evidence; inventory omitted validation metadata | Linked Phase 2 evidence, reconciled dates, separated editorial and execution classifications |
| F10 | Must Have / P1 | Bootstrap copied all guide docs, skipped directory contents, and had ambiguous recursive force-copy behavior | Shared per-file installer, clean templates, no overwrite, path/symlink preflight and bootstrap regression checks |
| F11 | Must Have / P1 | Gemini example had undocumented `safety` keys implying enforcement | Empty settings example; explicit distinction between written policy and actual CLI permissions |
| F12 | Should Have / P1 | Architecture/operations/security/project state were generic TBD templates | Populated project-specific records; retained reusable clean templates outside product content |

## Gap analysis and disposition

| Gap | Current state | Target/remediation | Category | Phase |
| --- | --- | --- | --- | --- |
| G01: incomplete curriculum | 17 original lessons are still drafts | Complete each lesson contract; no placeholders in complete-guide release | Must Have | R2–R5 |
| G02: state/backend safety | Local recovery harness and partial backend files only | Recovery runbook, backend bootstrap/locking/migration/access drills | Must Have | R2 |
| G03: module depth | No child module or module consumer | Tested module interface, constraints, source/provenance and usage | Must Have | R3 |
| G04: multi-cloud proof | No runnable AWS/Azure/GCP lab | One bounded lab per cloud, auth, cost, output and residue verification | Must Have | R4 |
| G05: CI trust and hosted proof | New jobs configured, not run remotely | Required hosted checks; trusted cloud jobs and artifact governance | Must Have | R1, R4, R5 |
| G06: lesson metadata meaning | Structural metadata now enforced | Independent editorial signoff; evidence freshness and outcome review | Must Have | R1, R7 |
| G07: content delivery | GitHub Markdown only | Static build, search, navigation, accessibility, hosting and rollback | Must Have for published site | R6 |
| G08: supply-chain/security checks | Pinned actions and hygiene; no comprehensive scanner/history audit | Secret scanning, dependency triage, workflow review and private reporting verification | Must Have | R1, R5 |
| G09: operational depth | No import/drift/upgrade tutorials | Reproducible failure, identity migration and recovery fixtures | Must Have | R5 |
| G10: platform compatibility | Local Windows evidence only; broad allowed CLI range | Test minimum and selected current stable CLI; report OS/tool matrix truthfully | Must Have | R1, R7 |
| G11: link parser completeness | Limited dependency-free parser | Rendered-link/anchor check at site build; explicit supported source syntax | Must Have for site | R6 |
| G12: maintainability | Assistant layer and product share repository | Package boundaries, one source of truth, owners, updates and release discipline | Must Have | R1, R7 |
| G13: teaching depth | Iteration and provider alias guidance not executable | Address migration, aliases, precedence and optional-input exercises | Should Have | R3, R5 |
| G14: learner features | No assessments or catalog UI | Explained quizzes, capstone, catalog/filtering as useful | Should Have | R8 |
| G15: advanced platforms | No validated compatibility tracks | OpenTofu/Terragrunt/Kubernetes/enterprise tracks as separate releases | Future Enhancement | R8 |
| G16: performance/reliability evidence | No site or real traffic baseline | Build and page budgets, probes, release artifacts and rollback drill | Must Have for site | R6–R7 |

These items are addressed by remediation tasks, not all implemented in this review. A full guide cannot be honestly marked complete while G01–G10 remain open. No cloud access or stakeholder approval is inferred from a local test pass.

## Verification record

Initial verification found 24 documentation errors; the original 18 checker regression tests passed. Expanded checks and executed results appear below. Terraform baseline remains 1.14.8, Node 26.10.0, Windows amd64. The workflow sets the same versions but remote execution is unverified.

Executed after remediation:

| Command | Observed result |
| --- | --- |
| `node scripts/check-docs.mjs` | 119 Markdown files; zero errors |
| `node --test scripts/check-docs.test.mjs` | 21 passed |
| `node --test scripts/check-examples.test.mjs` | 15 passed, including zero-run rejection and regular lesson-file validation |
| `node --test scripts/bootstrap.test.mjs` | 5 passed; preservation, directory fill, clean template export, idempotence, overlapping paths, source/destination links and non-directory parent refusal |
| `node scripts/check-examples.mjs` | One root passed format, backend-disabled init, validate and four actual native test runs |
| `node scripts/check-local-lifecycle.mjs` | Saved-plan apply, outputs, unchanged/changed/invalid exit codes, destroy and empty state passed |
| `node scripts/check-state-recovery.mjs` | Address/lineage/IDs preserved through migration and loss/restore; no-change plan and cleanup passed |
| `git diff --check` | No whitespace errors in tracked diff; Git emitted line-ending conversion notices |

Isolated Node/Terraform subprocess execution initially hit sandbox EPERM; approved executions passed. The wrapper scripts and actual Claude/Gemini sessions are not claimed tested by the shared installer unit test. Hosted CI and live cloud operations remain unverified.

Independent read-only review prompted final fixes for regular-file/realpath lesson validation, zero-run test rejection and installer negative cases. The resulting regression total is 41 passing tests. Native run-count validation uses the documented [Terraform JSON test summary](https://developer.hashicorp.com/terraform/internals/machine-readable-ui#test-summary), verified with the local Terraform baseline. Shell bootstrap output is normalized to LF and protected by `.gitattributes`.

## Newly clarified requirements

- Keep a separate production-site acceptance gate and per-lab safety gate; a working website cannot prove cloud examples work.
- Track requirements through gap ID → phase task → changed path → evidence → owner signoff. A generic maintainer role must resolve to an accountable person before release.
- Treat assistant policies as guidance unless the actual tool enforces them; do not advertise fictional permission settings.
- Do not export this project's populated memory into other projects. Bootstrap templates are a separate distribution surface.
- Test cleanup failure paths and retain recoverable state; distinguish artifact filtering from isolation of malicious code.
- Require a release rollback exercise and documented expiry/retention of sensitive cloud plans before any live automation.

See the [roadmap](production-roadmap.md) for phase-level scope, tasks, risks and definitions of done.
