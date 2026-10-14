# Production implementation roadmap

Version: 2026-09-29. Based on [current audit](current-audit.md), not the original placeholder-only baseline. This replaces the initial plan's sequencing. The fixes listed in the audit are implemented; remaining phases below are requirements and proposed work unless explicitly marked otherwise.

## Target, priorities and constraints

Target: a complete, tested Terraform learning guide delivered as GitHub-readable Markdown and an accessible static website. Labs stay separate from publishing. Maintainer assistant tooling stays optional and outside generated learner navigation. Publish no private state, plans, account details or project memory.

**Must Have** is a release gate for the stated scope. **Should Have** increases learning value but may be deferred with an owner and reason. **Future Enhancement** requires a separate business case and evidence plan. P0 means current integrity/release blocker; P1 is essential capability or safety; P2 is quality/depth; P3 is expansion. These are delivery priorities, not vulnerability scores.

Current assets: five reviewed lessons, seventeen drafts, a cloud-free root with four tests, local lifecycle and recovery harnesses, Node checkers, sanitized backend templates, optional engineering adapters, and newly expanded CI configuration. Do not rebuild working foundations or mistake existing uncommitted work for disposable files.

## Phase R0 — Discovery and remediation baseline

**Objective:** establish trustworthy scope and repair current integration failures. **Priority/category:** P0/P1, Must Have. **Scope:** working-tree audit, validators, README, CI wiring, bootstrap boundaries and status records. **Dependencies:** none. **Status:** local remediation performed in this review; see current audit for executed evidence.

**Tasks/subtasks:** R0.1 inventory product/tooling surfaces and preserve current edits; R0.2 reproduce broken checks and metadata inconsistencies; R0.3 correct existing checker/fixture defects with regression cases; R0.4 restore the guide entry point and clean installer packaging; R0.5 record remaining requirements without invented evidence.

**Deliverables:** current audit, updated code and tests, populated operations records, phase roadmap. **Validation:** docs and regression tests; local format/validate/native tests/lifecycle/recovery; bootstrap preservation/idempotence. **Risks:** broad uncommitted baseline obscures provenance; parser changes create false positives. **Mitigation/rollback:** inspect changed files individually; retain historical evidence; revert only this change's hunks or restore a separately captured patch, never reset the whole tree. **Definition of done:** confirmed regressions fixed, applicable checks pass, unresolved scope explicit and no cloud mutation performed.

## Phase R1 — Release contracts, ownership and reproducibility

**Objective:** make quality claims enforceable before expanding content. **Priority/category:** P1, Must Have. **Scope:** repository governance, compatibility, CI/security baseline and artifact boundaries. **Dependencies:** R0. **Suggested owner:** maintainer/QA with security reviewer. **Effort:** 3–5 engineering days.

**Tasks/subtasks:**

1. R1.1 Define supported OS/shell/CLI matrix in `docs/compatibility.md`; distinguish allowed Terraform constraints from tested versions. Test the existing baseline and select a current stable candidate using official release/security notes; evaluate Node support lifecycle rather than mass-upgrading blindly.
2. R1.2 Run the configured hosted checks on Windows/Ubuntu. Add workflow syntax validation and branch-required checks only after observing real job names. Confirm fork behavior and read-only permissions.
3. R1.3 Establish named code/content/security owners; verify private reporting and applicable repository protections. Add issue templates, changelog and evidence freshness rules; preserve legitimate draft contributions.
4. R1.4 Add pinned secret and dependency/workflow scanning with tested detection fixtures. Inspect historical secret exposure through an authorized private process. Never print suspected values into reports.
5. R1.5 Formalize lesson/example schema, disallow hidden runnable roots, and verify template exports remain separate from project records. Extend parser regressions only for documented supported Markdown constructs; reserve full rendered validation for R6.
6. R1.6 Save baseline test durations, build inputs, tool versions and a clean-checkout command sequence. Record third-party licenses/provenance for copied teaching patterns.

**Deliverables:** compatibility/evidence matrix, protection checklist with observed settings, CI results, owners and scanner configuration, clean-checkout runbook. **Sources/patterns:** copy existing `.github/workflows/docs.yml` permission/matrix structure, `scripts/check-examples.test.mjs` fixture pattern and `docs/content-standard.md`; read S3/S4 below before changing tasks or CLI behavior.

