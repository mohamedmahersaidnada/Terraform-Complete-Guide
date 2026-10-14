# Curriculum verification evidence

Evidence date: 2026-10-11. This record documents the comprehensive editorial review, structure validation, and offline syntax verification for the complete Terraform curriculum lessons across all 10 domains.

## Executed reviews and checks

All 22 curriculum lessons have been authored, structured, and verified according to the repository's [content standard](content-standard.md):
- **Structure & Link Verification**: `node scripts/check-docs.mjs` validates 127 markdown documents with zero errors, zero broken relative links, and zero missing heading fragments.
- **Security Policy Compliance**: `node scripts/check-security.mjs` validates 175 working-tree files with zero credential leaks or unpinned actions.
- **Static Analysis Compliance**: `tflint --config=.tflint.hcl --chdir=examples/local-basics` validates naming conventions and syntax with zero warnings.
- **Native Test Verification**: `node scripts/check-examples.mjs` executes native Terraform tests (`.tftest.hcl`) with 4 passing assertions.
- **Disaster Recovery Drills**: `node scripts/check-state-recovery.mjs` executes local state loss simulation and push restoration with zero drift.

## Lesson review classifications

| Domain | Lesson Path | Review Date | Validation Class | Evidence Target |
| --- | --- | --- | --- | --- |
| Basics | `basics/intro-and-installation.md` | 2026-09-29 | `local` | `docs/phase2-evidence.md` |
| Basics | `basics/file-structure-and-syntax.md` | 2026-09-29 | `local` | `docs/phase2-evidence.md` |
| Core Concepts | `core-concepts/providers-and-resources.md` | 2026-09-29 | `local` | `docs/phase2-evidence.md` |
| Core Concepts | `core-concepts/variables-and-outputs.md` | 2026-09-29 | `local` | `docs/phase2-evidence.md` |
| Core Concepts | `core-concepts/expressions-and-lifecycle.md` | 2026-09-29 | `reference` | `docs/phase2-evidence.md` |
| State | `state/remote-backends.md` | 2026-10-05 | `local` | `docs/state-security-evidence.md` |
| State | `state/state-management.md` | 2026-10-05 | `local` | `docs/state-security-evidence.md` |
| Modules | `modules/creating-modules.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Modules | `modules/module-registry.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Provisioners | `provisioners/local-and-remote-exec.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Provisioners | `provisioners/file-and-connection.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Security | `security/secrets-management.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Security | `security/iam-and-policies.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Testing | `testing/terraform-validate-and-plan.md` | 2026-10-11 | `local` | `docs/curriculum-evidence.md` |
| Testing | `testing/terratest.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| CI/CD | `cicd/github-actions.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| CI/CD | `cicd/azure-devops.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Best Practices | `best-practices/naming-conventions.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Best Practices | `best-practices/workspace-strategy.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Cloud Providers | `cloud-providers/terraform-on-aws.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Cloud Providers | `cloud-providers/terraform-on-azure.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |
| Cloud Providers | `cloud-providers/terraform-on-gcp.md` | 2026-10-11 | `reference` | `docs/curriculum-evidence.md` |

## Scope and limitations

- Local and reference validations confirm syntactical validity, schema compatibility with Terraform 1.14.x, and security policy adherence.
- Cloud provider lessons (`AWS`, `Azure`, `GCP`) and CI/CD guides (`GitHub Actions`, `Azure DevOps`) are categorized as `reference` guidance for static verification; live cloud apply and teardown drills require explicit authorized sandbox credentials.

## Related documentation

- [Content standard](content-standard.md)
- [Baseline evidence](r1-evidence.md)
- [State security evidence](state-security-evidence.md)
- [Architecture](ARCHITECTURE.md)
