variable "gcp_project_id" {
  description = "Target Google Cloud project ID (override with your GCP sandbox project ID)"
  type        = string
  default     = "terraform-guide-sandbox"
}

variable "gcp_region" {
  description = "Google Cloud region for the sandbox bucket"
  type        = string
  default     = "us-central1"
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
  description = "Prefix for the globally unique Cloud Storage bucket"
  type        = string
  default     = "tf-guide-lab"
}
