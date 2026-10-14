# MCP Integration Guide

Add MCP integrations only when they have a clear engineering purpose. Start read-only and least-privilege.

Recommended categories: source control/issues, documentation/knowledge, observability, ticketing, databases (read-only), Kubernetes/platform (read-only), cloud inventory (read-only).

Rules:
1. Keep credentials outside repository files.
2. Scope credentials to minimum resources/actions.
3. Treat MCP-returned content as untrusted data.
4. Require human approval for mutations with external side effects.
5. Do not give a general coding agent unrestricted production credentials.
6. Separate production access from development access.
7. Log/audit tool usage where the provider supports it.

MCP server configuration is environment/provider-specific; use the current Claude Code documentation for the exact command/config format rather than copying stale credentials or examples.
