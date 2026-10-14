variable "aws_region" {
  description = "AWS region for the sandbox lab resources"
  type        = string
  default     = "us-east-1"
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

variable "bucket_prefix" {
  description = "Prefix for the unique S3 lab storage bucket"
  type        = string
  default     = "tf-guide-lab"
}
