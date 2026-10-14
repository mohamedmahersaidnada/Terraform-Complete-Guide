# Hooks
Hooks should be repository-specific. Do **not** blindly copy commands that do not exist in the target project.

Recommended gates after onboarding:
- Python: formatter/linter + type checker + targeted pytest
- JS/TS: formatter/linter + typecheck + targeted tests
- Terraform: `terraform fmt -check`, `terraform validate`, then project lint/security tooling
- Kubernetes/Helm: render/lint + schema/policy validation available in the repo
- Containers: Dockerfile/container lint and image scan if configured

Use fast deterministic checks in hooks; leave expensive integration/e2e/security suites to explicit skills or CI. Never place secrets in hook command strings. Start with notification or validation-only hooks, then tighten once the repository commands are known.
