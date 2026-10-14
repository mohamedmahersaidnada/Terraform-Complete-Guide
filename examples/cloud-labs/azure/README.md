# Azure Cloud Lab: Resource Group and Storage with Mandatory Tags

## Overview and purpose

This lab provisions an isolated Azure Resource Group and Standard Locally Redundant Storage (LRS) Account with a private blob container. It applies mandatory resource tags (`Environment`, `ManagedBy`, `CostCenter`, `Owner`) across all resources to ensure cost attribution, operational governance, and automated teardown.

This configuration targets Terraform `~> 1.14.0` and the HashiCorp AzureRM provider `~> 4.14.0`.

## Architecture and cost boundaries

- **Azure Resource Group**: Acts as the logical boundary. Deleting the resource group during teardown cascades to all contained resources.
- **Storage Account**: Standard LRS (Locally Redundant Storage) is the lowest cost storage tier in Azure, qualifying for 5 GB free blob storage within the Azure Free Account period.
- **Random String**: Generates a valid 3-24 character alphanumeric name required by Azure Storage Account rules.
- **Security Baseline**: Minimum TLS 1.2 is enforced, and blob public access is restricted.

## Mandatory tagging contract

All resources must carry the following tags:

| Tag Name | Allowed / Default Values | Purpose |
| --- | --- | --- |
| `Environment` | `sandbox`, `dev`, `test` | Prevents mixing testing resources with production |
| `ManagedBy` | `Terraform` | Identifies infrastructure managed by code |
| `CostCenter` | `training` | Maps cloud spend to training and enablement budgets |
| `Owner` | `cloud-lab-user` | Assigns resource ownership for sweeper policies |

## Safety warning and prerequisites

> [!WARNING]
> Although this lab uses minimal-cost resources, unmanaged or long-running cloud services accrue cost over time. Always run `terraform destroy` when your learning session ends.

Prerequisites:
- Azure CLI installed and authenticated via `az login`.
- An active Azure subscription. Set your subscription ID via:
  ```shell
  export TF_VAR_azure_subscription_id=$(az account show --query id -o tsv)
  ```
  or on Windows PowerShell:
  ```powershell
  $env:TF_VAR_azure_subscription_id = (az account show --query id -o tsv)
  ```

## Execution lifecycle

### 1. Initialize the lab

```shell
terraform init
```

### 2. Review execution plan

```shell
terraform plan -out=tfplan
```

### 3. Apply changes

```shell
terraform apply tfplan
```

Review outputs to confirm resource group and storage account names.

## Teardown and residual verification

### 1. Destroy resources

Execute complete destruction:

```shell
terraform destroy -auto-approve
```

### 2. Verify zero residual resources

Verify that the resource group and all child resources have been removed:

```shell
az group exists --name rg-tflab-sandbox
```

An output of `false` confirms that the entire resource group and its storage account were completely destroyed.
