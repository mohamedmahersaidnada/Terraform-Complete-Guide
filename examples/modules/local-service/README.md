# Local service reusable module fixture

Demonstration reusable child module for testing module interfaces, validation rules, outputs, and native tests.

## Inputs

| Name | Type | Description | Default | Required |
| --- | --- | --- | --- | --- |
| `service_name` | `string` | Unique service name identifier (1–63 chars) | N/A | Yes |
| `environment` | `string` | Deployment tier (`dev`, `staging`, `prod`) | `"dev"` | No |
| `replicas` | `number` | Number of instances (1–10) | `1` | No |

## Outputs

| Name | Description |
| --- | --- |
| `service_id` | Unique resource identifier of the managed service |
| `canonical_name` | Canonical environment-scoped service name |
| `replicas` | Configured replica count |

## Testing

Run native module unit and integration tests from this directory:

```shell
terraform init
terraform test
```

## References

- [Creating modules](../../../modules/creating-modules.md)
- [Examples manifest](../../manifest.json)
