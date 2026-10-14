# Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Trigger / Signal | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | Accidental cloud spend during live labs | Medium | High | Enforce small resource types, mandatory teardown scripts, and hard spend budgets | Cloud billing alert or orphaned resources | Open |
| R02 | Sensitive state leakage to repository | Low | Critical | Pre-commit security scanning, `.gitignore` rules, and read-only CI runners | `check-security.mjs` failure | Mitigated |
| R03 | Breaking changes in Terraform minor versions | Medium | Medium | Strict version constraints (`~> 1.14.0`) and CI matrix testing | `terraform init` or validation failure | Mitigated |
| R04 | Path handling incompatibilities across OSes | Medium | Medium | Use `node:path` and `fileURLToPath` for cross-platform POSIX/Windows normalization | `guide-mcp.test.mjs` path failure | Mitigated |
| R05 | Stale or drifting documentation links | Medium | Low | Automated markdown link parser checking all relative paths and heading anchors | `check-docs.mjs` failure | Mitigated |
