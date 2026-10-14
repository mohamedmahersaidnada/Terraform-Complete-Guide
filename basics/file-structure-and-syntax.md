# File structure and syntax

## Objectives and prerequisites

Read blocks, arguments and expressions; recognize module boundaries. Complete [installation](intro-and-installation.md). Use the [local lab](../examples/local-basics/README.md), with no cloud credentials or charges.

## One directory, one module

Terraform combines the `.tf` files in the working directory. Filenames aid organization; `main.tf` does not execute before `variables.tf`. Nested directories are separate modules, loaded only through explicit module calls. The root module is where you run Terraform.

| File | Responsibility |
| --- | --- |
| `versions.tf` | CLI and provider requirements |
| `main.tf` | Resources and derived locals |
| `variables.tf` | Typed input interface and validation |
| `outputs.tf` | Values exposed to callers |
| `terraform.tfvars.example` | Sanitized sample, not automatically loaded |
| `.terraform.lock.hcl` | External provider selections and hashes when present |

The built-in provider lab needs no external provider lock entry. Commit intentional root lockfiles, but never private state, saved plans or secrets.

## Read HCL

The [canonical lab files](../examples/local-basics/) contain the complete configuration. This teaching fragment illustrates syntax:

```hcl
resource "terraform_data" "example" {
  input = { name = "hello-terraform-dev" }
}
```

`resource` is the block type; the labels identify its type and local name. `input` is an argument containing an object expression. A reference such as `terraform_data.example.output.name` is an expression, not a quoted literal. Comments use `#` or `//`.

## Exercise and expected result

From the lab, in either shell:

```sh
terraform init
terraform fmt -check
terraform validate
```

Expect formatting success and valid configuration. In a disposable copy, move the resource block to another `.tf` file in the same directory without duplicating it. Validate again. Rationale: same-directory files are combined, so the address stays unchanged. Moving the block to an uncalled subdirectory instead removes it from the root and could propose destruction.

## Troubleshooting and cleanup

Duplicate-resource errors usually mean a block was copied rather than moved. Unsupported arguments concern block schemas, not indentation. Validation does not prove cloud permissions or affordability. These checks create no resources; if you applied the earlier lab, run `terraform destroy` there and check an empty `terraform state list`. Restore exercise edits before [providers and resources](../core-concepts/providers-and-resources.md).

## References and verification

Reviewed 2026-09-29 for Terraform 1.14.8; see [execution evidence](../docs/phase2-evidence.md). Sources: [file structure](https://developer.hashicorp.com/terraform/language/files), [style](https://developer.hashicorp.com/terraform/language/style).
