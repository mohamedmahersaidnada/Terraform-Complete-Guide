# Changelog

All notable changes to the Terraform Complete Guide project are documented in this file.

## 1.0.0 - 2026-10-14

### Overview

Version 1.0.0 marks the initial production-ready release of the Terraform Complete Guide. This release delivers an end-to-end, authoritative, and verifiable curriculum covering Terraform 1.14.x across 10 progressive architectural domains, backed by zero-cloud-cost automated testing harnesses, an offline-searchable static documentation site, a custom Model Context Protocol (MCP) server, and the dual-provider AI Engineering OS framework.

### 22-Lesson, 10-Domain Curriculum

A complete, peer-reviewed 22-lesson curriculum across 10 domains, verified in [curriculum evidence](docs/curriculum-evidence.md) and tracked in [lesson inventory](docs/lesson-inventory.json):

- **Domain 1: Basics**
  - [Intro and Installation](basics/intro-and-installation.md): Terraform architecture, execution lifecycle (`init`, `plan`, `apply`, `destroy`), semantic version pinning, CLI installation, and Application Default Credentials.
  - [File Structure and Syntax](basics/file-structure-and-syntax.md): Canonical directory layout (`main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`), HCL syntax rules, blocks, arguments, identifiers, and comments.
- **Domain 2: Core Concepts**
  - [Providers and Resources](core-concepts/providers-and-resources.md): Official and community provider configurations, source addresses, multi-provider aliasing, resource declarations, arguments, and meta-arguments (`count`, `for_each`, `depends_on`).
  - [Variables and Outputs](core-concepts/variables-and-outputs.md): Strongly typed input variables, validation rules, default constraints, precedence hierarchies (`-var`, `.tfvars`, `TF_VAR_*`), and sensitive output masking.
  - [Expressions and Lifecycle](core-concepts/expressions-and-lifecycle.md): Dynamic conditional expressions, collection iteration (`for`, `splat`), built-in transformation functions, and `lifecycle` blocks (`create_before_destroy`, `prevent_destroy`, `ignore_changes`).
- **Domain 3: State Management**
  - [State Management](state/state-management.md): State file architecture, disaster recovery workflows, drift inspection, state locking semantics, and state surgical commands (`state list`, `state show`, `state mv`, `state rm`).
  - [Remote Backends](state/remote-backends.md): Production backend patterns across AWS S3 + DynamoDB locking, Azure Blob Storage + lease locks, and Google Cloud Storage + bucket locks, with sensitive data handling in state files.
- **Domain 4: Modules**
  - [Creating Modules](modules/creating-modules.md): Composition architecture, encapsulation boundaries, input contract validation, structured outputs, root vs child modules, and testing reusable building blocks.
  - [Module Registry](modules/module-registry.md): Terraform Public Registry and private registry consumption, version pinning constraints, Git subpath sourcing, and semantic release publishing.
- **Domain 5: Provisioners**
  - [File and Connection](provisioners/file-and-connection.md): File uploads, SSH/WinRM connection configurations, bastion host tunneling, and security implications of inline transport.
  - [Local and Remote Exec](provisioners/local-and-remote-exec.md): `local-exec` and `remote-exec` provisioner invocation, failure handling modes (`continue`, `fail`), and modern alternatives (cloud-init, SSM, Packer, Ansible).
- **Domain 6: Cloud Providers**
  - [Terraform on AWS](cloud-providers/terraform-on-aws.md): AWS multi-region configurations, IAM role assumption, VPC networking, secure EC2/S3/RDS patterns, and provider authentication.
  - [Terraform on Azure](cloud-providers/terraform-on-azure.md): Azure resource group architectures, Virtual Networks, Managed Identities, and Service Principal authentication.
  - [Terraform on GCP](cloud-providers/terraform-on-gcp.md): GCP project-level resource provisioning, custom VPC networks, IAM service account impersonation, and Cloud Storage configurations.
- **Domain 7: Security**
  - [IAM and Policies](security/iam-and-policies.md): Least-privilege IAM policy design, policy documents, role trust boundaries, permission boundaries, and role-based access control.
  - [Secrets Management](security/secrets-management.md): Dynamic credential injection, integration with AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, Google Secret Manager, and prevention of secret leakage in state.
- **Domain 8: Testing**
  - [Terraform Validate and Plan](testing/terraform-validate-and-plan.md): Native `terraform validate`, mock-provider syntax checking, native `terraform test` assertions, and dry-run plan validation.
  - [Terratest and Integration Testing](testing/terratest.md): Automated Go-based end-to-end testing with Terratest, lifecycle validation stages, fixture isolation, and ephemeral test environments.
