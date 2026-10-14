output "service_id" {
  value       = terraform_data.service.id
  description = "Unique resource identifier of the managed service."
}

output "canonical_name" {
  value       = terraform_data.service.output.canonical_name
  description = "Canonical environment-scoped service name."
}

output "replicas" {
  value       = terraform_data.service.output.replicas
  description = "Configured replica count."
}
