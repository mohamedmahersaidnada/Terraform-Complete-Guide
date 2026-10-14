locals {
  mandatory_tags = {
    Environment = var.environment
    ManagedBy   = var.managed_by
    CostCenter  = var.cost_center
    Owner       = var.owner
  }
}

provider "azurerm" {
  features {}

  subscription_id = var.azure_subscription_id
}

resource "random_string" "storage_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "azurerm_resource_group" "lab_rg" {
  name     = "rg-${var.prefix}-${var.environment}"
  location = var.azure_location

  tags = local.mandatory_tags
}

resource "azurerm_storage_account" "lab_sa" {
  name                     = "${var.prefix}${random_string.storage_suffix.result}"
  resource_group_name      = azurerm_resource_group.lab_rg.name
  location                 = azurerm_resource_group.lab_rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  min_tls_version          = "TLS1_2"

  tags = local.mandatory_tags
}

resource "azurerm_storage_container" "lab_container" {
  name                  = "lab-data"
  storage_account_name  = azurerm_storage_account.lab_sa.name
  container_access_type = "private"
}
