# File provisioner and connection blocks

## Objectives and prerequisites

Learn how to configure file transfers and remote connectivity in Terraform, understand connection security constraints, and evaluate cloud-native alternatives. Prerequisites: [local-exec and remote-exec](local-and-remote-exec.md) and [file structure and syntax](../basics/file-structure-and-syntax.md).

## File provisioner semantics

The `file` provisioner copies files or entire directories from the machine running Terraform to a newly provisioned remote compute instance:

```hcl
resource "terraform_data" "web_config" {
  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file("~/.ssh/deploy_key")
    host        = "203.0.113.10"
  }

  provisioner "file" {
    source      = "configs/nginx.conf"
    destination = "/etc/nginx/nginx.conf"
  }
}
```

The file provisioner can copy:
- A single source file to a destination path.
- An entire directory (recursively) to a destination folder.
- Inline text content using the `content` argument instead of `source`.

## Connection block configuration

A `connection` block defines how provisioners communicate with the remote system. It can be placed inside a specific provisioner or at the resource level to be shared by all provisioners in that resource.

Supported connection types:

| Type | Default Port | Authentication Methods |
| --- | --- | --- |
| `ssh` | 22 | Password, Private Key, SSH Agent, Certificate |
| `winrm` | 5985 (HTTP) / 5986 (HTTPS) | Password, NTLM, CredSSP, HTTPS Certificate |

Example SSH bastion connection:

```hcl
connection {
  type         = "ssh"
  user         = "ec2-user"
  private_key  = file("~/.ssh/id_rsa")
  host         = "10.0.1.50"
  bastion_host = "203.0.113.1"
  bastion_user = "bastion-admin"
}
```

## Security and network constraints

Running file transfers or remote connections during infrastructure provisioning introduces substantial architectural friction:
1. **Network Exposure**: Virtual machines must expose port 22 or 5986 to the deployment runner or internet, increasing attack surface.
2. **Secret Sprawl**: SSH private keys or administrative passwords must be provided to the runner.
3. **Execution Freezes**: If DNS or routing is not ready when the resource finishes creating, the connection attempt will hang until timeout.
4. **Cloud Alternative**: Instead of copying files over SSH, upload files to private cloud object storage (S3 bucket, Azure Blob, GCS) and let the VM pull them during startup via instance profile IAM credentials.

## Exercise and expected result

Review a syntax example verifying connection parameter definitions:

```shell
terraform fmt -check
```

Understand why Terraform credentials in a `connection` block must never be committed to Git. Instead of storing keys locally, use ephemeral cloud secrets or AWS Systems Manager (SSM) / Azure Bastion / GCP Identity-Aware Proxy (IAP) for administrative access.

## Troubleshooting and cleanup

| Symptom | Cause | Remediation |
| --- | --- | --- |
| `connection timeout` | Host is unreachable or firewall/security group blocks traffic | Check public IP assignment and ingress firewall rules |
| `Permission denied (publickey)` | Incorrect SSH user or private key mismatch | Match the default user for the OS image (e.g., `ec2-user`, `ubuntu`, `admin`) |
| `winrm connection error` | WinRM service is not yet initialized or HTTPS cert invalid | Allow startup script to complete before connecting; verify certificate validation settings |

## References and verification

Reviewed 2026-10-11 for Terraform 1.14.8; see [curriculum evidence](../docs/curriculum-evidence.md).
- [file Provisioner](https://developer.hashicorp.com/terraform/language/resources/provisioners/file)
- [Connection Syntax](https://developer.hashicorp.com/terraform/language/resources/provisioners/connection)
- [Provisioner Best Practices](https://developer.hashicorp.com/terraform/language/resources/provisioners/syntax#provisioners-are-a-last-resort)