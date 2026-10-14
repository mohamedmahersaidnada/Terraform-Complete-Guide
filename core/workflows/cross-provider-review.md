# Cross-Provider Review

Goal: reduce single-model blind spots without creating concurrent writers.

1. Freeze implementation; capture `git status` and diff/commit range.
2. Reviewer must be a different provider or a fresh independent reviewer role and must not edit files.
3. Review correctness, security, regressions, data loss, concurrency, performance, operability, migrations, tests, and unnecessary complexity.
4. Every finding must include severity, evidence/location, impact, and a concrete remediation suggestion.
5. Author provider triages findings: accept, reject with evidence, or escalate to human.
6. Apply accepted fixes using one writer.
7. Re-run relevant verification.
8. Record material residual risks in `project-memory/RISK_REGISTER.md` and current state in `STATUS.md`/`HANDOFF.md`.
