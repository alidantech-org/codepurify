// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\create_user\response\model.dart

import 'package:riderescue_api/dtos/user/create_user/response/fields.dart';
import 'package:riderescue_api/models/user/user/model.dart';

class CreateUserResponse {
  final bool success;
  final String message;
  final User user;
  const CreateUserResponse(
      {required this.success, required this.message, required this.user});
  CreateUserResponse copyWith({bool? success, String? message, User? user}) {
    return CreateUserResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user);
  }

  factory CreateUserResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return CreateUserResponse(
        success: map[CreateUserResponseFields.success] == true,
        message: map[CreateUserResponseFields.message]?.toString() ?? "",
        user: User.fromJson(Map<String, dynamic>.from(
            (map[CreateUserResponseFields.user] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      CreateUserResponseFields.success: success,
      CreateUserResponseFields.message: message,
      CreateUserResponseFields.user: user.toJson()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    return 'CreateUserResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is CreateUserResponse &&
        other.success == success &&
        other.message == message &&
        other.user == user;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message, user]);
  }
}
