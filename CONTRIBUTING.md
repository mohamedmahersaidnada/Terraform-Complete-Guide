# Contributing

Start with the [content standard](docs/content-standard.md) and [inventory](docs/lesson-inventory.json). Use a branch and a focused pull request; document behavior, source references and verification results. Run the README checks before requesting review.

## Ownership and review

Repository maintainers review shared contracts, security, tooling and releases. A lesson author owns its examples and dated evidence until a maintainer accepts transfer. The inventory owner field records this responsibility; it does not assign an unconsenting third party. Cloud examples need a reviewer familiar with that provider.

Draft lessons may merge with status draft. Mark reviewed only after the content contract and applicable checks pass. Distinguish static, local, mocked and live evidence. Never fabricate account access or cloud cleanup evidence.

## Lockfiles and secrets

Commit provider lockfiles for runnable roots and npm lockfiles if dependencies are introduced. Update them deliberately and review checksums. Child modules document provider constraints; consumers own root locks. Do not commit state, saved plans, credentials or private variable values. Sanitized .tfvars.example files are permitted.

## Release convention

Use semantic version tags only after release review. Record user-visible changes and limitations in a changelog. Every quarter, review official references, supported versions, unresolved drafts and cloud validation evidence. Dependency updates require checks and source review before merge.
