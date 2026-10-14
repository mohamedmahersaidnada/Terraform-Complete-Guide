variable "service_name" {
  type        = string
  description = "Name identifier for the service."

  validation {
    condition     = length(var.service_name) > 0 && length(var.service_name) <= 63
    error_message = "service_name must be between 1 and 63 characters."
  }
}

variable "environment" {
  type        = string
  description = "Deployment environment tier."
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "replicas" {
  type        = number
  description = "Target replica count."
  default     = 1

  validation {
    condition     = var.replicas >= 1 && var.replicas <= 10
    error_message = "replicas must be between 1 and 10."
  }
}
