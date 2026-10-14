# Variables and outputs

## Objectives and prerequisites

Supply typed inputs, reject invalid values and inspect outputs. Complete [providers and resources](providers-and-resources.md). Use [local-basics](../examples/local-basics/README.md); no cloud credentials or charges apply.

## Design an interface

Inputs separate reusable logic from environment choices. The lab accepts `project` (default `hello-terraform`, 3–32 lowercase letters, digits or hyphens) and `environment` (default `dev`, one of `dev`, `stage`, `prod`). Types catch structural mistakes; validation captures domain rules.

Locals name derived expressions. The lab combines project and environment into a name. Root outputs expose selected results; child outputs form module interfaces. Sensitive marking limits ordinary display, not all storage in state. Keep this exercise secret-free.

Defaults, environment variables, automatically loaded variable files and command-line assignments can supply values. Higher-precedence sources override lower ones; use one explicit nonsecret input file per run for reproducibility. A `.tfvars.example` file is not automatically loaded.

## Exercise and expected result

From the lab, in PowerShell or POSIX shells:

```sh
terraform init
terraform plan -var="project=workshop" -var="environment=stage"
terraform apply -var="project=workshop" -var="environment=stage"
terraform output -raw name
terraform plan -var="environment=invalid"
```

Expect `workshop-stage`; the last plan must fail validation. Why can a later plan without flags propose changes? Overrides apply only to the current command; subsequent runs fall back to defaults unless given the same values. Use a private variable file and `-var-file` consistently when persisting inputs.

Temporary environment overrides differ by shell:

```powershell
$env:TF_VAR_environment = 'stage'
terraform plan
Remove-Item Env:TF_VAR_environment
```

```sh
TF_VAR_environment=stage terraform plan
```

## Troubleshooting and cleanup

Unexpected inputs often come from `.auto.tfvars` files or leftover `TF_VAR_` variables. `output -raw` needs a scalar; use `-json` for structured automation, keeping sensitive values private.

Run `terraform destroy -var="project=workshop" -var="environment=stage"` and confirm an empty `terraform state list`. Continue with [expressions and lifecycle](expressions-and-lifecycle.md).

## References and verification

Reviewed 2026-09-29 for Terraform 1.14.8; see [execution evidence](../docs/phase2-evidence.md). Sources: [inputs and precedence](https://developer.hashicorp.com/terraform/language/values/variables), [outputs](https://developer.hashicorp.com/terraform/language/values/outputs).
