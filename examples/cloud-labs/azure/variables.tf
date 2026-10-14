variable "azure_location" {
  description = "Azure region for the sandbox resource group and storage account"
  type        = string
  default     = "eastus"
}

variable "azure_subscription_id" {
  description = "Target Azure subscription identifier (override with live subscription ID or ARM_SUBSCRIPTION_ID)"
  type        = string
  default     = "00000000-0000-0000-0000-000000000000"
}

variable "environment" {
  description = "Deployment lifecycle environment"
  type        = string
  default     = "sandbox"

  validation {
    condition     = contains(["sandbox", "dev", "test"], var.environment)
    error_message = "Environment must be one of: sandbox, dev, test."
  }
}

variable "managed_by" {
  description = "Management tool attribution tag"
  type        = string
  default     = "Terraform"
}

variable "cost_center" {
  description = "Cost allocation center for training and lab accounting"
  type        = string
  default     = "training"
}

variable "owner" {
  description = "Owner identification tag for the sandbox resource"
  type        = string
  default     = "cloud-lab-user"
}

variable "prefix" {
  description = "Naming prefix for Azure resource group and storage account (3-8 lowercase letters)"
  type        = string
  default     = "tflab"

  validation {
    condition     = can(regex("^[a-z0-9]{3,8}$", var.prefix))
    error_message = "Prefix must be 3-8 lowercase alphanumeric characters."
  }
}
