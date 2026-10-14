# AI Engineering OS V2

Reusable multi-provider engineering operating layer for **Claude Code + Gemini CLI**, designed for existing (Brownfield) and new (Greenfield) software, AI/LLM, Kubernetes/OpenShift, cloud, IaC and platform projects.

## What V2 changes
Engineering policy is provider-neutral under `core/`. Claude and Gemini are adapters, not separate brains. Both share the same project memory, quality gates, safety model and lifecycle. This makes future adapters (for example another coding agent) much easier to add.

## Layout
- `core/OPERATING_SYSTEM.md` — canonical engineering contract
- `core/agents/` — reusable specialist role definitions
- `core/workflows/` — canonical workflows
- `core/policies/` — routing/governance
- `CLAUDE.md` + `.claude/` — Claude Code adapter
- `GEMINI.md` + `.gemini/` — Gemini CLI adapter
- `project-memory/` — durable shared state
- `docs/` — architecture/security/operations/runbook
- `scripts/` — safe bootstrap helpers

## Install into an existing project
### Windows PowerShell
```powershell
.\scripts\bootstrap.ps1 -Target C:\path\to\your-project
```
### Linux/macOS/WSL
```bash
bash scripts/bootstrap.sh /path/to/your-project
```
Run these commands from the repository root with Node.js installed. The bootstrap installs missing files individually and never overwrites existing files. `-Force` is rejected; review conflicts manually. It copies clean project-memory and operations templates from `templates/`, not this guide's populated project records or lessons. Source and target must be separate directory trees; symbolic-link destinations are rejected. After a partial installation, rerun to install missing files. No active provider settings are enabled automatically.

## First run — Claude Code
Open the target repository, start Claude Code, and ask it to run/use `project-init`. Review the discovered stack and project-memory before implementation.

## First run — Gemini CLI
Open the target repository, start Gemini CLI, ensure it has loaded `GEMINI.md`, then invoke the project-init custom command supported by your installed version or ask Gemini to execute `core/workflows/project-init.md`. Review project-memory before implementation.

## Daily lifecycle
`project-status -> plan -> implement -> test -> security-review -> review -> fix -> release-check -> handoff`

For high-risk work add:
`implement with Provider A -> cross-provider-review with Provider B -> fix with Provider A -> retest -> release-check`

## Brownfield default
Do not mass-format, mass-upgrade dependencies, replace architecture, or rewrite generated files during onboarding. Discover first and preserve human-authored context.

## Safety defaults
No automatic production apply/deploy, destructive deletion, secret disclosure, IAM/credential mutation with blast radius, protected-branch merge, history rewrite, or release publication without explicit human approval.

## Important compatibility note
Claude Code and Gemini CLI change over time. The durable engineering logic intentionally lives in `core/`; provider-specific settings/command syntax is isolated under `.claude/`, `.gemini/`, and `adapters/`. Validate example settings against the version installed on your machine before enabling them.
