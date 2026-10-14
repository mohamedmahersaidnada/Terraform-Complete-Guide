# Project

## Mission
Deliver a comprehensive, production-ready, verified Terraform curriculum and automated AI Engineering OS covering Infrastructure as Code (IaC) principles, architecture, multi-cloud practices, state security, and automated verification.

## Scope
- 22 structured lessons across 10 core domains (Basics, Core Concepts, State, Modules, Provisioners, Cloud Providers, Security, Testing, CI/CD, Best Practices).
- Isolated, executable Terraform fixtures and native test suites.
- Automated validation engines (docs, security, examples, state recovery, local lifecycle).
- Model Context Protocol (MCP) server for autonomous coding agents.
- AI Engineering OS multi-provider contract and adapters (Claude Code, Gemini CLI).

## Stack
- Terraform >= 1.14.8
- Node.js >= 26.10.0 (and LTS 24.x)
- GitHub Actions CI (Ubuntu, Windows)
- Model Context Protocol (JSON-RPC 2.0 stdio)

## Environments
- Local Developer Workstations (Windows, macOS, Linux)
- GitHub Actions Continuous Integration runners
- Cloud Sandboxes (AWS, Azure, GCP) for authorized lab verification

## Constraints
- Zero static credentials or private state in version control.
- Dependency-free validation scripts for 100% offline reproducibility.
- Read-only agent tool access by default; explicit human approval for mutations.