**Validation:** all required jobs pass on an actual PR; malformed inventory/unlisted root/synthetic secret each fails the correct check; fork job receives no cloud credentials; installer rerun preserves human files. **Risks:** scanner false positives, ecosystem drift, permissions changes disrupting contributors. **Mitigation/rollback:** narrow documented exceptions, pinned versions, trial branch before required gates; roll back a broken tool pin without waiving its underlying check. **Definition of done:** clean checkout reproduces results, accountability is assigned, hosted evidence exists and Must Have failures cannot silently pass.

## Phase R2 — State, security and environment safety

**Objective:** teach safe ownership and recovery before readers touch clouds. **Priority/category:** P1, Must Have. **Scope:** two state lessons, two security lessons, naming/workspace lessons, backend template documentation. **Dependencies:** R1. **Owner:** Terraform engineer + security reviewer. **Effort:** 5–8 days.

**Tasks/subtasks:**

1. R2.1 Complete six lesson contracts: explanations, prerequisites, examples, expected outcomes, exercise/rationale, failure cases, cleanup, references and limitations.
2. R2.2 Document and expose `check-state-recovery.mjs` as a disposable drill; explain state lineage/serial and address continuity, backup handling and recovery ownership.
3. R2.3 Add `examples/backends/README.md` with matching backend declarations, safe init commands, bootstrap prerequisites and identity separation. Review exact S3, AzureRM and GCS schemas against the chosen version. Teach supported lock semantics without treating all backends as equivalent.
4. R2.4 Add locking contention, migration, restore and interrupted-run scenarios. Isolate local fixtures; schedule real remote drills only in dedicated authorized scopes.
5. R2.5 Cover redaction versus persistence, short-lived identities, least privilege, plan/state retention, exposure response and nonproduction practice boundaries.
6. R2.6 Compare CLI workspaces, HCP workspaces, separate states and separate cloud accounts/projects/subscriptions. Define tagging/naming exceptions per provider.

**Deliverables:** six substantive lessons, backend runbook and templates, dated recovery evidence, access/cost checklist. **Sources/patterns:** existing local recovery harness, `examples/backends/*.hcl.example`, S5–S7 and backend-specific docs discovered before implementation.

**Validation:** local migration/restore preserves lineage, IDs and addresses; no-change plan after restore; concurrent remote operations demonstrate backend-specific locking; backups remain private; cleanup confirmed. **Risks:** incorrect state replacement, leaked artifacts, accidental production operations. **Mitigation/rollback:** capture protected snapshots, require known empty migration destination and stop writers; rollback only after lineage/serial and remote resources are inspected. Do not prescribe blind `state push -force` or restoring an old Git commit as infrastructure rollback. **Definition of done:** all six lessons reviewed, local drill reproducible, remote claims either demonstrated or explicitly limited; a remote-locking claim cannot pass on local evidence alone.

## Phase R3 — Modules and executable language depth

**Objective:** turn concepts into reusable tested configurations. **Priority/category:** P1 Must Have for modules; P2 Should Have for extended exercises. **Scope:** module lessons, child module/consumer, iteration and input design. **Dependencies:** R1 and R2 safety contract. **Owner:** Terraform engineer/content reviewer. **Effort:** 5–8 days.

**Tasks/subtasks:** R3.1 copy the standard module structure into an example with variables, outputs, requirements, README and tests; R3.2 build a consumer and register both roots/modules; R3.3 test invalid inputs, output contracts and compatible upgrades; R3.4 teach registry provenance, version constraints and root lockfile responsibilities; R3.5 add executable stable-key iteration and moved-address examples; R3.6 add provider alias wiring, precedence table, nullable/optional object guidance and checksum installation commands with shell variants.

**Deliverables:** reusable local module, runnable consumer, native tests, two completed module lessons and optional extended exercises. **Sources/patterns:** `examples/local-basics/tests/basics.tftest.hcl`, manifest/test fixture conventions, S1/S2 and official module structure reference in the initial plan.

