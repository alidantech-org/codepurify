// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: models\user\public_user\model.dart

import 'package:collection/collection.dart';
import 'package:riderescue_api/dtos/shared/geo_location/model.dart';
import 'package:riderescue_api/enums/user_role/enum.dart';
import 'package:riderescue_api/enums/user_status/enum.dart';
import 'package:riderescue_api/models/user/public_user/fields.dart';

class PublicUser {
  final String id;
  final String name;
  final String email;
  final UserStatus status;
  final List<UserRole> roles;
  final String phone;
  final String avatar;
  final String address;
  final GeoLocation? location;
  final bool isOnline;
  final bool emailVerified;
  final DateTime createdAt;
  final DateTime updatedAt;
  const PublicUser(
      {required this.id,
      required this.name,
      required this.email,
      required this.status,
      required this.roles,
      required this.phone,
      required this.avatar,
      required this.address,
      required this.location,
      required this.isOnline,
      required this.emailVerified,
      required this.createdAt,
      required this.updatedAt});
  PublicUser copyWith(
      {String? id,
      String? name,
      String? email,
      UserStatus? status,
      List<UserRole>? roles,
      String? phone,
      String? avatar,
      String? address,
      GeoLocation? location,
      bool? isOnline,
      bool? emailVerified,
      DateTime? createdAt,
      DateTime? updatedAt}) {
    return PublicUser(
        id: id ?? this.id,
        name: name ?? this.name,
        email: email ?? this.email,
        status: status ?? this.status,
        roles: roles ?? this.roles,
        phone: phone ?? this.phone,
        avatar: avatar ?? this.avatar,
        address: address ?? this.address,
        location: location ?? this.location,
        isOnline: isOnline ?? this.isOnline,
        emailVerified: emailVerified ?? this.emailVerified,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt);
  }

  factory PublicUser.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return PublicUser(
        id: map[PublicUserFields.id]?.toString() ?? "",
        name: map[PublicUserFields.name]?.toString() ?? "",
        email: map[PublicUserFields.email]?.toString() ?? "",
        status: UserStatus.fromValue(
            map[PublicUserFields.status]?.toString() ?? ""),
        roles: ((map[PublicUserFields.roles] as List?) ?? [])
            .map((item) => UserRole.fromValue(item?.toString() ?? ""))
            .toList(),
        phone: map[PublicUserFields.phone]?.toString() ?? "",
        avatar: map[PublicUserFields.avatar]?.toString() ?? "",
        address: map[PublicUserFields.address]?.toString() ?? "",
        location: map[PublicUserFields.location] == null
            ? null
            : GeoLocation.fromJson(Map<String, dynamic>.from(
                (map[PublicUserFields.location] as Map?) ?? {})),
        isOnline: map[PublicUserFields.isOnline] == true,
        emailVerified: map[PublicUserFields.emailVerified] == true,
        createdAt: DateTime.parse(map[PublicUserFields.createdAt].toString()),
        updatedAt: DateTime.parse(map[PublicUserFields.updatedAt].toString()));
  }

  Map<String, dynamic> toJson() {
    return {
      PublicUserFields.id: id,
      PublicUserFields.name: name,
      PublicUserFields.email: email,
      PublicUserFields.status: status.value,
      PublicUserFields.roles: roles.map((item) => item.value).toList(),
      PublicUserFields.phone: phone,
      PublicUserFields.avatar: avatar,
      PublicUserFields.address: address,
      PublicUserFields.location: location?.toJson(),
      PublicUserFields.isOnline: isOnline,
      PublicUserFields.emailVerified: emailVerified,
      PublicUserFields.createdAt: createdAt.toIso8601String(),
      PublicUserFields.updatedAt: updatedAt.toIso8601String()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('id: $id');
    parts.add('name: $name');
    parts.add('email: $email');
    parts.add('status: $status');
    parts.add('roles: $roles');
    parts.add('phone: $phone');
    parts.add('avatar: $avatar');
    parts.add('address: $address');
    parts.add('location: $location');
    parts.add('isOnline: $isOnline');
    parts.add('emailVerified: $emailVerified');
    parts.add('createdAt: $createdAt');
    parts.add('updatedAt: $updatedAt');
    return 'PublicUser(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    const equality = DeepCollectionEquality();

    return other is PublicUser &&
        other.id == id &&
        other.name == name &&
        other.email == email &&
        other.status == status &&
        equality.equals(other.roles, roles) &&
        other.phone == phone &&
        other.avatar == avatar &&
        other.address == address &&
        other.location == location &&
        other.isOnline == isOnline &&
        other.emailVerified == emailVerified &&
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
      status,
      equality.hash(roles),
      phone,
      avatar,
      address,
      location,
      isOnline,
      emailVerified,
      createdAt,
      updatedAt
    ]);
  }
}
