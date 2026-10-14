# Phased implementation plan

Historical initial plan. The [current production roadmap](docs/production-roadmap.md) supersedes sequencing and status below while retaining this discovery record.

Prepared 2026-09-28 against `113baa4`. See [audit evidence](AUDIT.md).

Status: Phase 0 repository discovery completed; implementation phases are proposed. The user requested an audit and plan. This document does not represent authorization to create paid infrastructure or publish externally.

## Execution contract

Execute phases in order unless a dependency below explicitly permits separation. Each phase should be a reviewable change with its verification evidence. Start each implementation session by reading this plan, the relevant source documentation, current repository instructions and the current diff. Re-check dependency versions and APIs at implementation time. Do not overwrite unrelated work.

Every lesson must contain objectives, prerequisites, explanation, linked runnable example where applicable, shell-labeled commands, expected results, exercise and solution rationale, troubleshooting, cleanup where applicable, references, tested versions and review date. Reference-only pages can omit an executable lab if they explain that choice.

Every lab must declare whether it uses cloud credentials or creates billable resources. A successful static check does not prove deployment behavior. Keep local, mocked, credentialed plan and live integration checks distinct in reports.

## Phase 0 — Documentation discovery and baseline

Completed: read all 23 tracked files, inspected file inventory/history, and confirmed 21 placeholder topic pages and absence of implementation/build assets. There are no existing copy-ready HCL or workflow patterns in this repository.

Primary references consulted on the audit date:

