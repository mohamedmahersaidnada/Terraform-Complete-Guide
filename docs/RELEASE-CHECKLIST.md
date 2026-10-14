# Release Verification and Signoff Checklist

This document defines the mandatory, deterministic verification gates, artifact signing procedures, rollback protocols, and human signoff requirements for publishing production releases of the Terraform Complete Guide.

## Overview and Policy

All releases of this repository must satisfy strict quality, security, and reproducibility standards before distribution. In alignment with the repository safety policy:

- No release artifact may be published without complete, passing verification across all automated gates.
- All release archives must be built deterministically, excluding working-tree caches, VCS metadata, and private artifacts.
- Cryptographic SHA256 integrity checksums and signatures must accompany every release artifact.
- Destructive operations, tag pushes, or public releases require explicit human signoff.

## Pre-Release Verification Gates

Prior to triggering release packaging, every gate below must execute and pass with 100% green status.

### 1. Automated Test Suite

Execute the unified Node.js native test harness. All unit, integration, and contract tests must pass.

```bash
node --test scripts/check-docs.test.mjs scripts/check-examples.test.mjs scripts/bootstrap.test.mjs scripts/check-security.test.mjs scripts/guide-mcp.test.mjs
```

Verification criteria:
- Zero failed test assertions.
- Zero skipped tests without explicit documented waivers.
- Bootstrap preflight, documentation link, example inventory, security policy, and MCP protocol tests all green.

### 2. Documentation and Link Integrity Gate

Validate that all Markdown documentation, 22 curriculum lessons, and anchor references are intact.

```bash
node scripts/check-docs.mjs
```

Verification criteria:
- Every Markdown file contains exactly one H1 header and valid heading hierarchies (no skipped levels).
- Every code fence declares a valid syntax highlighter language.
- Every internal link and fragment anchor resolves to an existing file and heading.
- All 22 curriculum lessons in `docs/lesson-inventory.json` exist, have a valid status (`reviewed`), valid owner, and valid evidence link.

### 3. Offline Security and Supply Chain Policy Gate

Verify repository cleanliness against secrets, credentials, unpinned actions, and lockfile tampering.

```bash
node scripts/check-security.mjs
```

Verification criteria:
- Zero detected cloud credentials (AWS, GCP, Azure, GitHub tokens, private keys).
- Zero uncommitted or invalid npm lockfiles.
- Every GitHub Actions workflow specifies explicit read-only contents permissions (`permissions: contents: read`).
- Every GitHub Actions workflow step with checkout explicitly disables credential persistence (`persist-credentials: false`).
- Every GitHub Actions action pin uses a full 40-character commit SHA.
- Every GitHub Actions job specifies a bounded literal `timeout-minutes`.

### 4. Zero-Cost Terraform Local Lifecycle Gate

Run the local lifecycle verification harness using simulated providers (`local_file`, `null_resource`, `random_id`).

```bash
node scripts/check-local-lifecycle.mjs
```

Verification criteria:
- Clean initialization (`terraform init`) without downloading remote cloud dependencies.
- Plan creation, resource application, variable overrides, state generation, and teardown (`terraform destroy`) succeed locally.

### 5. State Disaster Recovery Gate

Execute the state management and recovery validation suite.

```bash
node scripts/check-state-recovery.mjs
```

Verification criteria:
- State backups are generated correctly.
- Surgical state manipulation (`state list`, `state rm`) functions properly.
- State file disaster restoration and rollback workflows succeed deterministically.

### 6. Example and Lab Syntax Gate

Validate that all runnable Terraform examples and module fixtures conform to canonical formatting and syntax.

```bash
node scripts/check-examples.mjs
```

Verification criteria:
- All `.tf` files format cleanly with `terraform fmt -check`.
- All example configurations pass `terraform validate`.

### 7. Workflow Syntax and Static Site Build Gates

Validate GitHub Actions workflow syntax using actionlint, and verify static documentation site compilation.

```bash
actionlint -shellcheck=
mkdocs build --strict
```

Verification criteria:
- Actionlint outputs zero syntax or structural errors.
- MkDocs compiles the complete static documentation site with zero warnings under `--strict` mode.

## Release Packaging Procedure

Once all pre-release verification gates pass, package the deterministic release archives.

### Executing the Packager

Run the release packaging utility:

```bash
npm run package
```

Or directly via Node:

```bash
node scripts/package-release.mjs
```

### Packaging Verification Checks

The packager performs the following actions automatically:
1. Validates repository cleanliness, confirming no forbidden files (`.terraform`, `.terragrunt-cache`, `node_modules`, `*.tfstate`, `*.tfplan`, private keys, unpinned credentials) are present.
2. Checks git working tree status. (In release pipelines, run with `--strict` to require an entirely clean git tree).
3. Verifies that all 22 required curriculum lessons, modules, fixtures, scripts, and documentation files exist.
4. Creates two deterministic release archives in `dist/`:
   - `dist/terraform-complete-guide-v1.0.0.tar.gz`
   - `dist/terraform-complete-guide-v1.0.0.zip`
