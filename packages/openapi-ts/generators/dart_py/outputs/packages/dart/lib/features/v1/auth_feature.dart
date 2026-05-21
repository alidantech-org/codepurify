import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riderescue_api/client/api/api_request.dart';
import 'package:riderescue_api/client/api/api_request_options.dart';
import 'package:riderescue_api/client/api/api_result.dart';
import 'package:riderescue_api/riderescue_api.dart';
import 'package:riderescue_api/routes/v1/v1.dart';
import 'package:riderescue_api/dtos/auth/resolve_email/body/model.dart';
import 'package:riderescue_api/dtos/auth/resolve_email/response/model.dart';
import 'package:riderescue_api/dtos/auth/signup/body/model.dart';
import 'package:riderescue_api/dtos/auth/signup/response/model.dart';
import 'package:riderescue_api/dtos/auth/login/body/model.dart';
import 'package:riderescue_api/dtos/auth/login/response/model.dart';
import 'package:riderescue_api/dtos/auth/admin_login/body/model.dart';
import 'package:riderescue_api/dtos/auth/admin_login/response/model.dart';
import 'package:riderescue_api/dtos/auth/google_sign_in/body/model.dart';
import 'package:riderescue_api/dtos/auth/google_sign_in/response/model.dart';
import 'package:riderescue_api/dtos/auth/verify_email/body/model.dart';
import 'package:riderescue_api/dtos/auth/verify_email/response/model.dart';
import 'package:riderescue_api/dtos/auth/resend_verification_email/body/model.dart';
import 'package:riderescue_api/dtos/auth/resend_verification_email/response/model.dart';
import 'package:riderescue_api/dtos/auth/forgot_password/body/model.dart';
import 'package:riderescue_api/dtos/auth/forgot_password/response/model.dart';
import 'package:riderescue_api/dtos/auth/reset_password/body/model.dart';
import 'package:riderescue_api/dtos/auth/reset_password/response/model.dart';
import 'package:riderescue_api/dtos/auth/change_password/body/model.dart';
import 'package:riderescue_api/dtos/auth/change_password/response/model.dart';

class AuthFeature {
  AuthFeature(this.ref);

  final Ref ref;
  Future<ApiResult<ResolveEmailResponse>> resolveEmail({
    required ResolveEmailBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<ResolveEmailResponse>(
            endpoint: V1.auth.resolveEmail,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => ResolveEmailResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<SignupResponse>> signup({
    required SignupBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<SignupResponse>(
            endpoint: V1.auth.signup,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => SignupResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<LoginResponse>> login({
    required LoginBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<LoginResponse>(
            endpoint: V1.auth.login,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => LoginResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<AdminLoginResponse>> adminLogin({
    required AdminLoginBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<AdminLoginResponse>(
            endpoint: V1.auth.adminLogin,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => AdminLoginResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<GoogleSignInResponse>> googleSignIn({
    required GoogleSignInBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<GoogleSignInResponse>(
            endpoint: V1.auth.googleSignIn,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => GoogleSignInResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<VerifyEmailResponse>> verifyEmail({
    required VerifyEmailBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<VerifyEmailResponse>(
            endpoint: V1.auth.verifyEmail,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => VerifyEmailResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<ResendVerificationEmailResponse>> resendVerificationEmail({
    required ResendVerificationEmailBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<ResendVerificationEmailResponse>(
            endpoint: V1.auth.resendVerificationEmail,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => ResendVerificationEmailResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<ForgotPasswordResponse>> forgotPassword({
    required ForgotPasswordBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<ForgotPasswordResponse>(
            endpoint: V1.auth.forgotPassword,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => ForgotPasswordResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<ResetPasswordResponse>> resetPassword({
    required ResetPasswordBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<ResetPasswordResponse>(
            endpoint: V1.auth.resetPassword,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => ResetPasswordResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<ChangePasswordResponse>> changePassword({
    required ChangePasswordBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PutRequest<ChangePasswordResponse>(
            endpoint: V1.auth.changePassword,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => ChangePasswordResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }
}

final authFeatureProvider = Provider<AuthFeature>((ref) {
  return AuthFeature(ref);
});
