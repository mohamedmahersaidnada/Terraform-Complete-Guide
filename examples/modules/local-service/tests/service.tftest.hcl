variables {
  service_name = "payment-gateway"
  environment  = "dev"
  replicas     = 2
}

run "validate_service_apply" {
  command = apply

  assert {
    condition     = output.canonical_name == "payment-gateway-dev"
    error_message = "Canonical service name was not computed correctly."
  }

  assert {
    condition     = output.replicas == 2
    error_message = "Replica count does not match input."
  }

  assert {
    condition     = output.service_id != ""
    error_message = "Service ID was not generated after apply."
  }
}

run "reject_invalid_environment" {
  command = plan
  variables {
    environment = "qa"
  }
  expect_failures = [var.environment]
}

run "reject_invalid_replicas" {
  command = plan
  variables {
    replicas = 0
  }
  expect_failures = [var.replicas]
}
