# Terraform glossary

Reference companion to the [beginner path](learning-path.md); no executable lab is needed for these definitions. Reviewed 2026-09-29 against Terraform 1.14.8 language terminology.

| Term | Meaning |
| --- | --- |
| Root module | Configuration in the directory where Terraform operates |
| Child module | Configuration called through a module block |
| Provider | Plugin implementing resource and data-source operations |
| Resource | Managed object with an address and lifecycle |
| Data source | Read of information managed elsewhere |
| State | Mapping between configuration instances and managed objects, including stored attributes |
| Backend | Mechanism for state storage and, where supported, locking |
| Plan | Proposed changes derived from configuration, state and observations |
| Local | Named expression within a module |
| Output | Value exposed by a module |
| Drift | Difference between recorded/configured expectations and observed infrastructure |
| Lockfile | Selected external provider versions and package hashes |
| Workspace | CLI state selection; HCP Terraform uses the term for a broader run/configuration boundary |
| Idempotence | Repeating an unchanged desired configuration converges without adding duplicate objects |

Self-check: does a provider lockfile contain infrastructure state? No: dependency selection and state serve different purposes. Consult [Terraform language](https://developer.hashicorp.com/terraform/language) for authoritative terminology.
