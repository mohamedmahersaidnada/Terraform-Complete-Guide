# Backend configuration reference and pilot contract

## Objectives and prerequisites

These partial templates target Terraform 1.14.x and create no infrastructure. Storage, identities and network routes must already exist. Assign a state owner, retention policy, runner route and cost budget. Review date: 2026-10-05; [evidence and limitations](../../docs/state-security-evidence.md). No cloud lock or restore test has been executed.

Use a disposable pilot root outside the checkout with one backend declaration, for example `terraform { backend "s3" {} }`. Partial files contain attributes directly, without wrapping blocks. Keep credentials in approved identity mechanisms.

## S3 schema

[s3.hcl.example](s3.hcl.example) uses `bucket`, `key`, `region`, `encrypt` and `use_lockfile`. Replace the bucket placeholder. Default-workspace access requires prefix-scoped bucket listing, state GetObject/PutObject, and GetObject/PutObject/DeleteObject on the same key plus `.tflock`. State DeleteObject is unnecessary for normal default-workspace operations. Non-default workspaces add paths under `workspace_key_prefix` (default `env:`); scope those separately. Customer-managed KMS keys require their own authorized key policy and permissions. DynamoDB locking is deprecated in 1.14; do not introduce it for new roots.

Use an approved local AWS profile or a federated CI role. Profile selection differs by shell:

```powershell
$env:AWS_PROFILE = 'terraform-pilot'
```

```sh
export AWS_PROFILE=terraform-pilot
```

## AzureRM schema

[azurerm.hcl.example](azurerm.hcl.example) uses `storage_account_name`, `container_name`, `key`, `use_azuread_auth = true` and `use_cli = true`. This is an interactive CLI-user configuration. The backend requires storage **data-plane** access; management-plane Contributor alone is insufficient. Scope Storage Blob Data Contributor to the intended container. Standard endpoints are derived from storage names; endpoint lookup options require additional management-plane settings and permission.

Local setup commands, identical in both shells, are `az login --tenant TENANT_ID` and `az account set --subscription SUBSCRIPTION_ID`. These change local CLI credentials and are instructions only. For CI use configured federation with `use_oidc`, `client_id`, `tenant_id` and `use_azuread_auth`, replacing CLI authentication. Establish token issuance/trust first. Do not copy CLI sessions or bypass role errors using storage account keys.

## GCS schema

[gcs.hcl.example](gcs.hcl.example) uses `bucket` and `prefix`, not S3's `key`. Use an existing versioned bucket. The documented baseline is Storage Object Admin on that bucket; narrower custom permissions require their own tested contract. Local ADC setup is `gcloud auth application-default login`, which is distinct from `gcloud auth login`. CI should use federation or an attached identity. Google provider impersonation does not configure backend impersonation automatically.

## Pilot commands and expected result

Copy one template into the disposable root as `backend.hcl` and replace all placeholders. From that root, both shells:

```shell
terraform init -backend-config=backend.hcl
terraform validate
terraform state list
```

Expect successful initialization and no managed addresses for a new empty location. Nonempty inventory is a stop condition until its owner confirms the location. Commands contact cloud storage; they are not recorded test evidence. Existing state must use the [migration procedure](../../state/state-management.md), not blind reconfiguration.

## Validation, troubleshooting and cleanup

Record scoped identity, initial state location, contention, version restoration, no-change plan and final empty inventory. Test denied access with an unauthorized pilot identity. Init failures require checking backend credentials separately from provider credentials, then storage scope and connectivity. Do not weaken TLS or disable locking.

Cleanup includes pilot workloads and dedicated state versions under the retention policy. Shared buckets/accounts are excluded. Retained versions can incur cost after destroy. End only temporary sessions owned by the pilot; do not revoke unrelated credentials.

Exercise: why does validate not approve a backend for production? **Rationale:** it does not prove remote IAM, network routes, locking, retention or recovery.

## Primary references

- [S3 schema 1.14](https://developer.hashicorp.com/terraform/language/v1.14.x/backend/s3)
- [AzureRM schema 1.14](https://developer.hashicorp.com/terraform/language/v1.14.x/backend/azurerm)
- [GCS schema 1.14](https://developer.hashicorp.com/terraform/language/v1.14.x/backend/gcs)
- [Google ADC and CLI distinction](https://docs.cloud.google.com/docs/authentication/application-default-credentials)
