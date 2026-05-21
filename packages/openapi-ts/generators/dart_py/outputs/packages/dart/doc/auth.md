# Auth API

## resolveEmail

`POST` `/auth/resolve-email` 

Resolve email

Check if an email exists and determine the next auth step.

### Parameters

No parameters.

### Request Body

`ResolveEmailRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `ResolveEmailOkResponse` |

---
## signup

`POST` `/auth/signup` 

Sign up user

Register a new user account.

### Parameters

No parameters.

### Request Body

`SignupRequestBody` 

### Responses

| Status | Description |
|---|---|
| `201` | `SignupCreatedResponse` |

---
## login

`POST` `/auth/login` 

Login user

Login a user using email and password.

### Parameters

No parameters.

### Request Body

`LoginRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `LoginOkResponse` |

---
## adminLogin

`POST` `/auth/admin/login` 

Admin login

Login an admin user using email and password.

### Parameters

No parameters.

### Request Body

`AdminLoginRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `AdminLoginOkResponse` |

---
## googleSignIn

`POST` `/auth/google` 

Google sign-in

Authenticate user using Google OAuth.

### Parameters

No parameters.

### Request Body

`GoogleSignInRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `GoogleSignInOkResponse` |

---
## verifyEmail

`POST` `/auth/verify-email` 

Verify email

Verify user email using OTP.

### Parameters

No parameters.

### Request Body

`VerifyEmailRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `VerifyEmailOkResponse` |

---
## resendVerificationEmail

`POST` `/auth/resend-verification-email` 

Resend verification email

Resend email verification OTP to user.

### Parameters

No parameters.

### Request Body

`ResendVerificationEmailRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `ResendVerificationEmailOkResponse` |

---
## forgotPassword

`POST` `/auth/forgot-password` 

Forgot password

Request password reset OTP via email.

### Parameters

No parameters.

### Request Body

`ForgotPasswordRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `ForgotPasswordOkResponse` |

---
## resetPassword

`POST` `/auth/reset-password` 

Reset password

Reset password using OTP.

### Parameters

No parameters.

### Request Body

`ResetPasswordRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `ResetPasswordOkResponse` |

---
## changePassword

`PUT` `/auth/change-password` 

Change password

Change password for the authenticated user.

### Parameters

No parameters.

### Request Body

`ChangePasswordRequestBody` 

### Responses

| Status | Description |
|---|---|
| `200` | `ChangePasswordOkResponse` |

---
