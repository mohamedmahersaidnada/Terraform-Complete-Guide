locals {
  mandatory_tags = {
    Environment = var.environment
    ManagedBy   = var.managed_by
    CostCenter  = var.cost_center
    Owner       = var.owner
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.mandatory_tags
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "lab_storage" {
  bucket        = "${var.bucket_prefix}-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = local.mandatory_tags
}

resource "aws_s3_bucket_versioning" "lab_storage" {
  bucket = aws_s3_bucket.lab_storage.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lab_storage" {
  bucket = aws_s3_bucket.lab_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "lab_storage" {
  bucket = aws_s3_bucket.lab_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
