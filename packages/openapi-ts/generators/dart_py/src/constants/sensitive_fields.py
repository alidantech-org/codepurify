"""
Sensitive field name constants.

Used to avoid leaking secrets in generated Dart toString() methods.
"""

SENSITIVE_FIELD_NAMES = frozenset(
    {
        "password",
        "confirmPassword",
        "currentPassword",
        "newPassword",
        "oldPassword",
        "token",
        "accessToken",
        "refreshToken",
        "idToken",
        "apiKey",
        "secret",
        "clientSecret",
        "authorization",
        "otp",
        "emailVerificationOtp",
        "resetPasswordOtp",
        "verificationOtp",
    }
)

SENSITIVE_FIELD_NAME_PARTS = frozenset(
    {
        "password",
        "token",
        "secret",
        "otp",
        "apikey",
        "api_key",
        "authorization",
    }
)
