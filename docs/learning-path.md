# Beginner learning path

Use Terraform 1.14.8, a terminal and an editor. The entire path uses [local-basics](../examples/local-basics/README.md), needs no cloud credentials and incurs no cloud charges. Install the CLI before starting.

1. [Introduction and installation](../basics/intro-and-installation.md): complete init, plan, apply and destroy.
2. [File structure](../basics/file-structure-and-syntax.md): explain why files in one directory form one module.
3. [Providers and resources](../core-concepts/providers-and-resources.md): identify a resource address and an implicit dependency.
4. [Variables and outputs](../core-concepts/variables-and-outputs.md): customize a label and reject an invalid environment.
5. [Expressions and lifecycle](../core-concepts/expressions-and-lifecycle.md): transform collections and compare updates with replacement.

Finish by rerunning the lab from a clean disposable directory, predicting every change before applying it, and verifying empty state after destroy. A successful completion means you can explain why a second unchanged plan returns no changes and why an environment label alone provides no isolation.

Use the [glossary](glossary.md) and [command reference](command-reference.md) while working. If results differ, check the working directory, CLI version and input overrides before proceeding. Reviewed 2026-09-29; [verification and platform limitations](phase2-evidence.md).
