output "bucket_name" {
  description = "Globally unique name of the provisioned lab S3 bucket"
  value       = aws_s3_bucket.lab_storage.id
}

output "bucket_arn" {
  description = "Amazon Resource Name (ARN) of the lab S3 bucket"
  value       = aws_s3_bucket.lab_storage.arn
}

output "mandatory_tags" {
  description = "Mandatory cost and governance tags applied to all lab resources"
  value       = local.mandatory_tags
}
