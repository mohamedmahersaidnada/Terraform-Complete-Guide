# State security and recovery evidence

Evidence date: 2026-10-07. This record documents state management security, backend isolation, migration safety, and local disaster recovery verification.

## Objectives and scope

State files map real-world infrastructure to declarative configuration. State security requires:
- Protecting sensitive data stored within state files (e.g., resource attributes, generated passwords, private keys).
- Enforcing mandatory state locking during mutation to prevent concurrency races.
- Ensuring cryptographic integrity and versioning for state backends.
- Verifying deterministic recovery drills without losing resource IDs or lineage.

## Verification results

The state migration and disaster recovery harness has been locally executed and validated:

```shell
node scripts/check-state-recovery.mjs
```

Results observed on Windows with Terraform 1.14.8:
- **Lineage preservation**: Verified that state migration between backends maintains consistent `lineage` and resource addresses (`terraform_data.record`).
- **Simulated loss and push recovery**: Verified state restoration using `terraform state push` from a verified backup after simulated state file loss.
- **Drift verification**: `terraform plan -detailed-exitcode` exited with code `0`, confirming zero drift after state restoration.
- **Fixture cleanup**: Isolated temporary fixtures were cleaned up completely after test execution.

## Backend configuration and controls

Production deployments require remote backends with strict identity separation:

| Cloud Backend | Placement | Encryption & Versioning | Access Controls |
| --- | --- | --- | --- |
| AWS S3 | Encrypted bucket + S3 Lockfile | SSE-KMS, Object Versioning, Bucket Key | IAM Least-Privilege, Bucket Policy, VPC Endpoint |
| Azure Blob Storage | Storage Account Container | Customer-Managed Key (CMK), Blob Versioning | Entra ID RBAC (`Storage Blob Data Contributor`), Private Endpoint |
| Google Cloud Storage (GCS) | Cloud Storage Bucket | Cloud KMS CMEK, Object Versioning | Scoped Service Account IAM, Workload Identity Federation |

Reference partial configurations are maintained in [the backends example directory](../examples/backends/README.md).

## Threat model and limits

State files must never be stored in version control or world-readable storage. The local test harness exercises isolated `terraform_data` fixtures without external cloud credentials. Cloud-hosted backend locking and failover scenarios require authorized sandbox testing before production release.

## Related documentation and references

- [State management](../state/state-management.md)
- [Remote backends](../state/remote-backends.md)
- [Local basics example](../examples/local-basics/README.md)
- [Baseline evidence](r1-evidence.md)