**Validation:** all directories covered by manifest; tests demonstrate valid/invalid interfaces; refactor fixture preserves IDs and produces no unintended replacements; snippet sources agree with canonical files; no fixture auto-loads local private variables. **Risks:** abstractions hide core concepts; excessive duplication diverges; provider alias support is misrepresented. **Mitigation/rollback:** keep one small module and explicit caller; version interface changes; revert consumer/module together before release, or use documented moved blocks for existing state. **Definition of done:** module and consumer reproduce from clean checkout and lessons explain ownership rather than merely passing validation.

## Phase R4 — Three cloud labs and integration evidence

**Objective:** provide a small, proven AWS/Azure/GCP learning path. **Priority/category:** P1, Must Have for multi-cloud release. **Scope:** three independent roots and provider-specific guides; remote backend drills. **Dependencies:** R2–R3, disposable cloud scopes, budget owner and approved execution access. **Owner:** provider engineer per cloud + independent reviewer. **Effort:** 8–12 days excluding access delays.

**Tasks/subtasks:**

1. R4.1 Select one low-complexity resource scenario per cloud. Read exact provider schemas, authentication and service limits; pin tested CLI/provider versions and root lockfiles.
2. R4.2 Document account/project/subscription, region, federation/local login, narrow permissions, unique names/tags and quota checks. Separate backend setup from application resources.
3. R4.3 Add sanitized input examples, expected plan summary, output assertions, failure diagnosis and cost drivers; identify residual storage/log/network charges. Set a per-run cost/time cap with the account owner.
4. R4.4 Add separate trusted integration workflows with OIDC where supported; serialize by state key; review plan for intended commit/environment and expiry. Do not grant fork code cloud access.
5. R4.5 Exercise create/change/no-change/destroy and cleanup after intentional failure. Inventory leftovers and record provider/region/date plus sanitized evidence.

**Deliverables:** three complete labs, verified permission requirements, integration fixtures, live evidence and cleanup checklist. **Sources/patterns:** local lab README/test layout, R2 backend docs, S8 and official Registry/cloud docs chosen before resource coding. No guessed IAM roles or arguments.

**Validation:** static/native checks plus authorized live plan/apply/assert/destroy; zero unexpected leftovers; rejected unauthorized action behaves as documented; each cloud tested independently. **Risks:** spending, quota failures, eventual consistency, credentials and destructive cleanup. **Mitigation/rollback:** unique ownership tags, isolated scopes, capped jobs, retry bounded reads only; preserve failed state for recovery; resource-specific reviewed cleanup, never broad account deletion. **Definition of done:** dated live evidence for all claimed clouds, residue checks and cost owner signoff. Lack of access is a blocker for live claims, not a passing result.

## Phase R5 — Delivery, troubleshooting and operating depth

**Objective:** close remaining original topics and teach safe changes over time. **Priority/category:** P1 Must Have; advanced policy engines are Should Have. **Scope:** testing, GitHub/Azure pipelines, provisioners, imports/drift/upgrades and HCP introduction. **Dependencies:** R2–R4; local-only portions can start after R3. **Owner:** DevOps/SRE + technical writer. **Effort:** 6–10 days.

**Tasks/subtasks:** R5.1 complete native test/validate/plan guidance and add Terratest only for an external assertion worth its Go toolchain; R5.2 provide verified pipeline templates with review/environment gates, concurrency, short-lived auth and sensitive artifact retention; R5.3 add import/moved/drift/upgrade fixtures and symptom-to-recovery troubleshooting; R5.4 complete provisioner lessons with image/cloud-init alternatives and narrowly scoped connection examples; R5.5 add HCP workspace/run/policy concepts and explain limits of local equivalents; R5.6 cover interruption, timeout and failed-destroy reporting, ensuring fixtures are retained when cleanup cannot finish.

**Deliverables:** completed remaining original lessons, operations exercises, pipeline examples, failure evidence and optional policy checks. **Sources/patterns:** existing lifecycle/recovery harnesses and S1/S3/S5/S8/S9; consult Azure Pipelines and Terratest primary docs for actual task signatures and cleanup behavior.

