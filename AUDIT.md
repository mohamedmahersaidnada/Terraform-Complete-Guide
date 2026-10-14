# Repository audit

Historical baseline only (2026-09-28). See the [current audit](docs/current-audit.md) for subsequent implementation, integration regressions and remediation status.

Audit date: 2026-09-28. Baseline: `113baa4`.

## Outcome

Terraform Complete Guide is an early documentation scaffold. The folder taxonomy is useful, but none of the 21 topic pages contains substantive teaching material. Completing and validating the content is the highest-value investment. A website can improve delivery after a useful learning path exists.

This audit and the [implementation plan](IMPLEMENTATION-PLAN.md) propose work; they do not claim that the proposed features have been implemented.

## Scope and evidence

Reviewed every tracked file at the baseline: README, LICENSE, and 21 topic Markdown files across 10 directories. Inspected the root inventory, tracked-file list, working-tree status, and recent commit history. Consulted current primary documentation listed in the plan. The initial working tree was clean.

Every topic page has a heading at line 1 and a generic self-referential sentence at line 3. There are no tracked `.tf` files, tests, dependency manifests, build scripts, CI workflows, or website configuration. The local `.kilo/worktrees` directory is tooling workspace material and was excluded from the product baseline.

No build or application test could be run because none exists. No cloud resources were provisioned. GitHub repository settings, deployed sites, account permissions, historical secret exposure, and external issue backlogs were not inspected. This is a complete current tracked-file audit, not a cloud penetration test or certification of production readiness.

## Findings and priority

Priority describes delivery order and impact, not a vulnerability score. P0 blocks an honest usable guide; P1 is required for a dependable first release; P2 improves learning and delivery; P3 is optional expansion.

| ID | Priority | Finding and evidence | Recommended action | Phase |
|---|---|---|---|---|
| A01 | P0 | All 21 topic pages are placeholders at line 3 | Replace them with reviewed lessons and measurable completion criteria | 1–6 |
| A02 | P0 | README lines 4 and 28–32 describe comprehensive coverage without supporting content | State development status and distinguish available lessons from planned topics | 1 |
| A03 | P1 | LICENSE line 1 is only a one-line MIT assertion, without the full license text | Verify intended copyright holder and use the complete intended license | 1 |
| A04 | P1 | No runnable Terraform configurations or supported-version policy | Add versioned, independently runnable examples and a compatibility matrix | 2–4 |
| A05 | P1 | Both security pages and both state pages contain no guidance | Teach credentials, state sensitivity, isolation, locking, backup and recovery | 3 |
| A06 | P1 | Both testing pages are placeholders; no automated checks exist | Add documentation checks, per-example validation, and meaningful native tests | 1–5 |
| A07 | P1 | Both CI/CD pages are placeholders; no workflows exist | Separate untrusted validation from protected cloud execution | 5 |
| A08 | P1 | AWS, Azure and GCP pages have no prerequisites, deployment or cleanup instructions | Deliver small independent cloud labs with verified teardown | 4 |
| A09 | P1 | No root `.gitignore` or contribution/security process is tracked | Prevent accidental state/credential commits and document review rules | 1 |
| A10 | P2 | README folder table is plain text; topic pages have no prerequisite or next-lesson links | Add learning paths, glossary, progression and direct navigation | 2, 7 |
| A11 | P2 | Syntax, provider, variable and module pages have no examples or exercises | Add validated HCL examples, tasks, expected outcomes and answer explanations | 2, 4 |
| A12 | P2 | Naming/workspace pages are placeholders; no operating runbooks | Add environment decisions, drift/import/refactoring, upgrade and recovery guidance | 3, 6 |
| A13 | P2 | No site, search, responsive UI or accessible navigation implementation exists | Add a static documentation site with keyboard/mobile verification | 7 |
| A14 | P2 | No content maintenance or release policy | Add owners, review dates, update checks and release gates | 1, 8 |
| A15 | P3 | No assessments, capstones or advanced platform tracks | Add learning features after core content passes its gates | 8 |

These are primarily missing capabilities. There is no runnable code here from which to establish an exploitable implementation defect, runtime performance regression, or unsafe deployed configuration.

## Coverage map

All existing entries below have the same verified condition: placeholder-only, with evidence at line 3 of each named file.

