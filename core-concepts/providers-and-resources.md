# Providers and resources

## Objectives and prerequisites

Distinguish providers, resources and data sources; explain dependency ordering. Complete [file structure](../basics/file-structure-and-syntax.md). The [local lab](../examples/local-basics/README.md) uses the built-in provider, no cloud credentials and no billable infrastructure.

## Providers and ownership

Providers implement operations for APIs and services. `required_providers` declares source addresses and acceptable versions; a `provider` block configures an instance, such as its region. Use the provider's documented authentication chain. Backend authentication and provider authentication are separate.

Initialization installs external providers and records selections in a lockfile. The built-in `terraform_data` resource needs no download. It demonstrates lifecycle and state without external infrastructure.

A managed resource expresses an object Terraform owns. A data source reads information managed elsewhere, such as an existing network. Data reads may need credentials and contact APIs during planning, or be deferred until apply when inputs are unknown. This lab omits external data sources to stay cloud-free.

## Addresses and dependencies

The lab's address is `terraform_data.example`. Its `input` supplies values and `output` exposes results. An output expression referencing the resource establishes a dependency automatically. Terraform follows value relationships rather than file order. Use `depends_on` only for hidden behavioral dependencies that cannot be expressed through a value reference.

## Exercise and expected result

In the lab directory, either shell:

```sh
terraform init
terraform plan
terraform apply
terraform state list
terraform output name
```

Expect one resource and `hello-terraform-dev` using defaults. Explain removing the resource block versus removing an output block. Rationale: the former proposes destroying its object; the latter stops exposing a value without itself destroying that object.

## Troubleshooting and cleanup

Provider installation failures can involve source addresses, constraints or connectivity. Check these before changing credentials. A dependency cycle means references form a loop; redesign the value flow instead of adding more explicit dependencies.

Run `terraform destroy` and confirm an empty `terraform state list`. Continue with [variables and outputs](variables-and-outputs.md).

## References and verification

Reviewed 2026-09-29 for Terraform 1.14.8; [execution evidence](../docs/phase2-evidence.md) distinguishes local from cloud tests. Sources: [built-in resource](https://developer.hashicorp.com/terraform/language/resources/terraform-data), [provider requirements](https://developer.hashicorp.com/terraform/language/providers/requirements), [data sources](https://developer.hashicorp.com/terraform/language/data-sources).
