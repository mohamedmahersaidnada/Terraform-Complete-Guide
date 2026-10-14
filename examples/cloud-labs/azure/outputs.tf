output "resource_group_name" {
  description = "Name of the provisioned Azure resource group"
  value       = azurerm_resource_group.lab_rg.name
}

output "storage_account_name" {
  description = "Name of the provisioned Azure storage account"
  value       = azurerm_storage_account.lab_sa.name
}

output "container_name" {
  description = "Name of the blob storage container"
  value       = azurerm_storage_container.lab_container.name
}

output "mandatory_tags" {
  description = "Mandatory cost and governance tags applied to Azure resources"
  value       = local.mandatory_tags
}
