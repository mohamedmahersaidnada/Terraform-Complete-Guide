run "default_output" {
  command = apply

  assert {
    condition     = output.name == "hello-terraform-dev"
    error_message = "The default label must combine project and environment."
  }

  assert {
    condition     = output.environment == "dev"
    error_message = "The default environment must survive the resource lifecycle."
  }
}

run "custom_output" {
  command = apply

  variables {
    project     = "learning"
    environment = "stage"
  }

  assert {
    condition     = output.name == "learning-stage"
    error_message = "Custom labels must flow through to the resource output."
  }
}

run "reject_project" {
  command = plan
  variables {
    project = "BAD LABEL"
  }
  expect_failures = [var.project]
}

run "reject_environment" {
  command = plan
  variables {
    environment = "production"
  }
  expect_failures = [var.environment]
}
