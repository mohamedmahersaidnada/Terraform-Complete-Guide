# Security Architecture

Security model, defense-in-depth principles, trust boundaries, and controls for the Terraform Complete Guide.

## Assets

The system protects the following critical assets:

1. **Source Code & Documentation**: Integrity of educational lessons, module definitions, and verification scripts.
2. **Infrastructure Definitions (IaC)**: Hardened, production-grade HCL templates free of security antipatterns.
3. **Credentials & Secrets**: Cloud API tokens, IAM role session credentials, and SSH keys (strictly prohibited from being stored in the repository).
4. **State Storage & Backends**: Infrastructure state mappings containing resource addresses and configuration parameters.
5. **AI Agent Integration**: Bounded tool execution scopes and sandboxed MCP servers preventing arbitrary remote code execution or secret exfiltration.

## Trust boundaries

The security architecture establishes explicit perimeter boundaries:

- **Untrusted External Content**: Web content, user comments, external issues, and pull request inputs are treated as untrusted and cannot trigger elevated cloud credentials.
- **Local Isolation Perimeter**: Developer machines and CI workers run test fixtures inside temporary scratch spaces (`tmpdir`) with zero persisted state or network listeners.
- **Cloud Provider Perimeter**: Cloud deployments (AWS, Azure, GCP) exist in segregated, short-lived sandbox accounts with explicit least-privilege IAM scopes.
- **Agent Boundary**: AI coding agents operate under read-only guidance via MCP; human approval is mandatory for production mutations, IAM modifications, and releases.

## Identity and access

1. **GitHub Actions CI**:
   - Workflows specify explicit top-level read-only permissions (`permissions: contents: read`).
   - Write permissions for contents, packages, or id-tokens are forbidden on baseline PR validation jobs.
   - Credentials are not persisted on runners (`persist-credentials: false`).

2. **Cloud Provider Authentication**:
   - Production cloud operations require OpenID Connect (OIDC) Workload Identity Federation rather than long-lived static API access keys.
   - Provider authentication is strictly separated from backend state storage authentication.

## Secrets

- **Zero Secrets in Git**: Enforced by pre-commit policies and automated scanning in `scripts/check-security.mjs`.
- **Blocked File Types**: Scans reject `.env`, `*.tfvars`, `*.tfstate`, `*.pem`, `*.key`, `credentials.json`, and `application_default_credentials.json`.
- **Pattern Detection**: Automated detection of AWS access keys (`AKIA...`), GitHub personal access tokens (`ghp_...`), Google API keys (`AIza...`), and private key blocks (`-----BEGIN ... PRIVATE KEY-----`).

## Data protection

- **At-Rest Encryption**: In cloud environments, remote backends mandate SSE-KMS (AWS S3), Customer-Managed Keys (Azure Blob), or Cloud KMS (Google Cloud Storage).
- **In-Transit Encryption**: All remote communication with cloud APIs and state backends occurs exclusively over TLS 1.3/1.2.
- **State Sanitization**: State fixtures are cleaned up immediately following test completion to prevent sensitive data lingering on local disks.

## Network exposure

- The repository and its tools expose zero inbound listening ports or public network daemons.
- The `terraform-guide` MCP server operates exclusively over standard I/O (`stdio`), eliminating network attack vectors.
- CI workflows run in hardened virtual runner environments with no incoming internet exposure.

## Supply chain

- **GitHub Actions**: Every third-party GitHub Action must be pinned to an exact 40-character SHA hash rather than a mutable tag.
- **Node.js Dependencies**: The core repository uses zero runtime `npm` dependencies, relying solely on built-in Node.js standard libraries. Any future `package.json` mandates an HTTPS-resolved `package-lock.json` with cryptographic integrity hashes.
- **Terraform Providers**: Production modules require explicit version constraints and `.terraform.lock.hcl` dependency lockfiles with cross-platform provider hashes.

## Threats and mitigations

| Threat | Impact | Mitigation |
| --- | --- | --- |
| Accidental commit of cloud credentials | Unauthorized cloud account access | `scripts/check-security.mjs` pre-commit gate, `.gitignore` exclusions |
| Malicious pull request action injection | CI runner compromise or secret exfiltration | Read-only workflow permissions, pinned action SHAs, no `pull_request_target` usage |
| Concurrent state mutation / corruption | Infrastructure drift and race conditions | Mandatory state locking (`.tflock`, blob lease, DynamoDB table lock) |
| Prompt injection via external documentation | Agent manipulation | `core/OPERATING_SYSTEM.md` contract; MCP outputs labeled untrusted data |

## Security verification

Security controls are verified automatically across all environments:

```shell
node scripts/check-security.mjs
```

In addition to static offline scans, release pipelines require independent secret scanning, dependency vulnerability triage, and workflow syntax verification with Actionlint.
