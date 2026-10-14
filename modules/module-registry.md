# Using module registries and source types

## Objectives and prerequisites

Understand how to discover, consume, version, and authenticate against public and private module registries and remote Git sources. Prerequisites: [creating modules](creating-modules.md) and [file structure and syntax](../basics/file-structure-and-syntax.md).

## Supported module sources

Terraform supports multiple module source protocols:

| Source Type | Example Syntax | When to Use |
| --- | --- | --- |
| **Local File Path** | `./modules/vpc` or `../shared/storage` | Tightly coupled modules within the same repository |
| **Public Registry** | `terraform-aws-modules/vpc/aws` | Community verified modules with broad ecosystem testing |
| **Private Registry** | `app.terraform.io/my-org/network/aws` | Enterprise modules with internal compliance controls |
| **Git HTTPS / SSH** | `git::https://github.com/org/repo.git?ref=v1.2.0` | Direct source control consumption without a registry |
| **Generic S3 / GCS** | `s3::https://s3-eu-west-1.amazonaws.com/my-bucket/mod.zip` | Packaged artifact archives in private cloud storage |

## Module registry curation and provenance

Using third-party modules introduces external supply-chain dependencies. Follow these enterprise practices:
1. **Verify Provenance & License**: Ensure the module author is reputable, active, and licensed compatibly with your organization.
2. **Review Module Code**: Inspect the source repository for embedded provisioners, unexpected IAM privileges, or unpinned child module references.
3. **Internal Mirroring**: For mission-critical environments, fork or vend third-party modules into private repositories to insulate against upstream deletion or malicious modifications.

## Version constraints and pinning

Registry sources support the `version` argument, which enforces semantic version constraints:

```hcl
module "network" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.1.0" # Allows 5.1.x, prevents breaking 5.2.0+ or 6.0.0

  name = "prod-vpc"
  cidr = "10.0.0.0/16"
}
```

For Git sources, always append the `?ref=` query parameter pointing to an immutable Git tag or commit SHA rather than a floating branch:

```hcl
module "database" {
  source = "git::https://github.com/example-corp/tf-db.git?ref=v2.4.1"
}
```

## Exercise and expected result

Compare module source syntax and version resolution rules:

```shell
terraform version
```

In a scratch directory, inspect how `terraform init` retrieves modules from local versus remote sources. Verify that:
1. Local modules (`./path`) are referenced directly via symlink or relative path.
2. Remote modules download an isolated snapshot into `.terraform/modules/<module_name>`.

Rationale: Local paths allow rapid iteration during development; remote versioned sources ensure immutable, repeatable releases in CI/CD pipelines.

## Troubleshooting and cleanup

| Symptom | Cause | Remediation |
| --- | --- | --- |
| `Error: Failed to download module` | Authentication failure or invalid Git URL | Verify SSH agent keys or personal access tokens |
| `version argument is not supported for local modules` | Attempting to set `version = "..."` on `./` paths | Remove the `version` argument; local directories cannot have version constraints |
| `Checksum verification failed` | Modified upstream release or compromised cache | Clear `.terraform/modules` and re-run `terraform init` |

## References and verification

Reviewed 2026-10-11 for Terraform 1.14.8; see [curriculum evidence](../docs/curriculum-evidence.md).
- [Terraform Module Sources](https://developer.hashicorp.com/terraform/language/modules/sources)
- [Public Terraform Registry](https://registry.terraform.io/)
- [Private Module Registry Protocol](https://developer.hashicorp.com/terraform/internals/module-registry-protocol)