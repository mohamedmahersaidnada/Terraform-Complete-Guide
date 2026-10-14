# Resource naming and tagging conventions

## Objectives and prerequisites

Establish consistent, predictable naming conventions for Terraform identifiers and cloud resources, implement mandatory resource tagging strategies, and automate compliance with TFLint. Prerequisites: [file structure and syntax](../basics/file-structure-and-syntax.md) and [providers and resources](../core-concepts/providers-and-resources.md).

## Terraform identifier naming conventions

Terraform block identifiers (resource names, variable names, output names, module names) should follow strict style rules:
1. **Use snake_case**: Always use lowercase alphanumeric characters with underscores (`my_vpc`, `app_cluster`), never camelCase or kebab-case.
2. **Do Not Repeat Resource Type in Name**:
   - Antipath: `resource "aws_s3_bucket" "s3_bucket" {}` or `resource "aws_vpc" "vpc" {}`
   - Good: `resource "aws_s3_bucket" "assets" {}` or `resource "aws_vpc" "primary" {}`
3. **Use Plural Names for Collections**: Use plural names for variables that are lists, sets, or maps (`subnet_ids`, `availability_zones`), and singular names for scalars (`environment`, `instance_type`).
4. **Descriptive Output Names**: Name outputs so their purpose is obvious to calling modules (`database_endpoint`, `vpc_cidr_block`).

## Cloud resource naming patterns

Cloud resource names should follow a predictable composable schema:
```text
[project]-[environment]-[region/zone]-[service/component]
```

Examples:
- `acme-prod-useast1-vpc`
- `acme-dev-euwest1-app-lb`
- `acme-staging-storage-assets`

Be mindful of cloud-specific naming constraints:
- **AWS S3**: Globally unique, 3–63 characters, lowercase letters, numbers, and hyphens only (no underscores).
- **Azure Storage Accounts**: Globally unique, 3–24 characters, lowercase alphanumeric **only** (no hyphens or underscores).
- **GCP Resources**: 1–63 characters, lowercase letters, numbers, and hyphens.

## Mandatory tagging and resource attribution

Tagging is essential for cost allocation, ownership attribution, lifecycle automation, and security scanning.

Recommended mandatory tag taxonomy:

| Tag Key | Example Value | Description |
| --- | --- | --- |
| `Environment` | `production`, `staging`, `development` | Target deployment tier |
| `Project` | `customer-portal`, `data-warehouse` | Project or product line |
| `ManagedBy` | `terraform` | Explicit IaC attribution |
| `Owner` | `team-platform@example.com` | Accountable team or contact email |
| `CostCenter` | `cc-9402` | Financial chargeback code |

Leverage default provider tags to apply standard tags across all resources automatically:

```hcl
provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "terraform-guide"
      ManagedBy   = "terraform"
    }
  }
}
```

## Automated enforcement with linters and policy

Enforce naming and tagging rules automatically in CI:
- **TFLint**: The root [.tflint.hcl](../.tflint.hcl) enables `terraform_naming_convention` to check resource and variable identifiers.
- **Checkov / Trivy**: Scans for missing required tags (`CKV_AWS_108` etc.).
- **Sentinel / OPA**: Denies `terraform apply` if mandatory tags (`Owner`, `Environment`) are absent.

## Exercise and expected result

Run TFLint across configurations to verify naming conventions:

```shell
tflint --config=.tflint.hcl --chdir=examples/local-basics
```

Expect exit code `0`. Try introducing a variable with camelCase (`myVariable`) in a test file and observe TFLint flag:
`variable "myVariable" should be formatted in snake_case`.

Rationale: Consistent naming makes large codebases searchable, reduces cognitive load, and enables reliable automated policy enforcement.

## Troubleshooting and cleanup

| Symptom | Cause | Remediation |
| --- | --- | --- |
| `InvalidBucketName: S3 bucket names cannot contain underscores` | Cloud naming rule violated | Use hyphens for cloud names; reserve underscores for Terraform HCL identifiers |
| Tag inheritance missing on resources | Resource type does not support tags | Check provider documentation; some sub-resources inherit from parent |
| TFLint naming convention error | Identifier uses uppercase or dashes | Rename identifier to use standard lowercase snake_case |

## References and verification

Reviewed 2026-10-11 for Terraform 1.14.8; see [curriculum evidence](../docs/curriculum-evidence.md).
- [HashiCorp Style Guide](https://developer.hashicorp.com/terraform/language/style)
- [AWS Default Tags](https://developer.hashicorp.com/terraform/tutorials/aws/aws-default-tags)
- [TFLint Naming Rule](https://github.com/terraform-linters/tflint-ruleset-terraform/blob/main/docs/rules/terraform_naming_convention.md)