| ID | Source and section to read | Allowed pattern / purpose |
|---|---|---|
| D1 | [Terraform file structure](https://developer.hashicorp.com/terraform/language/files), configuration organization | Root and child module boundaries; `.tf` files |
| D2 | [Terraform style](https://developer.hashicorp.com/terraform/language/style), version constraints and layout | Documented requirements and consistent HCL |
| D3 | [Module development](https://developer.hashicorp.com/terraform/language/modules/develop) and [standard structure](https://developer.hashicorp.com/terraform/language/modules/develop/structure) | Module interfaces and directory layout |
| D4 | [Terraform test command](https://developer.hashicorp.com/terraform/cli/commands/test), Usage, example layout and cleanup | `terraform test [options]`, `tests/*.tftest.hcl`, explicit test classification |
| D5 | [Sensitive data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data) | Distinguish redaction from storage; version-aware ephemeral/write-only coverage |
| D6 | [S3 backend](https://developer.hashicorp.com/terraform/language/backend/s3), locking and permissions | Documented backend arguments such as `use_lockfile = true`; version-check examples |
| D7 | [Provisioners](https://developer.hashicorp.com/terraform/language/provisioners), alternatives and limitations | Constrain provisioner lessons and teach alternatives first |
| D8 | [GitHub OIDC](https://docs.github.com/en/actions/concepts/security/openid-connect) | Federated job identity; cloud-side trust configuration |
| D9 | [Material for MkDocs installation](https://squidfunk.github.io/mkdocs-material/getting-started/) | Candidate documentation dependency and setup |

This is the initial allowed-interface list, not evidence that provider examples have been validated. Before their phases, open the selected Terraform CLI version's command references, official provider resource schemas, cloud identity documentation, Azure Pipelines task documentation, testing-tool docs and site configuration docs. Record exact versions and links in `docs/compatibility.md`. Never invent provider arguments, pipeline tasks or plugin options.

Verification: the inventory is reproducible with `git ls-files`; placeholder text is discoverable with `rg -n 'This section provides guidance'` restricted to the original topic directories. No application test result is claimed.

## Phase 1 — Honest scope and repository safeguards

Priority P0/P1. Depends on Phase 0. Estimated effort: 2–3 focused engineering days.

Implement:

- Update README status, direct topic links, intended audience and staged roadmap. Mark incomplete topics clearly.
- Add `CONTRIBUTING.md`, `SECURITY.md`, a PR template, ownership conventions, `docs/content-standard.md`, `docs/compatibility.md` and a full intended license after confirming attribution.
- Add root ignore patterns for state, plan artifacts, `.terraform/`, local credentials and private variable files. Preserve intentional sanitized `.tfvars.example` files and the documented lockfile policy.
- Establish pinned documentation lint/link tooling and a minimal CI workflow. Fail on broken local links; report external-link instability separately. Exclude local tool worktrees and generated output from discovery.
- Introduce an explicit lesson inventory/status file so draft pages cannot count as completed content.

References: README, LICENSE, audit A01–A03/A09/A14; copy version-policy conventions from D2 after reading it. Read selected linter and CI tool documentation before writing configuration.

Verification: fresh checkout can run documented checks; a deliberately broken internal link fails in a disposable verification change; ignore rules exclude representative state/secret artifacts but retain intended sample and lock files; README claims agree with inventory.

Guards: do not invent copyright ownership; do not ignore every lockfile; do not add badges claiming nonexistent checks or readiness. Existing drafts are allowed only when explicitly labeled.

## Phase 2 — Complete beginner learning path

Priority P0/P1. Depends on Phase 1. Estimated effort: 5–8 days.

Implement:

- Replace the two basics and two core-concepts placeholders; add focused lessons for expressions, locals, data sources, dependencies, iteration and lifecycle where page size warrants it.
- Create `examples/local-basics/` using a documented cloud-free resource pattern, with version constraints, variables, outputs and cleanup. Copy syntax from the chosen resource's official documentation and record the reference.
- Add `examples/manifest.json` and a documented validator contract: enumerate explicit root directories, validate entries, return failure for an empty or missing inventory, and summarize every result.
- Add a beginner learning-path page, glossary, command reference, exercises, expected outputs and PowerShell/POSIX variants where syntax differs.

References: D1/D2, original `basics/*.md` and `core-concepts/*.md` line 3, plus the official resource/CLI documentation selected before coding. No existing placeholder sentence is an implementation template.

Verification: a clean environment completes init → plan → apply → output inspection → destroy without cloud credentials; documented results agree with actual output; supported shells are checked; input validation has both accepted and rejected cases; manifest covers every runnable root.

Guards: distinguish installation network access from cloud authentication; do not use hardcoded machine paths or claim every plan is side-effect-free/offline. Keep long explanations separate from runnable files to prevent snippet drift.

## Phase 3 — State, security and environment boundaries

Priority P1. Depends on Phase 2. Estimated effort: 4–6 days.

Implement:

- Complete both state pages, both security pages, and both best-practices pages.
- Add backend bootstrap/migration, locking/conflict, backup/restore and recovery runbooks using disposable fixtures. Separate backend credentials and provider credentials.
- Explain CLI workspaces versus HCP Terraform workspaces and use an environment-isolation decision table covering distinct identities, cloud scopes and state.
- Document least privilege, credential federation, plan/state artifact handling, secret redaction limits and credential-exposure response.
- Add sanitized backend templates for AWS/Azure/GCP only after reading each backend reference. Document S3 locking against the chosen version; do not copy old locking examples uncritically.

References: D5/D6; source pages under `state/`, `security/`, `best-practices/`; official backend references discovered for Azure/GCP in this phase.

Verification: migration and restore drills preserve the expected resource addresses; concurrent operations show expected lock behavior; examples contain no real credentials; documented access scope is reviewed; private artifacts do not enter published output.

Guards: `sensitive` is not a guarantee that values are absent from state. Never suggest blind force-unlock or routine manual state editing. Backend exercises must not operate on a reader's production state.

## Phase 4 — Modules and three cloud labs

Priority P1. Depends on Phases 2–3. Estimated effort: 8–12 days.

Implement:

- Complete both module lessons using D3's standard structure; create `examples/modules/` with documented inputs/outputs, composition, usage example and tests.
- Complete AWS, Azure and GCP pages and create independent `examples/aws/`, `examples/azure/` and `examples/gcp/` roots. Choose one small, low-cost resource scenario per provider after schema review.
- For each lab include account prerequisites, scoped authentication, region, resource naming, provider constraints, expected plan, output checks, cost drivers, cleanup and residual-resource verification.
- Add a lab comparison table and separate environment/bootstrap dependencies. Record tested versions, test date and credentialed execution evidence.

References: D2/D3; original `modules/*.md` and `cloud-providers/*.md` line 3. Required discovery: official Terraform Registry provider documentation for every chosen resource and cloud-vendor authentication docs. Pin actual tested versions rather than an assumed latest release.

Verification: format/validate every root; test module contracts; run apply/verify/destroy for each cloud in a disposable authorized environment; check for leftovers even after failures. Record static-only results explicitly if account access blocks live checks.

Guards: no embedded credentials, broad public access, administrator-by-default permissions, guaranteed-free claims or dependency on another cloud lab's state. Do not silently treat mocks as successful provider integration tests.

## Phase 5 — Automated validation and delivery examples

Priority P1. Static harness starts after Phase 2; final scope depends on Phases 3–4. Estimated effort: 5–8 days.

Implement:

- Complete validate/plan and Terratest pages; add a native Terraform test lesson based on D4's documented file layout.
- Build manifest-driven checks: format, backend-disabled initialization where appropriate, validation, lint, secret scanning and explicitly classified local/mocked tests. Initialization may still download dependencies.
- Add meaningful assertions for variables, outputs and module behavior. Add Terratest only for a concrete integration assertion that benefits from it.
- Complete GitHub Actions and Azure DevOps lessons with validated templates. Separate pull-request checks, credentialed plans and protected applies; use cloud federation where supported.
- Scope permissions, pin external actions/tools, serialize state-changing jobs, protect plan artifacts and set timeouts. Apply only the reviewed plan for the intended commit/environment; stale plans require a new plan and review.
- Add scheduled dependency checks and an optional live-test workflow with cleanup evidence and bounded cost.

References: D4/D8; original `testing/*.md` and `cicd/*.md` line 3. Read official CLI flag, Azure Pipelines task, cloud identity and selected test-tool documentation before implementation.

Verification: malformed HCL, invalid input and broken links fail their respective checks; fork PRs get no cloud credentials; local/mock jobs provision no cloud resources; protected jobs cannot bypass environment controls; failure paths report cleanup status. Test the actual templates, not just their YAML parsing.

Guards: `terraform test` may create real infrastructure. Plan-mode tests may still contact providers. Never expose credentials to untrusted fork code, publish unrestricted plan JSON, or equate `validate` with a deployability guarantee.

## Phase 6 — Operational depth and troubleshooting

Priority P2. Depends on Phases 3–5. Estimated effort: 5–8 days.

Implement:

- Add import, moved blocks/refactoring, drift detection, provider/CLI upgrades, lockfile updates and recovery walkthroughs with small fixtures.
- Add symptom → diagnosis → safe recovery troubleshooting for authentication, permissions, locks, version mismatches, dependency cycles and failed applies.
- Complete provisioner pages using D7's alternatives and limitations; show a narrow justified case only after safer alternatives.
- Add HCP Terraform concepts, run/review flow, policy-as-code and cost-management introductions. Keep service-specific examples separately versioned.

References: D7, original provisioner pages, tested examples from Phases 2–5. Before coding, read official import/moved/upgrade/workspace/HCP docs and record exact supported versions.

Verification: refactoring preserves resources where intended; import does not unexpectedly recreate the fixture; a drift scenario is detected; recovery instructions work from an intentionally broken disposable state; troubleshooting commands match the stated symptom.

Guards: no normal reliance on targeting, automatic destructive replacement, unrestricted SSH or provisioners as default configuration management. Explain blast radius and backups in state-changing runbooks.

## Phase 7 — Searchable and accessible documentation site

Priority P2. Depends on Phases 1–2; final navigation follows Phase 6. Estimated effort: 4–7 days.

Implement:

- Evaluate D9 against maintenance, accessibility, static search and dependency requirements; record the choice in `docs/decisions/001-docs-platform.md`.
- Add a reproducible pinned build, hierarchical navigation, search, learning paths, page contents, source/edit links, code copy, responsive layouts and metadata. Keep canonical lesson content in the existing directories and use a deterministic staging step if the generator requires a dedicated docs root.
- Keep drafts out of completed-lesson lists and search results, or label them unmistakably. Preserve old Markdown links and published URLs through redirects if needed.
- Add build previews and a release workflow for a selected static host. Publishing is a separate authorized execution step.

References: D9 and the selected generator's actual navigation/search/deployment configuration docs, to be read before coding; README and lesson inventory from Phase 1.

Verification: clean build succeeds with warnings treated appropriately; all lessons are reachable; search finds representative beginner and advanced queries; keyboard navigation/focus, contrast, headings and mobile widths pass review; no secrets/local worktrees enter the site. Establish and record a page-weight/build-time baseline before choosing regression budgets.

Guards: avoid maintaining duplicate lesson copies; no bespoke backend, reader accounts or analytics by default; no invented plugins. Do not call the site accessible solely because an automated scanner passes.

## Phase 8 — Learning features and final release verification

Priority P2/P3. Depends on Phases 1–7. Estimated effort: 4–7 days for release hardening; optional expansions estimated separately.

Implement:

- Add an example catalog with difficulty/cloud/cost filters if the available example count justifies filtering, plus a capstone rubric and quizzes with explanations.
- Consider optional browser-local progress, printable command sheets and architecture diagrams. Defer localization until canonical content is stable and a translation review process exists.
- Add content owners, changelog/release conventions, quarterly content reviews and dependency-update triage.
- Publish a release verification report against the audit's measurable targets; record unsupported platforms and unexecuted cloud checks honestly.

References: D1–D9, all phase verification evidence, lesson contract, compatibility matrix and chosen site documentation. Re-open primary sources for changed or uncertain behavior.

Verification: zero original placeholders; 21/21 original topics reviewed; every example manifest entry checked; all internal links work; tests and site build pass on the declared matrix; cloud cleanup evidence exists; no unresolved critical/high release blockers; representative readers complete the beginner path and a capstone. Review all implementation APIs against cited docs and search for prohibited artifact/credential patterns.

Guards: do not release on chapter count alone, award misleading certification, claim OpenTofu compatibility without testing, or add optional features at the expense of unfinished safety/content requirements.

## Milestones, ownership and sequencing

| Milestone | Included work | Exit condition | Suggested responsible role |
|---|---|---|---|
| M1: honest usable foundation | 0–2 | Accurate scope, checks, complete local walkthrough | Maintainer + technical writer |
| M2: dependable hands-on guide | 3–5 | State/security coverage, tested module and three cloud labs, CI | Terraform engineer + cloud reviewers |
| M3: complete-guide release | 6–8 | All original topics complete, operating guidance, site and release evidence | Maintainer + accessibility/content reviewers |

Estimates total approximately 37–59 focused engineering days for one experienced contributor, excluding review delays, cloud access provisioning, and optional expansions. These are planning ranges, not commitments. Re-estimate after the first complete lesson/lab. Static CI work can overlap content authoring after Phase 2; provider labs can be handled independently once their shared contracts exist.

## Decisions and risks to resolve during implementation

| Decision/risk | Default recommendation | Resolution point |
|---|---|---|
| Broad scope overwhelms completion | Finish local path, then one small lab per cloud | M1 review |
| Supported Terraform/provider versions | Choose explicit tested minimum and current supported stable versions; document exceptions | Phase 1, revisit Phase 4 |
| License attribution | Confirm holder; retain provenance of borrowed examples | Phase 1 |
| Cloud access and cost | Disposable dedicated scopes, modest labs, cleanup verification | Before live Phase 3/4 checks |
| CI host/repository settings | GitHub Actions for repository checks; Azure DevOps as a tested teaching template | Phase 5 |
| Site stack and hosting | Static generator; verify maintenance and host constraints first | Phase 7 |
| Version/content drift | One example source, manifest coverage, dated review and dependency automation | Every phase |
| Compatibility extensions | Separate OpenTofu/Terragrunt/enterprise tracks after core release | After M3 |

For each phase, finish by recording changed paths, source references, commands run, results, known gaps and the next dependency. A phase with missing live evidence remains explicitly partial; successful linting must not conceal it.
