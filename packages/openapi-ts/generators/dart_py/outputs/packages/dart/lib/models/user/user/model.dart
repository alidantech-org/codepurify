// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: models\user\user\model.dart

import 'package:collection/collection.dart';
import 'package:riderescue_api/dtos/shared/geo_location/model.dart';
import 'package:riderescue_api/enums/user_role/enum.dart';
import 'package:riderescue_api/enums/user_status/enum.dart';
import 'package:riderescue_api/models/user/user/fields.dart';

class User {
  final String id;
  final String name;
  final String email;
  final String password;
  final UserStatus status;
  final List<UserRole> roles;
  final String phone;
  final String avatar;
  final String address;
  final GeoLocation? location;
  final bool isOnline;
  final bool emailVerified;
  final String emailVerificationOtp;
  final DateTime emailVerificationOtpExpires;
  final String resetPasswordOtp;
  final DateTime resetPasswordOtpExpires;
  final DateTime passwordChangedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  const User(
      {required this.id,
      required this.name,
      required this.email,
      required this.password,
      required this.status,
      required this.roles,
      required this.phone,
      required this.avatar,
      required this.address,
      required this.location,
      required this.isOnline,
      required this.emailVerified,
      required this.emailVerificationOtp,
      required this.emailVerificationOtpExpires,
      required this.resetPasswordOtp,
      required this.resetPasswordOtpExpires,
      required this.passwordChangedAt,
      required this.createdAt,
      required this.updatedAt});
  User copyWith(
      {String? id,
      String? name,
      String? email,
      String? password,
      UserStatus? status,
      List<UserRole>? roles,
      String? phone,
      String? avatar,
      String? address,
      GeoLocation? location,
      bool? isOnline,
      bool? emailVerified,
      String? emailVerificationOtp,
      DateTime? emailVerificationOtpExpires,
      String? resetPasswordOtp,
      DateTime? resetPasswordOtpExpires,
      DateTime? passwordChangedAt,
      DateTime? createdAt,
      DateTime? updatedAt}) {
    return User(
        id: id ?? this.id,
        name: name ?? this.name,
        email: email ?? this.email,
        password: password ?? this.password,
        status: status ?? this.status,
        roles: roles ?? this.roles,
        phone: phone ?? this.phone,
        avatar: avatar ?? this.avatar,
        address: address ?? this.address,
        location: location ?? this.location,
        isOnline: isOnline ?? this.isOnline,
        emailVerified: emailVerified ?? this.emailVerified,
        emailVerificationOtp: emailVerificationOtp ?? this.emailVerificationOtp,
        emailVerificationOtpExpires:
            emailVerificationOtpExpires ?? this.emailVerificationOtpExpires,
        resetPasswordOtp: resetPasswordOtp ?? this.resetPasswordOtp,
        resetPasswordOtpExpires:
            resetPasswordOtpExpires ?? this.resetPasswordOtpExpires,
        passwordChangedAt: passwordChangedAt ?? this.passwordChangedAt,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt);
  }

  factory User.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return User(
        id: map[UserFields.id]?.toString() ?? "",
        name: map[UserFields.name]?.toString() ?? "",
        email: map[UserFields.email]?.toString() ?? "",
        password: map[UserFields.password]?.toString() ?? "",
        status: UserStatus.fromValue(map[UserFields.status]?.toString() ?? ""),
        roles: ((map[UserFields.roles] as List?) ?? [])
            .map((item) => UserRole.fromValue(item?.toString() ?? ""))
            .toList(),
        phone: map[UserFields.phone]?.toString() ?? "",
        avatar: map[UserFields.avatar]?.toString() ?? "",
        address: map[UserFields.address]?.toString() ?? "",
        location: map[UserFields.location] == null
            ? null
            : GeoLocation.fromJson(Map<String, dynamic>.from(
                (map[UserFields.location] as Map?) ?? {})),
        isOnline: map[UserFields.isOnline] == true,
        emailVerified: map[UserFields.emailVerified] == true,
        emailVerificationOtp:
            map[UserFields.emailVerificationOtp]?.toString() ?? "",
        emailVerificationOtpExpires: DateTime.parse(
            map[UserFields.emailVerificationOtpExpires].toString()),
        resetPasswordOtp: map[UserFields.resetPasswordOtp]?.toString() ?? "",
        resetPasswordOtpExpires:
            DateTime.parse(map[UserFields.resetPasswordOtpExpires].toString()),
        passwordChangedAt:
            DateTime.parse(map[UserFields.passwordChangedAt].toString()),
        createdAt: DateTime.parse(map[UserFields.createdAt].toString()),
        updatedAt: DateTime.parse(map[UserFields.updatedAt].toString()));
  }

  Map<String, dynamic> toJson() {
    return {
      UserFields.id: id,
      UserFields.name: name,
      UserFields.email: email,
      UserFields.password: password,
      UserFields.status: status.value,
      UserFields.roles: roles.map((item) => item.value).toList(),
      UserFields.phone: phone,
      UserFields.avatar: avatar,
      UserFields.address: address,
      UserFields.location: location?.toJson(),
      UserFields.isOnline: isOnline,
      UserFields.emailVerified: emailVerified,
      UserFields.emailVerificationOtp: emailVerificationOtp,
      UserFields.emailVerificationOtpExpires:
          emailVerificationOtpExpires.toIso8601String(),
      UserFields.resetPasswordOtp: resetPasswordOtp,
      UserFields.resetPasswordOtpExpires:
          resetPasswordOtpExpires.toIso8601String(),
      UserFields.passwordChangedAt: passwordChangedAt.toIso8601String(),
      UserFields.createdAt: createdAt.toIso8601String(),
      UserFields.updatedAt: updatedAt.toIso8601String()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('id: $id');
    parts.add('name: $name');
    parts.add('email: $email');
    parts.add('password: ***');
    parts.add('status: $status');
    parts.add('roles: $roles');
    parts.add('phone: $phone');
    parts.add('avatar: $avatar');
    parts.add('address: $address');
    parts.add('location: $location');
    parts.add('isOnline: $isOnline');
    parts.add('emailVerified: $emailVerified');
    parts.add('emailVerificationOtp: ***');
    parts.add('emailVerificationOtpExpires: ***');
    parts.add('resetPasswordOtp: ***');
    parts.add('resetPasswordOtpExpires: ***');
    parts.add('passwordChangedAt: ***');
    parts.add('createdAt: $createdAt');
    parts.add('updatedAt: $updatedAt');
    return 'User(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    const equality = DeepCollectionEquality();

    return other is User &&
        other.id == id &&
        other.name == name &&
        other.email == email &&
        other.password == password &&
        other.status == status &&
        equality.equals(other.roles, roles) &&
        other.phone == phone &&
        other.avatar == avatar &&
        other.address == address &&
        other.location == location &&
        other.isOnline == isOnline &&
        other.emailVerified == emailVerified &&
        other.emailVerificationOtp == emailVerificationOtp &&
        other.emailVerificationOtpExpires == emailVerificationOtpExpires &&
        other.resetPasswordOtp == resetPasswordOtp &&
        other.resetPasswordOtpExpires == resetPasswordOtpExpires &&
        other.passwordChangedAt == passwordChangedAt &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      id,
      name,
      email,
      password,
      status,
      equality.hash(roles),
      phone,
      avatar,
      address,
      location,
      isOnline,
      emailVerified,
      emailVerificationOtp,
      emailVerificationOtpExpires,
      resetPasswordOtp,
      resetPasswordOtpExpires,
      passwordChangedAt,
      createdAt,
      updatedAt
    ]);
  }
}
