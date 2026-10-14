output "name" {
  description = "The composed label, read back from the managed resource."
  value       = terraform_data.example.output.name
}

output "environment" {
  description = "The managed environment label."
  value       = terraform_data.example.output.environment
}