**Validation:** intentional failures produce correct exit codes; expired/stale plan is rejected; untrusted PR cannot access secrets; refactoring avoids unintended replacement; drift is detected; cleanup failure reports a recoverable location. **Risks:** copied pipeline privilege escalation, sensitive logs, relying on provisioners as standard configuration management. **Mitigation/rollback:** least privilege, restricted artifact access/expiry, nonproduction fixtures, promotion gates; revert pipeline/template changes separately from cloud state and re-plan before recovery. **Definition of done:** all 21 original lessons substantive and reviewed, every executable teaching claim backed by an appropriate test, and no unresolved Must Have safety gaps.

## Phase R6 — Static publishing, accessibility and performance

**Objective:** make the guide easy to navigate, search and operate at public-read scale. **Priority/category:** P1 Must Have for the new site; extra interaction P2 Should Have. **Scope:** site architecture, build, hosting, search, accessibility, deployment/rollback. **Dependencies:** R1; prototype after R3, publish after R5. **Owner:** documentation/frontend engineer + accessibility reviewer. **Effort:** 5–8 days.

**Tasks/subtasks:**

1. R6.1 Evaluate a maintained static generator against Markdown preservation, offline/static search, keyboard accessibility, dependency/license cost and deterministic builds; record an ADR before adopting it. Use S10 only as a candidate, rechecking maintenance at implementation.
2. R6.2 Create an explicit content allowlist from lesson inventory plus approved learner reference pages. Exclude adapters, templates, project memory, private/generated artifacts and internal review docs. Avoid glob-publishing the repository.
3. R6.3 Add navigation, search, breadcrumbs, on-page contents, code copy, responsive layouts, descriptive diagrams/alt text, 404, source links and review metadata. Keep draft pages absent from complete learning paths or clearly labeled.
4. R6.4 Add deterministic staging, strict build and rendered path/anchor checks. Preserve old links through documented redirects; verify canonical URLs/sitemap/robots settings only after the public hostname is selected.
5. R6.5 Build once and promote the same versioned artifact to staging/production. Choose a static host/CDN with TLS, deployment history, correct cache rules and supported security headers. Configure custom DNS only after ownership is known.
6. R6.6 Measure mobile page/search/build performance and accessibility. Proposed release budgets: representative mobile LCP ≤2.5 s, CLS ≤0.1, useful search ≤1 s on the agreed test profile, cold build ≤2 min for the initial corpus. Set asset budgets from measured template output; revise with documented rationale rather than claiming unmeasured compliance.

**Deliverables:** site ADR, pinned build/dependencies, preview artifact, search, accessibility report, performance baseline and deployment/rollback runbook. **Sources/patterns:** current Markdown contracts and S10 plus selected generator/host official configuration and accessibility guidance before implementation.

**Validation:** all learner pages reachable, links/anchors pass after rendering, top search queries find expected lessons, keyboard/focus/zoom/mobile checks pass, automated serious/critical accessibility findings resolved, no excluded files in artifact. Compare artifact digest across promotion. **Risks:** source duplication, inaccessible theme widgets, accidental private-file publication, stale caches. **Mitigation/rollback:** allowlist, source-of-truth staging, manual accessibility review; restore last known-good artifact and invalidate relevant cache paths. **Definition of done:** staging passes functional/accessibility/performance gates and rollback drill; production publication separately authorized, with hostname/TLS/probes verified.

## Phase R7 — Production readiness and release verification

**Objective:** demonstrate the target state and establish sustainable operation. **Priority/category:** P1, Must Have. **Scope:** all product surfaces, hosted checks, release evidence, ownership and incident response. **Dependencies:** R1–R6. **Owner:** release maintainer + independent QA/security reviewers. **Effort:** 4–6 days.

**Tasks/subtasks:** R7.1 trace every Must Have gap to evidence and owner; R7.2 run clean-checkout declared OS/CLI matrix and review source documentation for changed APIs; R7.3 have a reader independently complete beginner path and each cloud lab; R7.4 produce changelog, versioned artifact/checksum, dependency/license inventory and known limitations; R7.5 configure scheduled link/build/security checks, public uptime/search smoke probes and actionable ownership; R7.6 rehearse incident containment, site rollback, backup restore and failed cloud cleanup; R7.7 approve release then perform a post-publish smoke check and handoff.

