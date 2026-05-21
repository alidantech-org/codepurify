// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\change_password\response\model.dart

import 'package:riderescue_api/dtos/auth/change_password/response/fields.dart';

class ChangePasswordResponse {
  final bool success;
  final String message;
  const ChangePasswordResponse({required this.success, required this.message});
  ChangePasswordResponse copyWith({bool? success, String? message}) {
    return ChangePasswordResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory ChangePasswordResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ChangePasswordResponse(
        success: map[ChangePasswordResponseFields.success] == true,
        message: map[ChangePasswordResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      ChangePasswordResponseFields.success: success,
      ChangePasswordResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'ChangePasswordResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ChangePasswordResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