| Existing files | Required scope |
|---|---|
| `basics/intro-and-installation.md`, `basics/file-structure-and-syntax.md` | IaC model; Windows/macOS/Linux setup; shell differences; installation verification; init/plan/apply/destroy; file layout and HCL syntax |
| `core-concepts/providers-and-resources.md`, `core-concepts/variables-and-outputs.md` | Version requirements; provider aliases; dependency graph; resources/data sources; types; validation; locals; outputs; expressions; iteration and lifecycle |
| `state/state-management.md`, `state/remote-backends.md` | State sensitivity and access; backend bootstrap; locking; migration; backup/restore; import; drift; safe recovery |
| `modules/creating-modules.md`, `modules/module-registry.md` | Standard structure; interfaces; composition; examples; source/version constraints; provenance; testing and release compatibility |
| `provisioners/local-and-remote-exec.md`, `provisioners/file-and-connection.md` | Limitations; alternatives; connection security; failure and destroy behavior; narrow justified examples |
| `cloud-providers/terraform-on-aws.md`, `terraform-on-azure.md`, `terraform-on-gcp.md` in that directory | Authentication; scope/region; permissions; provider versions; a small lab; verification; cost drivers; cleanup and residual-resource checks |
| `security/secrets-management.md`, `security/iam-and-policies.md` | Sensitive versus persisted data; federation; least privilege; artifact handling; policy examples and response to credential exposure |
| `testing/terraform-validate-and-plan.md`, `testing/terratest.md` | What each check proves; native tests; mocked versus live coverage; integration testing; cleanup on failure |
| `cicd/github-actions.md`, `cicd/azure-devops.md` | Validate/plan/apply stages; identity; review gates; concurrency; artifact access; failure handling |
| `best-practices/naming-conventions.md`, `best-practices/workspace-strategy.md` | Naming/tagging with cloud-specific restrictions; CLI versus HCP workspaces; account/project/subscription and state isolation decisions |

Add dedicated coverage for troubleshooting, dependency lock files, version upgrades, imports and moved blocks, drift, policy checks, cost management, HCP Terraform, and operational recovery. Treat OpenTofu compatibility, Terragrunt, Kubernetes and advanced enterprise platforms as separately scoped extensions with their own validation.

## Product and architecture recommendations

1. Keep Markdown and executable examples as the source of truth. Preserve existing topic paths while expanding their content.
2. Start with a cloud-free walkthrough. Readers should achieve a successful plan/apply/verify/destroy cycle without acquiring cloud credentials.
3. Store runnable root configurations under `examples/`; keep prose under the existing topic directories. Give every example a README, requirements, expected behavior and cleanup instructions.
4. Maintain a small example manifest containing path, lesson, runtime/version requirements, test class and cost classification. Use it to drive checks and coverage reporting so an example cannot silently escape validation.
5. Prefer native Terraform tests first. Add Terratest where external integration assertions justify maintaining Go dependencies.
6. Use a static documentation generator. Material for MkDocs is a candidate, not a settled dependency: evaluate its maintenance status, supported versions, accessibility and extension requirements in Phase 7 before locking it in.
7. Add search, responsive navigation, code copy, learning paths and page source links. Defer accounts, hosted execution, databases, AI chat and complex progress synchronization until a demonstrated user need justifies their operational cost.
8. Make quizzes and capstones explain reasoning. Optional local progress must have reset controls and must never be presented as proof of proficiency.

## Release targets

| Metric | Baseline | First complete-guide release target |
|---|---|---|
| Substantive original topic pages | 0/21 | 21/21 reviewed; zero generic placeholders |
| Runnable examples | 0 | Local foundation, reusable module, and one lab per cloud |
| Example validation coverage | No suite | Every manifest entry validated on the declared supported matrix |
| Cloud execution evidence | None | Dated apply/verify/cleanup evidence for each lab in a disposable environment |
| Documentation navigation | Folder names only | All lessons reachable; no broken internal paths/anchors |
| Quality automation | None | Required documentation, Terraform and secret checks |
| Site quality | No site | Search smoke tests, keyboard/mobile review, no serious known accessibility defects |
| Maintenance | No policy | Named ownership, review dates and a repeatable release checklist |

The recommended next deliverable is Phase 1 followed by a complete beginner path in Phase 2. Do not market the project as complete while publishing unreviewed topic placeholders.
