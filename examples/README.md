# Example inventory and validator contract

The [manifest](manifest.json) enumerates every runnable root and reusable module. Entries declare a repository-relative path, existing lesson, runtime, test class, cost and cloud-credential requirement. Roots cannot be duplicated, escape `examples/`, omit Terraform files or remain unlisted. Empty and missing manifests fail. Local examples must declare no cloud credentials and no cost.

Run from the repository root:

```sh
node --test scripts/check-examples.test.mjs
node scripts/check-examples.mjs
node scripts/check-local-lifecycle.mjs
```

The validator copies configurations to temporary directories, checks formatting, initializes without a backend, and validates every entry. It runs Terraform tests only for `local` and `mocked` classifications; `static` and `live` entries are not applied. Initialization can download providers. Each entry prints PASS or FAIL; any failure produces a nonzero exit. Classification requires review of the actual code: the label itself cannot prevent cloud calls or malicious provisioners. Never run untrusted test code with credentials.

The lifecycle harness independently applies a saved plan in a fresh local fixture, verifies outputs and plan exit codes, then destroys and checks empty state. It preserves the fixture if destroy fails. [Phase 2 evidence](../docs/phase2-evidence.md) records the tested platform.
