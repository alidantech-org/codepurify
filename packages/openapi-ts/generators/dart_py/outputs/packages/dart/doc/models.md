# Models and Schemas

## AdminLoginBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `EmailField` | True |  |
| `password` | `RequiredPasswordField` | True |  |

---
## AdminUpdateUserBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `name` | `UserNameField` | False |  |
| `phone` | `NullableStringField` | False |  |
| `avatar` | `NullableUrlField` | False |  |
| `address` | `NullableStringField` | False |  |
| `location` | `unknown` | False |  |
| `status` | `UserStatus` | False |  |
| `roles` | `array` | False |  |
| `isOnline` | `BooleanField` | False |  |
| `emailVerified` | `BooleanField` | False |  |

---
## AdminUserResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |
| `user` | `User` | True |  |

---
## AuthNextStep


Enum values:

- `login` 
- `signup` 
- `verify_email` 


---
## AuthSessionResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |
| `user` | `PublicUser` | True |  |
| `token` | `ResponseTokenField` | True |  |

---
## ChangePasswordBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `currentPassword` | `CurrentPasswordField` | True |  |
| `newPassword` | `NewPasswordField` | True |  |
| `confirmPassword` | `NewPasswordField` | True |  |

---
## ConflictResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |

---
## CreateUserBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `name` | `UserNameField` | True |  |
| `email` | `EmailField` | True |  |
| `password` | `UserPasswordField` | True |  |
| `confirmPassword` | `UserPasswordField` | True |  |
| `phone` | `NullableStringField` | False |  |
| `avatar` | `NullableUrlField` | False |  |
| `address` | `NullableStringField` | False |  |
| `location` | `unknown` | False |  |

---
## DeleteUserResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |

---
## ForbiddenResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |

---
## ForgotPasswordBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `EmailField` | True |  |

---
## GeoLocation


| Field | Type | Required | Description |
|---|---|---:|---|
| `type` | `GeoLocationTypeField` | True |  |
| `coordinates` | `GeoLocationCoordinatesField` | True |  |

---
## GoogleSignInBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `idToken` | `TokenField` | True |  |

---
## LoginBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `EmailField` | True |  |
| `password` | `RequiredPasswordField` | True |  |

---
## MessageOnlyResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |

---
## NotFoundResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |

---
## PaginationMeta


| Field | Type | Required | Description |
|---|---|---:|---|
| `page` | `PageField` | True |  |
| `limit` | `LimitField` | True |  |
| `total` | `TotalField` | True |  |
| `totalPages` | `TotalPagesField` | True |  |

---
## PartialPublicUser


| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | `MongoIdField` | False |  |
| `name` | `UserNameField` | False |  |
| `email` | `EmailField` | False |  |
| `status` | `UserStatus` | False |  |
| `roles` | `array` | False |  |
| `phone` | `NullableStringField` | False |  |
| `avatar` | `NullableUrlField` | False |  |
| `address` | `NullableStringField` | False |  |
| `location` | `unknown` | False |  |
| `isOnline` | `BooleanField` | False |  |
| `emailVerified` | `BooleanField` | False |  |
| `createdAt` | `DateTimeField` | False |  |
| `updatedAt` | `DateTimeField` | False |  |

---
## PublicUser


| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | `MongoIdField` | True |  |
| `name` | `UserNameField` | True |  |
| `email` | `EmailField` | True |  |
| `status` | `UserStatus` | True |  |
| `roles` | `array` | True |  |
| `phone` | `NullableStringField` | True |  |
| `avatar` | `NullableUrlField` | True |  |
| `address` | `NullableStringField` | True |  |
| `location` | `unknown` | True |  |
| `isOnline` | `BooleanField` | True |  |
| `emailVerified` | `BooleanField` | True |  |
| `createdAt` | `DateTimeField` | True |  |
| `updatedAt` | `DateTimeField` | True |  |

---
## ResendVerificationEmailBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `EmailField` | True |  |

---
## ResetPasswordBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `EmailField` | True |  |
| `otp` | `OtpField` | True |  |
| `newPassword` | `NewPasswordField` | True |  |
| `confirmPassword` | `NewPasswordField` | True |  |

---
## ResolveEmailBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `EmailField` | True |  |

---
## ResolveEmailResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |
| `email` | `EmailField` | True |  |
| `nextStep` | `AuthNextStep` | True |  |

---
## SignupBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `EmailField` | True |  |
| `password` | `PasswordField` | True |  |
| `confirmPassword` | `ConfirmPasswordField` | True |  |
| `name` | `NameField` | True |  |
| `phone` | `NullableStringField` | False |  |
| `avatar` | `NullableUrlField` | False |  |
| `address` | `NullableStringField` | True |  |

---
## SignupResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |
| `user` | `PublicUser` | True |  |
| `token` | `ResponseTokenField` | True |  |

---
## UnauthorizedResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |

---
## UpdateUserProfileBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `name` | `UserNameField` | False |  |
| `phone` | `NullableStringField` | False |  |
| `avatar` | `NullableUrlField` | False |  |
| `address` | `NullableStringField` | False |  |
| `location` | `unknown` | False |  |

---
## User


| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | `MongoIdField` | True |  |
| `name` | `UserNameField` | True |  |
| `email` | `EmailField` | True |  |
| `password` | `UserPasswordField` | True |  |
| `status` | `UserStatus` | True |  |
| `roles` | `array` | True |  |
| `phone` | `NullableStringField` | True |  |
| `avatar` | `NullableUrlField` | True |  |
| `address` | `NullableStringField` | True |  |
| `location` | `unknown` | True |  |
| `isOnline` | `BooleanField` | True |  |
| `emailVerified` | `BooleanField` | True |  |
| `emailVerificationOtp` | `NullableStringField` | True |  |
| `emailVerificationOtpExpires` | `DateTimeField` | True |  |
| `resetPasswordOtp` | `NullableStringField` | True |  |
| `resetPasswordOtpExpires` | `DateTimeField` | True |  |
| `passwordChangedAt` | `DateTimeField` | True |  |
| `createdAt` | `DateTimeField` | True |  |
| `updatedAt` | `DateTimeField` | True |  |

---
## UserResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |
| `user` | `PublicUser` | True |  |

---
## UserRole


Enum values:

- `admin` 
- `user` 
- `service_provider` 
- `driver` 


---
## UserStatus


Enum values:

- `active` 
- `suspended` 
- `deleted` 


---
## UsersListResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |
| `users` | `array` | True |  |
| `pagination` | `PaginationMeta` | True |  |
| `filters` | `Filters` | False |  |
| `sort` | `Sort` | False |  |

---
## ValidationErrorResponse


| Field | Type | Required | Description |
|---|---|---:|---|
| `success` | `ResponseSuccess` | True |  |
| `message` | `ResponseMessage` | True |  |
| `errors` | `ValidationErrors` | True |  |

---
## ValidationErrors


| Field | Type | Required | Description |
|---|---|---:|---|
| `form` | `ValidationFormErrorsField` | True |  |
| `fields` | `ValidationFieldErrorsMapField` | True |  |

---
## VerifyEmailBody


| Field | Type | Required | Description |
|---|---|---:|---|
| `email` | `EmailField` | True |  |
| `otp` | `OtpField` | True |  |

---
