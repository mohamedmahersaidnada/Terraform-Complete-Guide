# Secrets management in Terraform

## Objectives and prerequisites

Learn how to handle credentials, tokens, and private keys securely in Terraform, understand state file exposure risks, and integrate external secrets managers. Prerequisites: [variables and outputs](../core-concepts/variables-and-outputs.md) and [state management](../state/state-management.md).

## The secret exposure problem in IaC

A common misunderstanding in Terraform is assuming that marking a variable `sensitive = true` encrypts it:
- The `sensitive = true` flag **only redacts values from CLI terminal output and plan logs**.
- **The raw unencrypted value is still written to the Terraform state file (`terraform.tfstate`) in plain text!**

Therefore, anyone with read access to the state backend (S3 bucket, Azure Blob container, GCS bucket) can extract all secrets managed by that configuration.

```mermaid
flowchart LR
  VAR[Sensitive Variable] --> PLAN[CLI Plan Output: REDACTED]
  VAR --> STATE[State File: PLAINTEXT STORAGE]
  STATE --> LEAK{Unprotected Backend = Secret Exposure}
```

## Marking variables and outputs as sensitive

Always flag secret variables and outputs as sensitive to prevent terminal and CI log leakage:

```hcl
variable "database_password" {
  type        = string
  description = "Administrative password for the database cluster."
  sensitive   = true
}

output "db_connection_string" {
  value       = "postgres://admin:${var.database_password}@db.example.com:5432/app"
  description = "Database connection URL."
  sensitive   = true
}
```

If an expression references a sensitive variable, Terraform automatically marks the resulting attribute or output as sensitive.

## External secret managers integration

Instead of passing static secrets into Terraform, fetch them dynamically or delegate secret creation to cloud services:

1. **HashiCorp Vault**: Read dynamic, short-lived tokens using the Vault provider:
   ```hcl
   data "vault_generic_secret" "api_key" {
     path = "secret/data/payment-api"
   }
   ```
2. **AWS Secrets Manager / Azure Key Vault / GCP Secret Manager**: Read pre-existing secret references, or create the container in Terraform while letting an external service generate the secret value.
3. **Random Provider**: Generate high-entropy passwords directly in HCL:
   ```hcl
   resource "random_password" "db_pass" {
     length  = 32
     special = true
   }
   ```

## Ephemeral credentials and OIDC

Avoid long-lived API keys (`AWS_ACCESS_KEY_ID`, Service Account JSON keys). Use OpenID Connect (OIDC) Workload Identity Federation in CI/CD pipelines (GitHub Actions, GitLab CI, Azure DevOps):
- The CI runner requests a short-lived token signed by the CI provider.
- Cloud IAM validates the token and issues a temporary STS session token (15–60 minutes).
- Zero credentials are saved on disk or in repository secrets.

## Exercise and expected result

Inspect how Terraform handles sensitive output redaction:

```shell
terraform init
terraform plan
```

Observe that values flagged `sensitive = true` display `(sensitive value)` in the terminal output instead of raw credentials.

Rationale: Log redaction protects against exposure in CI build logs, terminal recording sessions, and public pull request comments.

## Troubleshooting and cleanup

| Symptom | Cause | Remediation |
| --- | --- | --- |
| `Output refers to sensitive values` | Declared output references sensitive data without `sensitive = true` | Add `sensitive = true` to the `output` definition block |
| Secret committed to Git | Developer pushed a `.tfvars` file or inline key | Rotate the credential immediately; remove file and purge Git history |
| Plaintext secret visible in state | Normal Terraform behavior | Restrict backend access with strict IAM RBAC and customer-managed encryption (CMEK/KMS) |

## References and verification

Reviewed 2026-10-11 for Terraform 1.14.8; see [curriculum evidence](../docs/curriculum-evidence.md).
- [Sensitive Data in State](https://developer.hashicorp.com/terraform/language/state/sensitive-data)
- [Input Variable Sensitive Flag](https://developer.hashicorp.com/terraform/language/values/variables#suppressing-values-in-cli-output)
- [HashiCorp Vault Provider](https://registry.terraform.io/providers/hashicorp/vault/latest/docs)