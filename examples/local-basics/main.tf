locals {
  name = "${var.project}-${var.environment}"
}

# Built into Terraform: no provider download or cloud API is required.
# All input values are written to local state. Never put secrets here.
resource "terraform_data" "example" {
  input = {
    name        = local.name
    environment = var.environment
  }
}
