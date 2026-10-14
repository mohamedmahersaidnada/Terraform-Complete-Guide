locals {
  mandatory_tags = {
    Environment = var.environment
    ManagedBy   = var.managed_by
    CostCenter  = var.cost_center
    Owner       = var.owner
  }

  # GCP labels require lowercase keys and values (letters, digits, underscores, hyphens)
  mandatory_labels = {
    environment = lower(var.environment)
    managed_by  = lower(var.managed_by)
    cost_center = lower(var.cost_center)
    owner       = lower(var.owner)
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region

  default_labels = local.mandatory_labels
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "google_storage_bucket" "lab_bucket" {
  name                        = "${var.bucket_prefix}-${random_id.bucket_suffix.hex}"
  location                    = "US"
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  force_destroy               = true

  versioning {
    enabled = true
  }

  labels = local.mandatory_labels
}