**Deliverables:** signed readiness checklist, release manifest, evidence bundle, runbooks, owners and support policy. **Validation:** all 22 current lessons plus any additions registered/reviewed, zero generic placeholders, every example tested in its stated class, no unresolved critical/high security defects, fresh cloud cleanup evidence, successful hosted matrix, site gates pass. Proposed operating objectives: rollback to prior static artifact within 30 minutes, rebuild from source within one working day, no lost committed source; verify in a drill before calling them achieved SLAs.

**Risks:** release pressure hides missing evidence; checks pass while learner flow fails; maintenance ownership lapses. **Mitigation/rollback:** explicit no-go checklist, independent review, assign owner/back-up, retain last two verified artifacts and immutable release metadata. **Definition of done:** release claims match evidence, deployment checks pass, owners accept operations, rollback is proven and no Must Have gap remains open for the published scope.

## Phase R8 — Learning and ecosystem enhancements

**Objective:** expand based on demonstrated learner needs. **Priority/category:** P2 Should Have and P3 Future Enhancement. **Scope:** assessments, catalog, optional progress, advanced tracks. **Dependencies:** R7 stable release and feedback. **Owner:** product/content maintainer. **Effort:** 3–6 days for one bounded enhancement; estimate advanced tracks separately.

**Tasks/subtasks:** Should Have: R8.1 catalog with difficulty/cloud/cost filters when there are enough labs; R8.2 capstone rubric and explained quizzes; R8.3 printable/offline reference and accessible diagrams. Future Enhancement: R8.4 browser-local progress with reset/export and privacy review; R8.5 separately validated OpenTofu/Terragrunt/Kubernetes/enterprise tracks; R8.6 translations with named review owners; R8.7 evaluate hosted sandbox or AI assistance only with an explicit demand, threat model, cost cap and operations team.

**Deliverables:** independently scoped feature ADRs, learning artifacts, measurements and tests. **Validation:** learner completion improves against recorded baseline; keyboard/assistive-tech behavior holds; no sensitive data stored in progress; advanced compatibility claims have their own matrix. **Risks:** scope creep, stale translations, misleading certification, hosted execution abuse. **Mitigation/rollback:** one feature at a time, feature flag/removable static pages, separate release tracks, avoid accounts/backend unless justified. **Definition of done:** chosen feature meets its own acceptance evidence without degrading core release gates; deferred features retain owner/reason and are not implied complete.

## Architecture and infrastructure

| Layer | Target design | Boundary and scaling strategy |
| --- | --- | --- |
| Source | Canonical Markdown + schemas + executable examples | One authoring source; explicit content allowlist |
| Verification | Node checks + Terraform native tests + selective integration | Independent per-root jobs; bounded concurrency; no credentials for PR jobs |
| Artifacts | Versioned static site and sanitized evidence | Build once; immutable release IDs/checksums; restricted sensitive artifacts |
| Serving | Static host/CDN with TLS | Public read traffic scales through CDN; no app server/database |
| Cloud labs | Dedicated disposable scopes and state | Short-lived identity, state-key concurrency, budgets and cleanup |
| Assistant tooling | Core/adapters plus clean templates | Never included in learner site; policy is not an enforcement sandbox |
| Operations | Scheduled checks, probes, owners and retained artifacts | Distinguish uptime, build failures, broken links and lab failures |

## Sequencing, release gates and estimates

R0 → R1 → R2 → R3 → R4 → R5 → R6 → R7 → optional R8. Site prototyping and local R5 fixtures may overlap after their prerequisite contracts, but complete-guide publication waits for all Must Have evidence. Work must not concurrently edit the same files without coordination.

| Milestone | Exit gate | Incremental estimate |
| --- | --- | --- |
| M0: repaired baseline | R0 results recorded | Current review |
| M1: trustworthy foundations | R1–R2, hosted checks and safety lessons | 8–13 days |
| M2: complete executable guide | R3–R5, modules and three live labs | 19–30 days |
| M3: production documentation product | R6–R7, site and readiness evidence | 9–14 days |
| M4: measured enhancements | Selected R8 feature | 3–6 days each |

