# R1 baseline evidence

Evidence date: 2026-10-05. This record covers local Phase A checks, not production readiness. Previous audit results remain historical unless repeated here.

## Executed checks

- Documentation checker: 124 Markdown files, zero errors.
- Node runtime reported 26.10.0 on Windows.
- Documentation regression suite: 21 passed.
- Example checker regression suite: 15 passed; these are checker fixtures, not live cloud tests.
- Bootstrap regression suite: 5 passed.
- Security regression suite: 9 passed, including named checkout steps and additional write permissions.
- Offline security scan: 171 working-tree files passed on the final policy rerun.
- Repaired 24 role documents with multiple H1 headings and two issue templates missing an H1. Restored the missing evidence link target.

Sandbox subprocess execution initially returned EPERM. Approved reruns succeeded. No credentials or matched secret values are included in findings.

## Limits and remaining release gates

No hosted CI execution, branch protection, production publication, cloud apply, cloud teardown, provider compatibility matrix or MCP integration test is claimed here. Native Terraform lifecycle/recovery evidence in the older audit is historical and requires a new final-stage rerun. External workflow syntax validation has not run in this phase. The scanner is a bounded block-YAML policy, not a general YAML parser, entropy scanner, history scan, dependency vulnerability service or proof of secret absence. Run pinned actionlint and an independent history/secret scanner in release CI.

Release requires recorded hosted checks, named accountable owners, per-lab static/mock/live evidence, resource cleanup evidence for live labs, a reproducible artifact and a tested rollback. Cloud operations require a selected sandbox scope, budget and credentials; none is inferred from installed tooling.

Local cloud configuration directories `.aws/`, `.azure/` and `.config/gcloud/` are now ignored and explicitly rejected if tracked by the security policy. Their contents were not opened.
