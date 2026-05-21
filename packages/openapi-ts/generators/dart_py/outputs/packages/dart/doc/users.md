# Users API

## listUsers

`GET` `/users` 

List users


### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `PageQueryParam` | ref | - | Reference parameter |
| `LimitQueryParam` | ref | - | Reference parameter |
| `SortQueryParam` | ref | - | Reference parameter |
| `FieldsQueryParam` | ref | - | Reference parameter |
| `PopulateQueryParam` | ref | - | Reference parameter |
| `SearchQueryParam` | ref | - | Reference parameter |
| `UserStatusQueryParam` | ref | - | Reference parameter |
| `UserRoleQueryParam` | ref | - | Reference parameter |
| `EmailVerifiedQueryParam` | ref | - | Reference parameter |
| `IsOnlineQueryParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `UsersListOkResponse` |
| `401` | `UnauthorizedResponse` |

---
## createUser

`POST` `/users` 

Create user


### Parameters

No parameters.

### Request Body

`CreateUserRequestBody` 

### Responses

| Status | Description |
|---|---|
| `201` | `AdminUserCreatedResponse` |
| `401` | `UnauthorizedResponse` |
| `403` | `ForbiddenResponse` |
| `409` | `ConflictResponse` |
| `422` | `ValidationErrorResponse` |

---
## getCurrentUser

`GET` `/users/me` 

Get current user


### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `FieldsQueryParam` | ref | - | Reference parameter |
| `PopulateQueryParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `UserOkResponse` |
| `401` | `UnauthorizedResponse` |

---
## updateCurrentUser

`PATCH` `/users/me` 

Update current user profile


### Parameters

No parameters.

### Request Body

`UpdateUserProfileRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `UserOkResponse` |
| `401` | `UnauthorizedResponse` |
| `422` | `ValidationErrorResponse` |

---
## getUserById

`GET` `/users/{userId}` 

Get user by ID


### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `UserIdPathParam` | ref | - | Reference parameter |
| `FieldsQueryParam` | ref | - | Reference parameter |
| `PopulateQueryParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `UserOkResponse` |
| `401` | `UnauthorizedResponse` |
| `404` | `NotFoundResponse` |

---
## adminUpdateUser

`PATCH` `/users/{userId}` 

Admin update user


### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `UserIdPathParam` | ref | - | Reference parameter |

### Request Body

`AdminUpdateUserRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `AdminUserOkResponse` |
| `401` | `UnauthorizedResponse` |
| `403` | `ForbiddenResponse` |
| `404` | `NotFoundResponse` |
| `422` | `ValidationErrorResponse` |

---
## deleteUser

`DELETE` `/users/{userId}` 

Delete user


### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `UserIdPathParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `DeleteUserOkResponse` |
| `401` | `UnauthorizedResponse` |
| `403` | `ForbiddenResponse` |
| `404` | `NotFoundResponse` |

---
## adminGetUserById

`GET` `/users/admin/{userId}` 

Admin get user by ID


### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `UserIdPathParam` | ref | - | Reference parameter |
| `FieldsQueryParam` | ref | - | Reference parameter |
| `PopulateQueryParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `AdminUserOkResponse` |
| `401` | `UnauthorizedResponse` |
| `403` | `ForbiddenResponse` |
| `404` | `NotFoundResponse` |

---
