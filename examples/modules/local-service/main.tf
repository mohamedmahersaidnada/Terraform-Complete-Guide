resource "terraform_data" "service" {
  input = {
    canonical_name = "${var.service_name}-${var.environment}"
    replicas       = var.replicas
    status         = "provisioned"
  }
}
