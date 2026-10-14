# Local basics lab

## Objectives and prerequisites

Practice a complete Terraform lifecycle with Terraform 1.14.8 on PATH. This lab uses only the built-in `terraform_data` resource: no cloud credentials, external provider downloads or billable resources. CLI installation requires network access. All supplied values are stored in local state; use nonsecret labels.

## Run and inspect

From the repository root, in PowerShell or a POSIX shell:

```sh
cd examples/local-basics
terraform init
terraform fmt -check
terraform validate
terraform plan -out=reviewed.tfplan
terraform apply reviewed.tfplan
terraform output -raw name
terraform state list
terraform plan -detailed-exitcode
```

Review the saved plan before applying: applying a saved plan does not ask for confirmation. Expect one state object, `terraform_data.example`, and name `hello-terraform-dev`. The final plan reports no changes and exits 0. With `-detailed-exitcode`, changes return 2 and an error returns 1. PowerShell exposes this through `$LASTEXITCODE`; POSIX shells use `$?`.

## Exercise and solution

Run `terraform plan -var="project=workshop" -var="environment=stage"`. Expect an update to the stored name, not a cloud deployment. Apply with the same flags to obtain `workshop-stage`. A plan using `-var="environment=invalid"` must fail. The validation rule permits only `dev`, `stage` and `prod`; labels do not isolate state or identities.

## Tests and cleanup

```sh
terraform test
terraform destroy
terraform state list
```

The tests apply disposable local state objects and check defaults, custom values and rejected inputs. Destroy the manual lab and expect an empty state list. State backups and the saved plan can still contain input values; keep them private. Remove the reviewed plan after use. If you changed inputs, pass the same flags to destroy.

If Terraform reports a version mismatch, check `terraform version`. If output is absent, apply first. Run commands inside this directory. The [automated lifecycle check](../../scripts/check-local-lifecycle.mjs) uses a fresh temporary copy and verifies cleanup.

## References and verification

Reviewed 2026-09-29, Terraform 1.14.8 on Windows; [evidence](../../docs/phase2-evidence.md). Resource pattern follows the official [terraform_data reference](https://developer.hashicorp.com/terraform/language/resources/terraform-data). Continue through the [learning path](../../docs/learning-path.md).
