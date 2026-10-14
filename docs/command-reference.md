# Beginner command reference

Prerequisite: Terraform 1.14.8 installed and a working directory containing a reviewed configuration. Commands below are identical in PowerShell and POSIX shells. Reference companion to the [local lab](../examples/local-basics/README.md), where they require no cloud account. With other configurations, plans may contact APIs and applies/tests may create billable resources.

| Command | Purpose and expected result |
| --- | --- |
| `terraform version` | Display actual CLI version |
| `terraform init` | Initialize backend/modules/providers; can access the network |
| `terraform fmt -check` | Fail if formatting differs from Terraform's style |
| `terraform validate` | Check configuration consistency, not deployment permissions |
| `terraform plan -out=reviewed.tfplan` | Save a plan privately for review/apply |
| `terraform apply reviewed.tfplan` | Execute that plan without another confirmation prompt |
| `terraform output -raw name` | Print a scalar output after apply |
| `terraform output -json` | Structured output; may expose sensitive values |
| `terraform state list` | List recorded resource addresses |
| `terraform test` | Run test definitions; apply-mode tests can create resources |
| `terraform destroy` | Propose and, after approval, destroy managed objects |

Exercise: run an unchanged `terraform plan -detailed-exitcode` after the local apply. Expect 0; changes return 2 and errors return 1. Read `$LASTEXITCODE` in PowerShell or `$?` in POSIX immediately after the command. Cleanup: destroy the lab and verify an empty state list. For missing outputs check that apply succeeded in the same directory/workspace.

Reviewed 2026-09-29, Terraform 1.14.8; [evidence](phase2-evidence.md). See [official CLI documentation](https://developer.hashicorp.com/terraform/cli/commands).
