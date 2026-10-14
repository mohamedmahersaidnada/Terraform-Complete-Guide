# Runbook

Operational runbook and troubleshooting procedures for maintaining the repository, running tests, and managing incidents.

## Prerequisites

To perform local operations and validation, ensure the following tooling is installed:
- **Node.js**: Version `26.x` or `24.x` (matching `.node-version`).
- **Terraform CLI**: Version `1.14.x` (verified with `terraform version`).
- **Git**: Working Git client with access to the repository root.
- **PowerShell / Bash**: Standard shell environment on Windows, Linux, or macOS.

## Health checks

Execute the full suite of automated health checks from the repository root:

```shell
# 1. Validate markdown documentation and internal links
node scripts/check-docs.mjs

# 2. Validate security policies, credentials, and workflow permissions
node scripts/check-security.mjs

# 3. Validate Terraform example fixtures and manifest compliance
node scripts/check-examples.mjs

# 4. Verify local Terraform init, plan, apply, destroy lifecycle
node scripts/check-local-lifecycle.mjs

# 5. Verify Terraform state migration and disaster recovery
node scripts/check-state-recovery.mjs

# 6. Run all unit and regression test suites
node --test scripts/check-docs.test.mjs scripts/check-examples.test.mjs scripts/bootstrap.test.mjs scripts/check-security.test.mjs scripts/guide-mcp.test.mjs
```

All commands must exit with status code `0`.

## Common incidents

### Incident 1: Documentation link validation failure

- **Symptom**: `node scripts/check-docs.mjs` fails reporting `missing local link` or `missing heading`.
- **Diagnosis**: A referenced file has been renamed or deleted, or an anchor heading was modified.
- **Resolution**:
  1. Inspect the file reported in the error message.
  2. Verify if the target file exists or if the anchor matches an existing H1-H6 heading.
  3. Correct the relative path or heading anchor.
  4. Re-run `node scripts/check-docs.mjs` until zero errors are reported.

### Incident 2: Security check failure on private artifacts or secrets

- **Symptom**: `node scripts/check-security.mjs` reports `private artifact` or pattern match.
- **Diagnosis**: A `.tfstate`, `.tfplan`, `.tfvars`, or credential token was placed in the working tree without being git-ignored.
- **Resolution**:
  1. Inspect the reported path.
  2. Add the path pattern to `.gitignore` or remove the sensitive file.
  3. Ensure no secrets are staged for commit (`git status`).
  4. Re-run `node scripts/check-security.mjs`.

### Incident 3: Guide MCP server test failure

- **Symptom**: `scripts/guide-mcp.test.mjs` fails during stdio communication.
- **Diagnosis**: Path resolution issues, unhandled JSON-RPC exceptions, or schema mismatches.
- **Resolution**:
  1. Verify path resolution using `fileURLToPath` for environments with spaces in directory names.
  2. Test manually: `node scripts/guide-mcp.mjs` and send `{"jsonrpc":"2.0","id":1,"method":"ping"}`.
  3. Ensure all lessons in `docs/lesson-inventory.json` exist on disk.

## Rollback

If a commit introduces regressions or breaks CI validation:

1. **Local Working Tree Rollback**:
   - Revert unstaged modifications: `git restore <file>`
   - Discard uncommitted changes across the working tree: `git restore .`

2. **Commit Reversal**:
   - Create a clean revert commit: `git revert <commit_sha>`
   - Do not use force-push (`git push --force`) on shared branches without human team approval.

3. **Terraform Fixture Rollback**:
   - Fixture scripts clean up after themselves automatically in a `finally` block.
   - If an orphaned fixture remains in temp storage, remove `terraform-guide-*` directories in `os.tmpdir()`.

## Recovery

### State corruption recovery

If a Terraform state file becomes corrupted during a lab or demo:

1. Retrieve the latest verified state snapshot:
   ```shell
   terraform state pull > state-backup.json
   ```
2. Verify state JSON structure and lineage integrity.
3. Force-push the verified backup to restore backend state:
   ```shell
   terraform state push state-backup.json
   ```
4. Run `terraform plan` to confirm that state aligns with declarative configuration without unexpected destructive diffs.

## Escalation

- **Security Incidents**: For suspected credential exposure or security vulnerabilities, follow guidelines in `SECURITY.md`.
- **Architectural Changes**: Significant changes to module hierarchy, backend standards, or AI Engineering OS contracts require independent multi-provider review per `core/OPERATING_SYSTEM.md`.
