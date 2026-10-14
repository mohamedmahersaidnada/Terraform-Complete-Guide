# Phase 2 verification evidence

Completed 2026-09-29. Baseline: Terraform 1.14.8 on Windows amd64, Node.js 26.10.0, PowerShell. The four original basics/core lessons and the expressions/lifecycle extension are reviewed. Learning path, glossary, command reference, local lab instructions and manifest contract are present.

## Executed checks

| Check | Result |
| --- | --- |
| `node --test scripts/check-examples.test.mjs` | 9/9 pass: accepted manifest, empty/missing inventory, duplicate/unlisted roots, traversal, absent lesson, invalid local classification, cleanup boundary |
| `node scripts/check-examples.mjs` | One root passed format, backend-disabled init, validate and four native Terraform tests |
| `node scripts/check-local-lifecycle.mjs` | Saved plan applied; expected outputs verified; unchanged plan exit 0, changed plan exit 2, invalid input exit 1; destroy succeeded and state list was empty |
| Independent lifecycle rerun | Parent agent independently confirmed the same lifecycle and cleanup results |
| Git Bash on Windows lifecycle | `node scripts/check-local-lifecycle.mjs` passed when launched from Git Bash |
| `node scripts/check-docs.mjs` | 37 Markdown files checked, zero errors |

The first Node subprocess attempts were blocked by sandbox EPERM; approved reruns completed successfully. Only the built-in `terraform_data` provider executes. No cloud credentials or billable infrastructure were needed. Native tests validate default/custom outputs and reject project/environment inputs. Temporary fixtures are removed only after checking their absolute parent and generated prefix. The lifecycle harness preserves state if destroy fails.

## Scope and limitations

Windows is the executed operating system. The automated lifecycle also passes from Git Bash on Windows, but the full interactive POSIX walkthrough and Linux/macOS execution are unverified. A configured CI matrix is not a completed hosted run. No cloud integration claim is made. Iteration, data sources and lifecycle policies are reference guidance; the local resource lifecycle is the executable beginner fixture. The accepted CLI constraint permits later 1.x releases, but this evidence covers only 1.14.8. Test classification requires code review and does not sandbox arbitrary Terraform code.

Sources reviewed: [terraform_data](https://developer.hashicorp.com/terraform/language/resources/terraform-data), [Terraform tests](https://developer.hashicorp.com/terraform/cli/commands/test), [expressions](https://developer.hashicorp.com/terraform/language/expressions), [for_each](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each), and [lifecycle](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle). Current reference pages default to 1.16; executable configurations use the established 1.14-compatible `input`/`output` interface and were run on 1.14.8.

Next dependency: Phase 3 state, security and environment boundaries.
