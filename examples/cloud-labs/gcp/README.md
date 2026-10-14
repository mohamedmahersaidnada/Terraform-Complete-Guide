# GCP Cloud Lab: Cloud Storage Bucket with Governance Labels

## Overview and purpose

This lab provisions a secure Google Cloud Storage (GCS) bucket within the standard free-tier allowance. It enforces mandatory organizational labels (`environment`, `managed_by`, `cost_center`, `owner`) across the provider and bucket to ensure cost transparency, resource attribution, and automated teardown.

This configuration targets Terraform `~> 1.14.0` and the HashiCorp Google provider `~> 6.14.0`.

## Architecture and cost boundaries

- **Google Cloud Storage (GCS)**: Standard storage in multi-region `US`, which includes 5 GB-months of free storage within GCP's Always Free tier.
- **Security Baseline**: Uniform bucket-level access is enabled to prevent legacy object ACL sprawl; object versioning is enabled.
- **Teardown Safety**: Configured with `force_destroy = true` so all objects and versions are purged during `terraform destroy`.
- **Random ID**: Guarantees a globally unique bucket name across the Google Cloud ecosystem.

## Mandatory tagging and labeling contract

Google Cloud labels require lowercase alphanumeric characters, dashes, and underscores:

| Label / Tag Name | Value | Purpose |
| --- | --- | --- |
| `environment` | `sandbox`, `dev`, `test` | Isolates training workloads from production projects |
| `managed_by` | `terraform` | Identifies Infrastructure-as-Code automation |
| `cost_center` | `training` | Directs billing data to training cost centers |
| `owner` | `cloud-lab-user` | Assigns accountability for resource lifecycle |

## Safety warning and prerequisites

> [!WARNING]
> While this storage bucket operates under the GCP Free Tier, project-level network egress or excessive operations can generate charges. Always destroy your resources immediately after completing your exercises.

Prerequisites:
- Google Cloud SDK (`gcloud`) installed and authorized:
  ```shell
  gcloud auth application-default login
  ```
- An active GCP project with billing enabled. Set your project ID via:
  ```shell
  export TF_VAR_gcp_project_id="your-sandbox-project-id"
  ```
  or on Windows PowerShell:
  ```powershell
  $env:TF_VAR_gcp_project_id = "your-sandbox-project-id"
  ```

## Execution lifecycle

### 1. Initialize the lab

```shell
terraform init
```

### 2. Review execution plan

```shell
terraform plan -out=tfplan
```

### 3. Apply changes

```shell
terraform apply tfplan
```

Review outputs to confirm bucket name and assigned labels.

## Teardown and residual verification

### 1. Destroy resources

When your lab session concludes, immediately execute:

```shell
terraform destroy -auto-approve
```

### 2. Verify zero residual resources

Verify that the bucket has been deleted from your GCP project:

```shell
gcloud storage buckets list --filter="name:tf-guide-lab"
```

An empty output confirms that all cloud storage resources were cleanly removed.
