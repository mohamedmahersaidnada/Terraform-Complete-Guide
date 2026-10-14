variable "project" {
  description = "A non-secret project label, 3–32 lowercase letters, digits or hyphens."
  type        = string
  default     = "hello-terraform"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,32}$", var.project))
    error_message = "Project must be 3–32 lowercase letters, digits or hyphens."
  }
}

variable "environment" {
  description = "The environment label; this label alone does not isolate state."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "stage", "prod"], var.environment)
    error_message = "Environment must be dev, stage or prod."
  }
}
