# Environment audit

Baseline review: 2026-10-05, local working tree. Scope: repository architecture, validation automation, dependencies, security policy and release evidence. Cloud runtime and hosted account configuration are not established by this review. See [evidence](r1-evidence.md) and [execution tracking](execution-progress.json).

## Current architecture

Markdown lessons and JSON inventories are validated by dependency-free Node scripts. Terraform examples are isolated fixtures executed by separate lifecycle and recovery scripts. GitHub Actions declares Ubuntu/Windows checks with pinned third-party actions and a candidate Node matrix. Assistant role/configuration files and bootstrap templates form a separate distribution surface. There is no root npm application manifest. The architecture document still contains placeholders at baseline; a configured workflow is not an executed deployment.

## Prioritized findings

| Priority | Finding and risk | Remediation and validation |
| --- | --- | --- |
| Critical | No confirmed critical exploit was established in this bounded local review | Keep release blocked on independent secret/history scanning and environment-specific authorization review; absence of findings is not proof of security |
| High | Production readiness and cloud correctness lack current hosted/live evidence | Record each lab's static, mock and live status; require approved sandbox apply/teardown and hosted CI results |
| High | Workflow policy previously accepted one safe timeout/checkout for multiple unsafe jobs | Fixed per-job timeouts and per-checkout credential policy; regression tests include unsafe second jobs |
| High | Private artifact policy missed arbitrary variable filenames, plans and credential paths | Expanded bounded path policy and Windows normalization; regression fixtures verify rejection |
| High | Release ownership, branch protection, rollback and publication evidence are unverified | Assign accountable owners, protect branches, capture release and rollback drills before release |
| Medium | 27 documentation failures blocked baseline validation | Corrected role/template headings and created missing evidence document; run link/heading checks |
| Medium | Architecture placeholders and incomplete organization/cloud content prevent operational use | Define boundaries, identities, backend recovery, network policy, cost ownership and provider-specific contracts in later phases |
| Medium | Offline scanner is not a YAML parser, history scanner or CVE scanner | Pair with pinned workflow syntax, independent secret/history and dependency checks in hosted CI |
| Medium | Node/provider compatibility matrix is declared rather than fully evidenced | Execute each supported version/platform combination and narrow claims to observed results |
| Medium | No measured site performance, availability or scalability baseline | Establish build size/time, accessibility and page budgets when site exists; record measurements before setting SLOs |
| Low | Duplicate assistant roles create drift risk | Keep shared role definitions synchronized through bootstrap regression checks; consider generation from one canonical source |

## Target-state controls

Keep content, Terraform modules, environment roots and organization policy separate. Pin provider dependencies per root, use encrypted versioned remote state with locking and least-privilege workload identity, and isolate environments by account/project/subscription and state. Require reviewed plans and protected apply environments. Retain sensitive plans only for an explicit short policy interval and retain recoverable state through failures. Each public/private cloud adapter needs provider-specific prerequisites, cost expectations, network assumptions, recovery and cleanup evidence.

Validation layers are documentation/inventory, unit tests, Terraform format/validate, native/mock tests, isolated lifecycle/recovery, hosted CI, and explicitly authorized live acceptance. Site publication and cloud readiness are separate release decisions. Introduce MCP connections only with explicit tool scope, secret-free configuration, least privilege and a recorded connection test; installed configuration alone does not establish trust or connectivity.

## Roadmap and risk handling

Immediate: repair baseline checks and record evidence. Short term: finish lessons, organization runbooks, module contracts, cloud adapters, diagrams and automation. Long term: hosted release validation, live sandbox acceptance, observability, performance budgets and periodic compatibility/security reviews. [Production roadmap](production-roadmap.md) contains the broader phased scope. Revert individual source changes when checks regress; preserve cloud state and require reviewed remediation for any external resource rollback. No external resources were changed by this baseline phase.
