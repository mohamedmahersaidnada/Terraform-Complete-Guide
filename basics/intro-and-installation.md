# Introduction and installation

## Objectives and prerequisites

Install Terraform and complete a cloud-free lifecycle. You need a terminal, editor and this repository. Downloading the CLI needs internet access; the [local lab](../examples/local-basics/README.md) needs no cloud credentials and creates no billable resources.

## Installation and workflow

Use the [official installer or binary archive](https://developer.hashicorp.com/terraform/install) for your operating system and architecture. Select Terraform **1.14.8** to reproduce our baseline, verify the published checksum, extract the executable and add its directory to PATH. Package managers can choose newer versions; check the actual binary.

PowerShell:

```powershell
Get-Command terraform
terraform version
```

POSIX shell:

```sh
command -v terraform
terraform version
```

Configuration describes desired objects. Terraform compares it with state and provider observations, proposes changes, and applies approved operations. State connects configuration addresses to managed objects; retain it until those objects are destroyed. Plans can read remote APIs and are not universally offline.

From the repository root, these commands work in both shells:

```sh
cd examples/local-basics
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
terraform output
```

Read the plan before entering `yes`. A fresh default run creates one `terraform_data.example` state object and outputs the name `hello-terraform-dev`. It does not create a server. Run another plan with unchanged inputs: expect no changes.

## Exercise and rationale

Why does a second apply not create another resource? State already connects the configured address to an existing object, so Terraform converges on the same result. Run `terraform state list` and find that address.

## Troubleshooting and cleanup

If the executable is missing, reopen the terminal after updating PATH. If no configuration is found, check that you are inside the lab directory. A version-constraint error means the resolved executable is outside the lab's range.

```sh
terraform destroy
terraform state list
```

Approve destruction of this disposable lab. Expect one removed resource and an empty list. Local state/backup files may remain; keep them private. Continue with [file structure](file-structure-and-syntax.md).

## References and verification

Reviewed 2026-09-29. Terraform 1.14.8 baseline; see [execution evidence](../docs/phase2-evidence.md). Sources: [installation](https://developer.hashicorp.com/terraform/install), [init](https://developer.hashicorp.com/terraform/cli/commands/init), [plan](https://developer.hashicorp.com/terraform/cli/commands/plan).
