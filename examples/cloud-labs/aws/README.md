# AWS Cloud Lab: Secure Storage with Mandatory Governance Tags

## Overview and purpose

This lab provisions a secure, free-tier AWS S3 storage baseline configured with versioning, server-side AES-256 encryption, and public access blocks. It enforces mandatory organizational tags (`Environment`, `ManagedBy`, `CostCenter`, `Owner`) across all resources to ensure budget tracking and teardown accountability.

This configuration targets Terraform `~> 1.14.0` and the HashiCorp AWS provider `~> 5.80.0`.

## Architecture and cost boundaries

- **AWS S3 Bucket**: Standard storage class within the AWS Free Tier (5 GB standard storage, 20,000 GET requests, 2,000 PUT requests per month).
- **Encryption**: SSE-S3 (`AES256`) is used instead of customer-managed KMS keys to avoid the \$1.00/month AWS KMS key charge.
- **Random ID**: Ensures globally unique bucket naming without namespace collisions.
- **Teardown Safety**: Configured with `force_destroy = true` so all objects and versions can be completely deleted during `terraform destroy`.

## Mandatory tagging contract

All resources must carry the following tags:

| Tag Name | Allowed / Default Values | Purpose |
| --- | --- | --- |
| `Environment` | `sandbox`, `dev`, `test` | Isolate sandbox infrastructure from production |
| `ManagedBy` | `Terraform` | Identifies infrastructure as code automation |
| `CostCenter` | `training` | Allocates cloud billing to educational cost centers |
| `Owner` | `cloud-lab-user` | Direct accountability for teardown and sweepers |

## Safety warning and prerequisites

> [!WARNING]
> While this lab is designed to remain within the AWS Free Tier, cloud providers bill for any usage exceeding free-tier allowances. Always execute the destruction steps immediately upon completing your exercises. Do not leave cloud resources unattended.

Prerequisites:
- AWS CLI configured with active credentials (`aws configure` or `aws sso login`).
- IAM permissions allowing S3 bucket creation, tagging, and deletion.
- AWS region set (defaults to `us-east-1`).

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

Review the outputs to confirm bucket name and mandatory tags.

## Teardown and residual verification

### 1. Destroy resources

When you have finished the exercise, immediately run:

```shell
terraform destroy -auto-approve
```

### 2. Verify zero residual resources

Verify that no orphaned buckets or objects remain:

```shell
aws s3 ls
```

If the bucket name appears in the listing, verify its deletion status via:

```shell
aws s3api head-bucket --bucket <BUCKET_NAME>
```

A `404 Not Found` response confirms complete teardown.
