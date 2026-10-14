# Decisions

Record durable architectural and engineering decisions.

| Date | Context | Decision | Alternatives Considered | Consequences & Status |
| --- | --- | --- | --- | --- |
| 2026-09-28 | Verification tooling dependencies | Use zero-dependency Node.js standard libraries for all checkers | Python scripts, npm packages, Bash only | Maximizes portability across Windows/Linux/macOS without npm install overhead. Status: Accepted. |
| 2026-09-29 | CI Workflow Security | Enforce pinned 40-character SHAs and read-only default permissions | Semantic tag pins, write-all permissions | Mitigates supply-chain tampering and runner exfiltration attacks. Status: Accepted. |
| 2026-09-30 | Multi-Agent Coordination | Provider-neutral OS contract (`core/OPERATING_SYSTEM.md`) with cross-provider reviews | Single provider lock-in | Enables independent authoring and reviewing between Claude and Gemini. Status: Accepted. |
| 2026-10-05 | State Isolation | Separate backend storage identity from workload provider identity | Combined admin identity | Limits blast radius of infrastructure deployment credentials. Status: Accepted. |
| 2026-10-07 | MCP Tool Path Resolution | Use `fileURLToPath` for cross-platform path resolution in MCP server tests | Custom regex and `.pathname` | Fixes URL encoding errors on paths with spaces (e.g. `My Drive`). Status: Accepted. |
| 2026-10-11 | Enterprise Static Analysis | Add `.tflint.hcl` configuration for automated Terraform linting | Manual code review only | Provides automated detection of deprecated syntax, naming conventions, and unused variables. Status: Accepted. |
