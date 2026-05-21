// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\delete_user\response\model.dart

import 'package:riderescue_api/dtos/user/delete_user/response/fields.dart';

class DeleteUserResponse {
  final bool success;
  final String message;
  const DeleteUserResponse({required this.success, required this.message});
  DeleteUserResponse copyWith({bool? success, String? message}) {
    return DeleteUserResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory DeleteUserResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return DeleteUserResponse(
        success: map[DeleteUserResponseFields.success] == true,
        message: map[DeleteUserResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      DeleteUserResponseFields.success: success,
      DeleteUserResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'DeleteUserResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DeleteUserResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
