/**
 * AUTH SCHEMA ENUMS
 */

/**
 * User roles in the system
 */
export enum EUserRole {
  SuperAdmin = 'super_admin',
  Admin = 'admin',
  Moderator = 'moderator',
  User = 'user',
  Guest = 'guest',
}

/**
 * User account status
 */
export enum EUserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Pending = 'pending',
  Deleted = 'deleted',
}

/**
 * Authentication session status
 */
export enum EAuthSessionStatus {
  Active = 'active',
  Expired = 'expired',
  Revoked = 'revoked',
  Terminated = 'terminated',
}

/**
 * Device types for authentication sessions
 */
export enum EDeviceType {
  Web = 'web',
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop',
  Api = 'api',
  Unknown = 'unknown',
}

/**
 * Authentication token types
 */
export enum ETokenType {
  AccessToken = 'access_token',
  RefreshToken = 'refresh_token',
  ResetToken = 'reset_token',
  VerificationToken = 'verification_token',
  ApiKey = 'api_key',
}

/**
 * OTP (One-Time Password) types
 */
export enum EOtpType {
  EmailVerification = 'email_verification',
  PhoneVerification = 'phone_verification',
  PasswordReset = 'password_reset',
  TwoFactorAuth = 'two_factor_auth',
}

/**
 * OTP status
 */
export enum EOtpStatus {
  Pending = 'pending',
  Used = 'used',
  Expired = 'expired',
  Cancelled = 'cancelled',
}

/**
 * Password requirements and validation
 */
export enum EPasswordRequirement {
  MinLength = 'min_length',
  RequireUppercase = 'require_uppercase',
  RequireLowercase = 'require_lowercase',
  RequireNumbers = 'require_numbers',
  RequireSpecialChars = 'require_special_chars',
  NoCommonPasswords = 'no_common_passwords',
  NoPersonalInfo = 'no_personal_info',
}

/**
 * Authentication methods
 */
export enum EAuthMethod {
  EmailPassword = 'email_password',
  PhonePassword = 'phone_password',
  Social = 'social',
  Sso = 'sso',
  ApiKey = 'api_key',
  Otp = 'otp',
  Biometric = 'biometric',
}

/**
 * Permission levels for user roles
 */
export enum EPermissionLevel {
  None = 'none',
  Read = 'read',
  Write = 'write',
  Admin = 'admin',
  SuperAdmin = 'super_admin',
}

/**
 * Authentication table names
 */
export enum EAuthTable {
  Users = 'users',
  UserRoles = 'user_roles',
  AuthSessions = 'auth_sessions',
  Passwords = 'passwords',
  Tokens = 'tokens',
  Otps = 'otps',
}

/**
 * Session activity types
 */
export enum ESessionActivityType {
  Login = 'login',
  Logout = 'logout',
  PageView = 'page_view',
  ApiCall = 'api_call',
  TokenRefresh = 'token_refresh',
  SecurityEvent = 'security_event',
}

/**
 * Security event types
 */
export enum ESecurityEventType {
  FailedLogin = 'failed_login',
  SuspiciousActivity = 'suspicious_activity',
  PasswordChange = 'password_change',
  EmailChange = 'email_change',
  RoleChange = 'role_change',
  AccountLocked = 'account_locked',
  AccountUnlocked = 'account_unlocked',
}

/**
 * Authentication error codes
 */
export enum EAuthErrorCode {
  InvalidCredentials = 'invalid_credentials',
  AccountLocked = 'account_locked',
  AccountSuspended = 'account_suspended',
  EmailNotVerified = 'email_not_verified',
  WeakPassword = 'weak_password',
  PasswordExpired = 'password_expired',
  InvalidToken = 'invalid_token',
  TokenExpired = 'token_expired',
  OtpInvalid = 'otp_invalid',
  OtpExpired = 'otp_expired',
  RateLimitExceeded = 'rate_limit_exceeded',
  InsufficientPermissions = 'insufficient_permissions',
  SessionExpired = 'session_expired',
  DeviceNotTrusted = 'device_not_trusted',
  LocationSuspicious = 'location_suspicious',
}

/**
 * User preferences
 */
export enum EUserPreference {
  EmailNotifications = 'email_notifications',
  SmsNotifications = 'sms_notifications',
  TwoFactorAuth = 'two_factor_auth',
  Language = 'language',
  Timezone = 'timezone',
  Theme = 'theme',
  PrivacyLevel = 'privacy_level',
}