Remaining core estimate: 36–57 focused engineering days for one experienced contributor, excluding access/review delays and advanced expansions. Re-estimate after R2; these are planning ranges, not calendar promises.

## Cross-cutting test and risk controls

| Test level | Required evidence | Failure action |
| --- | --- | --- |
| Documentation/schema | Paths, anchors, dates, inventories, no reviewed drafts | Stop merge; fix source/schema |
| Tooling unit | Malformed/traversing input, zero-test roots, artifact exclusion, bootstrap preservation | Stop merge; preserve failing fixture reproduction |
| Terraform static | Format, init, validate, pinned constraints/locks | Diagnose config/provider incompatibility; no apply |
| Local/native | Valid/invalid inputs, no-change/changed exit codes, lifecycle and recovery | Retain recoverable state when cleanup fails |
| Cloud integration | Scoped identity, authorized plan/apply/assert/destroy and leftovers | Stop later jobs; alert owner; bounded cleanup with retained state |
| Site UX | Rendered links, search, navigation, mobile and accessibility | Block promotion or roll back artifact |
| Security/supply chain | Synthetic scanner fixture, action pins, provenance, permissions, artifact retention | Triage and block material unresolved defects |
| Release/operations | Clean checkout, hosted matrix, independent reader, rollback/restore drill | No-go until evidence exists or scope is honestly reduced |

No percentage test-coverage target substitutes for these behaviors. Do not disable checks to meet a date. Use short, bounded test jobs and preserve failure evidence without logging secret contents.

## Documentation discovery and allowed interfaces

Read these primary sources before implementing their phases; check version-specific pages again when code is written. No existing mock, pipeline or backend setting is permitted solely because it looks plausible.

| Ref | Source/pattern | Allowed use and limits |
| --- | --- | --- |
| S1 | [Terraform tests](https://developer.hashicorp.com/terraform/language/tests) and [JSON test summary](https://developer.hashicorp.com/terraform/internals/machine-readable-ui#test-summary) | `run`, `command`, assertions and test files; default apply may create real infrastructure; verify nonzero passing runs |
| S2 | [terraform_data](https://developer.hashicorp.com/terraform/language/resources/terraform-data) | Existing local `input`/`output` pattern; no cloud service behavior implied |
| S3 | [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use) | Pin actions, restrict token/secret exposure, treat PR code as untrusted |
| S4 | [Node test runner](https://nodejs.org/api/test.html) | Built-in `node:test`/assert, test isolation and exit behavior |
| S5 | [Sensitive data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data) | Distinguish redaction and persistence; version-check ephemeral/write-only features |
| S6 | [S3 backend](https://developer.hashicorp.com/terraform/language/backend/s3) | Read locking/permissions and supported arguments; use matching version |
| S7 | [State CLI](https://developer.hashicorp.com/terraform/cli/commands/state) | Read subcommand safety semantics before recovery/migration commands |
| S8 | [GitHub OIDC](https://docs.github.com/en/actions/concepts/security/openid-connect) | Federation requires cloud-side scoped trust; no fork privileges by implication |
| S9 | [Provisioners](https://developer.hashicorp.com/terraform/language/provisioners) | Alternatives and limitations before any connection example |
| S10 | [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/getting-started/) | Candidate only; dependency/theme/maintenance decision belongs to R6 |
| S11 | [setup-terraform](https://github.com/hashicorp/setup-terraform) and [verified v3.1.2 commit](https://github.com/hashicorp/setup-terraform/commit/b9cd54a3c349d3f38e8881555d616ced269862dd) | `terraform_version`, `terraform_wrapper: false` for direct subprocess execution |

## Decisions needed at their dependency gates

Maintainer identity and back-up; supported OS/CLI matrix; cloud test scopes and per-run budgets; static host/domain; evidence/plan retention; release naming; support response commitments. Default to a static public guide and cloud-free PR checks. These decisions do not block local content/checker work, but live execution and production publication cannot be represented as verified before access and authorization exist.
