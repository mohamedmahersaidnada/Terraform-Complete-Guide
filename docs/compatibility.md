# Compatibility and sources

Baseline observed 2026-09-28: Windows PowerShell, Node.js 26.10.0, Terraform 1.14.8. Node is pinned in .node-version and CI. Terraform/provider compatibility is claimed only where corresponding example evidence exists. OpenTofu and other operating systems are unverified until explicitly tested.

The documentation checker uses only Node built-ins and is versioned with the repository; no mutable third-party dependency is downloaded. CI runs a pinned Node version on Ubuntu and Windows. A configured matrix is not evidence of a completed hosted run.

## Primary references reviewed

- [Terraform style and version constraints](https://developer.hashicorp.com/terraform/language/style)
- [GitHub Node.js workflow documentation](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [Markdownlint configuration](https://github.com/DavidAnson/markdownlint-cli2): evaluated; dependency-free checks selected for offline reproducibility and explicitly narrower coverage.

Add provider versions, resource schemas and command references here as each example is implemented.

## Current verification

The 2026-09-30 local rerun used the same Node 26.10.0 / Terraform 1.14.8 baseline. The [current audit](current-audit.md#verification-record) lists executed checks. The expanded workflow configures Terraform validation, native tests, lifecycle and recovery on Ubuntu/Windows; hosted execution remains unverified. Node version is read from .node-version; the Terraform setup wrapper is disabled for direct subprocess calls. The broad HCL version constraint is not a tested-version matrix.

## 2026-10-05 baseline rerun

Node 26.10.0 on Windows executed 21 documentation, 15 example-checker and 5 bootstrap regressions. See [R1 evidence](r1-evidence.md) for security checks and limits. No version pins were changed by this repair, and the declared Node 24 candidate remains unverified locally.