5. Computes SHA256 checksums for each archive and writes them to `dist/checksums.sha256`.

## Artifact Signing and Integrity Verification

### 1. SHA256 Checksum Verification

Verify the computed checksums against the generated artifacts before any distribution:

On Linux / macOS:
```bash
cd dist && sha256sum -c checksums.sha256
```

On Windows (PowerShell):
```powershell
Get-FileHash -Algorithm SHA256 dist\terraform-complete-guide-v1.0.0.*
Get-Content dist\checksums.sha256
```

Confirm that the output hashes match the entries in `dist/checksums.sha256` character for character.

### 2. GPG / OpenPGP Artifact Signing

Release artifacts should be cryptographically signed using the release coordinator's verified GPG key.

Generate detached ASCII-armored signatures:

```bash
gpg --armor --detach-sign --output dist/terraform-complete-guide-v1.0.0.tar.gz.asc dist/terraform-complete-guide-v1.0.0.tar.gz
gpg --armor --detach-sign --output dist/terraform-complete-guide-v1.0.0.zip.asc dist/terraform-complete-guide-v1.0.0.zip
gpg --armor --detach-sign --output dist/checksums.sha256.asc dist/checksums.sha256
```

Verify detached signatures:

```bash
gpg --verify dist/terraform-complete-guide-v1.0.0.tar.gz.asc dist/terraform-complete-guide-v1.0.0.tar.gz
gpg --verify dist/terraform-complete-guide-v1.0.0.zip.asc dist/terraform-complete-guide-v1.0.0.zip
gpg --verify dist/checksums.sha256.asc dist/checksums.sha256
```

## Rollback and Abort Procedures

If a defect, security vulnerability, broken link, or packaging discrepancy is identified during or immediately after the release process, follow this procedure immediately.

### Abort Triggers

Any of the following conditions triggers an immediate release abort:
- Any verification gate fails or outputs warnings in strict mode.
- Checksums fail to match expected values.
- Untracked or unauthorized files are discovered in the release archive.
- A regression is discovered in curriculum content or local testing harnesses.

### Pre-Publish Abort Procedure

If the release has not yet been pushed to git remotes or GitHub Releases:
1. Stop all packaging and publication activities immediately.
2. Remove the `dist/` directory and any intermediate artifacts:
   ```bash
   node -e "fs.rmSync('dist', { recursive: true, force: true })"
   ```
3. Delete local release tags if created:
   ```bash
   git tag -d v1.0.0
   ```
4. Document the root cause of the abort in `project-memory/TODO.md` and `project-memory/RISK_REGISTER.md`.

### Post-Publish Rollback Procedure

If the release has already been tagged and published to GitHub:
1. **Quarantine the Release**: In GitHub Releases, mark the release as a Pre-release immediately or edit the release notes with a prominent banner: `[REVOKED - DO NOT USE: See Security/Quality Advisory]`.
2. **Do Not Delete History**: Do not force-push or delete shared git history. Retain the published commit for provenance and auditing.
3. **Draft a Patch Release**: Create an incident branch, implement the fix, add regression tests, and prepare release `v1.0.1` following the full checklist.
4. **Publish Advisory**: File an issue or security advisory detailing:
   - Specific failure mode or regression observed.
   - Affected artifact checksums.
   - Remediation steps for users who downloaded the affected release.
   - Expected availability of the patch release.

## Human Signoff Checklist

Before finalizing any release, each designated role must review, verify, and initial the checklist below.

| Role | Responsibility | Verification Command / Evidence | Signoff Initial | Date |
| --- | --- | --- | --- | --- |
| **Chief Engineer** | Curriculum completeness, 22 lessons, architecture | `docs/lesson-inventory.json`, `mkdocs build` | [ ] Approved | YYYY-MM-DD |
| **Quality Engineer** | Test harnesses, lifecycle, and recovery tests | `npm test`, `check-local-lifecycle.mjs` | [ ] Approved | YYYY-MM-DD |
| **Security Engineer** | Credential scan, workflow permissions, dependency lock | `node scripts/check-security.mjs` | [ ] Approved | YYYY-MM-DD |
| **Packaging Lead** | Deterministic archives, checksums, GPG signatures | `dist/checksums.sha256`, `sha256sum -c` | [ ] Approved | YYYY-MM-DD |

### Release Signoff Certificate

```markdown
Release Tag: v1.0.0
Commit SHA: [Insert 40-char git commit SHA]
Target Branch: main
Packaging Date: 2026-10-14
Tarball SHA256: [Insert SHA256 from dist/checksums.sha256]
Zip SHA256:     [Insert SHA256 from dist/checksums.sha256]

All verification gates have executed cleanly with zero warnings.
Artifacts are verified deterministic and cryptographically signed.
Human Signoff Authority: _______________________________
```
