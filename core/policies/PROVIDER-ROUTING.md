# Provider Routing

Do not route by brand preference. Route by task, available tools, context quality, cost/latency constraints, and desired independent verification.

- Primary provider: owns the implementation worktree/change.
- Reviewer provider: read-only independent review of diff and evidence.
- Tie-break: human decides when providers disagree on material architecture/security behavior.
- Never allow two providers to edit the same files concurrently.
- For high-risk work, require independent review before release-check.