- **Domain 9: CI/CD**
  - [GitHub Actions](cicd/github-actions.md): Pull-request speculative plans, concurrency controls, OIDC cloud federated authentication without long-lived keys, and branch-protected apply automation.
  - [Azure DevOps](cicd/azure-devops.md): Multi-stage YAML pipelines, secure service connections, manual approval gates, and artifact publishing.
- **Domain 10: Best Practices**
  - [Naming Conventions](best-practices/naming-conventions.md): Unified resource naming topologies, environment prefixing, mandatory tagging strategies, and governance linting.
  - [Workspace Strategy](best-practices/workspace-strategy.md): Terraform workspaces vs directory-based environment isolation, directory layout patterns, and blast radius management.

### Reusable Modules and Multi-Cloud Architectures

- **Standardized Module Architectures**: Pre-configured, tested patterns in `modules/` including AWS, Azure, and GCP reference components with strict input validation, outputs, and documentation.
- **Runnable Lab Fixtures**: Offline-executable, zero-cost sandbox examples located in `examples/`:
  - `examples/local-basics`: Deterministic filesystem resource generation using `local_file`, `null_resource`, and `random_id`.
  - `examples/backends`: Multi-backend configuration templates demonstrating migration pathways.
  - `examples/modules/local-service`: Composite local service module fixture verifying input/output contracts.

### Zero-Cloud-Cost Testing and State Verification

- **Local Lifecycle Test Suite (`scripts/check-local-lifecycle.mjs`)**: Comprehensive lifecycle testing validating `terraform init`, `terraform plan`, `terraform apply`, variable overrides, state persistence, and `terraform destroy` using local provider mocks without cloud credentials or cost.
- **State Disaster Recovery Test Suite (`scripts/check-state-recovery.mjs`)**: Automated verification of state backup, surgical state item manipulation, state reconstruction, and corruption recovery procedures.
- **Example Validation Harness (`scripts/check-examples.mjs`)**: Automated inspection of all HCL examples in the repository to guarantee syntax compliance, formatting, and provider address correctness.
- **Offline Security Policy Engine (`scripts/check-security.mjs`)**: Strict policy scanner enforcing bounded credential detection (AWS, GCP, GitHub tokens, private keys), workflow permissions, action commit SHA pins, and npm lockfile integrity.

### MkDocs Static Documentation and Search

- **Material for MkDocs Integration**: Modern responsive web documentation built using `mkdocs.yml` with navigation tabs, code annotations, light and dark theme toggles, and instant navigation.
- **Client-Side Offline Search**: Fully pre-indexed search powered by MkDocs Search plugin, allowing completely offline searching across all 22 lessons and governance records.
- **Dynamic File Aggregation Hook (`scripts/mkdocs_hooks.py`)**: Custom Python build hook aggregating curriculum lessons, lab fixtures, and operational guides into the site tree dynamically while keeping the repository layout clean.

### Guide MCP Server and AI Engineering OS

- **Custom Guide Model Context Protocol (MCP) Server (`scripts/guide-mcp.mjs`)**:
  - High-performance, bounded stdio server implementing Model Context Protocol tools: `get_lesson`, `search_curriculum`, `list_domains`, and `get_curriculum_status`.
  - Sandboxed path traversal protections, in-memory caching, and zero external dependency footprint.
  - Configuration entry in `.mcp.json` for plug-and-play attachment to Claude Code, Gemini CLI, Cursor, and Windsurf.
- **Dual-Provider AI Engineering OS Contract**:
  - Full adapter support for Claude Code (`CLAUDE.md`, `.claude/`) and Gemini CLI (`GEMINI.md`, `.gemini/`).
  - Durable, living project memory contracts under `project-memory/` (`PROJECT.md`, `STATUS.md`, `DECISIONS.md`, `KNOWN_GAPS.md`, `RISK_REGISTER.md`, `TODO.md`, `HANDOFF.md`).
  - Strict safety gates preventing unapproved production modifications, destructive file actions, or secrets leakage.

### Release Verification and Packaging

- **Deterministic Release Packaging (`scripts/package-release.mjs`)**:
  - Automated release packaging utility producing reproducible release archives in `dist/` (`terraform-complete-guide-v1.0.0.tar.gz` and `terraform-complete-guide-v1.0.0.zip`).
  - Automatic exclusion of `.git`, `.terraform`, `node_modules`, `.terragrunt-cache`, temporary caches, and private artifacts.
  - Cryptographic SHA256 integrity manifest generation (`dist/checksums.sha256`).
- **Release Verification Checklist (`docs/RELEASE-CHECKLIST.md`)**: Complete pre-flight gate verification, artifact signing, rollback procedure, and human signoff workflow.
