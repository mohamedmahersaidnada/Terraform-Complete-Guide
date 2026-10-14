output "bucket_name" {
  description = "Name of the provisioned Google Cloud Storage bucket"
  value       = google_storage_bucket.lab_bucket.name
}

output "bucket_url" {
  description = "gs:// URI of the provisioned Google Cloud Storage bucket"
  value       = google_storage_bucket.lab_bucket.url
}

output "mandatory_tags" {
  description = "Mandatory cost and governance tags"
  value       = local.mandatory_tags
}

output "mandatory_labels" {
  description = "GCP-compatible lowercase resource labels applied to the bucket"
  value       = local.mandatory_labels
}
