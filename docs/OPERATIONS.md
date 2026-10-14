# Operations

Operational procedures, lifecycle management, and environmental controls for the Terraform Complete Guide.

## Environments

The repository defines three operational environment tiers:

| Tier | Purpose | Execution Location | Credentials & State |
| --- | --- | --- | --- |
| Local Development | Curriculum drafting, script development, unit tests | Developer workstation (Windows/macOS/Linux) | No cloud credentials; local state in temp fixtures only |
| Continuous Integration | Automated pull request validation, link checking, security policy enforcement | GitHub Actions (`ubuntu-latest`, `windows-latest`) | Read-only repository access (`contents: read`); zero persisted credentials |
| Cloud Pilot (Sandbox) | Verifying cloud provider labs (AWS, Azure, GCP) | Isolated cloud sandboxes | Ephemeral, least-privilege credentials; temporary state with mandatory teardown |

## Deployment

Deployment follows a strictly gated promotion workflow:

1. **Pre-commit / Pre-push Validation**:
   - Run `node scripts/check-docs.mjs` to ensure zero broken links, invalid code fences, or heading errors.
   - Run `node scripts/check-security.mjs` to confirm no secret patterns, private artifacts, or workflow misconfigurations exist.
   - Run all test suites: `node --test scripts/*.test.mjs`.

2. **Continuous Integration Gate**:
   - Pull requests trigger the GitHub Actions workflow (`docs.yml`).
   - Matrix testing verifies compatibility on Ubuntu and Windows across Node.js versions.
   - Actionlint verifies workflow structure and expression security.

3. **Release & Publication**:
   - Tagged releases trigger static site generation (once configured) and bundle distribution.
   - Release requires human sign-off per `core/OPERATING_SYSTEM.md`.

## Configuration

Configuration is managed declaratively with zero sensitive information in version control:

- **Node.js Runtime**: Explicitly pinned via `.node-version` (`26.10.0`).
- **Terraform Runtime**: Pinned in CI to `1.14.8`; configurations specify `required_version = "~> 1.14.0"`.
- **MCP Server**: Defined in `.mcp.json` pointing to `scripts/guide-mcp.mjs`.
- **AI Tooling**: Settings and commands configured in `.claude/` and `.gemini/` directories using sanitized template baselines (`settings.example.json`).

## Observability

1. **Test & Validation Reporting**:
   - Test runs output structured console summaries and exit codes.
   - Native Terraform tests utilize `-json` reporting for deterministic parsing.

2. **MCP Server Health & Telemetry**:
   - JSON-RPC stdio protocol includes standard `ping` response and schema validation error reporting.
   - Request payloads exceeding 64 KB are rejected to prevent buffer exhaustion.

3. **Audit Records**:
   - Historical audits and remediation records maintained in `docs/current-audit.md` and `docs/environment-audit.md`.
   - Execution progress tracked in `docs/execution-progress.json`.

## Backup and restore

1. **Repository & Documentation**:
   - Distributed Git version control with remote origin mirroring.
   - Durable project state preserved in `project-memory/`.

2. **Terraform State Disaster Recovery**:
   - State migration and backup procedures validated via `scripts/check-state-recovery.mjs`.
   - Manual recovery drills utilize `terraform state pull` to capture atomic state snapshots and `terraform state push` to recover from state store corruption.

## Capacity

- **Repository Footprint**: Kept lightweight by excluding binary provider plugins, `.terraform` directories, and large media files.
- **MCP Memory Footprint**: Standard stdio process with bounded memory limits (< 100 MB RSS) and strict 256 KB file size read limits per lesson.
- **CI Resource Consumption**: All workflow jobs enforce strict `timeout-minutes` (5 minutes for docs/security, 10 minutes for local Terraform).

## Failure handling

| Failure Scenario | Immediate Impact | Remediation Procedure |
| --- | --- | --- |
| Broken link or markdown error in PR | CI check fails; merge blocked | Run `node scripts/check-docs.mjs` locally, identify broken target/anchor, update link, re-run |
| Credential or private file committed | Security scan fails; commit rejected | Remove file from Git history/working tree, rotate exposed credential immediately |
| Terraform test failure in fixture | Example validation fails | Inspect fixture in temp directory, run `terraform test` locally, correct HCL, verify cleanup |
| MCP server crash or hang | AI assistant loses guide tool access | Test server directly via `node --test scripts/guide-mcp.test.mjs`, inspect stderr for malformed JSON-RPC |

## Maintenance

- **Dependency Reviews**: Periodic inspection of GitHub Action SHA pins and Node.js LTS releases.
- **Curriculum Upgrades**: Quarterly review of Terraform minor releases, deprecated syntax, and cloud provider API changes.
- **Inventory Reconciliation**: Ensure all newly added lesson files are cataloged in `docs/lesson-inventory.json` with appropriate ownership and validation tags.
