# Expressions, iteration and lifecycle

## Objectives and prerequisites

After [variables and outputs](variables-and-outputs.md), derive values with locals, distinguish collection expressions from resource iteration, and predict lifecycle changes. Use the [cloud-free local lab](../examples/local-basics/README.md) with Terraform 1.14.8. No cloud credentials or costs apply.

## Expressions and locals

The lab's `local.name` interpolates two strings. Locals name expressions; they do not store independent mutable values. References create dependency edges, so file order does not control execution. A data source reads existing information through a provider; its values can remain unknown until apply if its dependencies are unknown. Do not force dependencies where a direct value reference already expresses them.

From the lab directory run:

```sh
terraform console
```

Evaluate these expressions one at a time:

```hcl
local.name
[for name in ["api", "worker"] : upper(name)]
{ for name in ["api", "worker"] : name => "${name}-dev" }
var.environment == "prod" ? "strict" : "learning"
```

Expect `hello-terraform-dev`, a tuple containing `API` and `WORKER`, a map with `api-dev` and `worker-dev`, and `learning` for default inputs. Enter `exit` to leave the console.

## Iteration and identity

A `for` expression transforms data. Resource `for_each` creates instances keyed by a known map or set of strings; stable business keys avoid index shifts. `count` creates numeric addresses, so removing a middle list element can change which object an index represents. Keys must be known before remote operations and must not be sensitive. Changing keys can propose destroy/create operations; review the plan and use explicit migration when preserving identity.

## Lifecycle exercise and rationale

Apply the local lab, then run the following in either shell:

```sh
terraform plan -var="project=renamed"
terraform plan -replace=terraform_data.example
```

The first proposes an in-place input update. The second explicitly proposes replacement. Do not apply the replacement merely to resolve an unexplained error. `create_before_destroy` reverses replacement order when supported, but can conflict with unique names or quotas. `prevent_destroy` rejects planned destruction while configured; removing the resource configuration removes that protection. `ignore_changes` transfers responsibility for selected changes and can hide drift. These are deliberate ownership choices, not default fixes.

Explain why changing the project input need not rename a resource address. Solution: values and Terraform's configuration address are different identities; here the address remains `terraform_data.example`.

## Troubleshooting and cleanup

Unknown `for_each` keys require redesigning keys around configuration-known values. Dependency cycles require removing a circular value relationship. Exit the console before other state operations. Run `terraform destroy` in the lab and confirm `terraform state list` is empty.

## References and verification

Reviewed 2026-09-29 for Terraform 1.14.8; [local execution evidence](../docs/phase2-evidence.md). Iteration and lifecycle policies here are reference guidance, not additional infrastructure labs. Sources: [expressions](https://developer.hashicorp.com/terraform/language/expressions), [for_each](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each), [lifecycle](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle), [data sources](https://developer.hashicorp.com/terraform/language/data-sources).

