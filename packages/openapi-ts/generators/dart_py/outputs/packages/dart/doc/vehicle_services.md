# Vehicle Services API

## getAllServices

`GET` `/references/vehicles/services/` 

Get all services

Get a paginated list of all vehicle services.

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `PageQueryParam` | ref | - | Reference parameter |
| `LimitQueryParam` | ref | - | Reference parameter |
| `SortQueryParam` | ref | - | Reference parameter |
| `FieldsQueryParam` | ref | - | Reference parameter |
| `PopulateQueryParam` | ref | - | Reference parameter |
| `SearchQueryParam` | ref | - | Reference parameter |
| `CategoryQueryParam` | ref | - | Reference parameter |
| `StatusQueryParam` | ref | - | Reference parameter |
| `IsActiveQueryParam` | ref | - | Reference parameter |
| `IsVerifiedQueryParam` | ref | - | Reference parameter |
| `IsFeaturedQueryParam` | ref | - | Reference parameter |
| `IsEmergencyQueryParam` | ref | - | Reference parameter |
| `IsMobileQueryParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `VehicleServicesListOkResponse` |

---
## createService

`POST` `/references/vehicles/services/` 

Create service

Create a new vehicle service (admin only).

### Parameters

No parameters.

### Request Body

`CreateVehicleServiceRequestBody` 

### Responses

| Status | Description |
|---|---|
| `201` | `VehicleServiceCreatedResponse` |
| `401` | `UnauthorizedResponse` |
| `403` | `ForbiddenResponse` |
| `409` | `ConflictResponse` |
| `422` | `ValidationErrorResponse` |

---
## getServiceById

`GET` `/references/vehicles/services/{id}` 

Get service by ID

Get a specific vehicle service by ID.

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `ServiceIdPathParam` | ref | - | Reference parameter |
| `FieldsQueryParam` | ref | - | Reference parameter |
| `PopulateQueryParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `VehicleServiceOkResponse` |
| `404` | `NotFoundResponse` |

---
## updateService

`PUT` `/references/vehicles/services/{id}` 

Update service

Update a specific vehicle service by ID (admin only).

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `ServiceIdPathParam` | ref | - | Reference parameter |

### Request Body

`UpdateVehicleServiceRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `VehicleServiceUpdatedResponse` |
| `401` | `UnauthorizedResponse` |
| `403` | `ForbiddenResponse` |
| `404` | `NotFoundResponse` |
| `422` | `ValidationErrorResponse` |

---
## deleteService

`DELETE` `/references/vehicles/services/{id}` 

Delete service

Delete a specific vehicle service by ID (admin only).

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `ServiceIdPathParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `VehicleServiceDeletedResponse` |
| `401` | `UnauthorizedResponse` |
| `403` | `ForbiddenResponse` |
| `404` | `NotFoundResponse` |

---
## toggleServiceStatus

`PATCH` `/references/vehicles/services/{id}/toggle-status` 

Toggle service status

Toggle the active status of a vehicle service (admin only).

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `ServiceIdPathParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `VehicleServiceStatusToggledResponse` |
| `401` | `UnauthorizedResponse` |
| `403` | `ForbiddenResponse` |
| `404` | `NotFoundResponse` |

---
