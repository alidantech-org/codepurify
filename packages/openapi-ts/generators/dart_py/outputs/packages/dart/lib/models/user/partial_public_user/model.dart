// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: models\user\partial_public_user\model.dart

import 'package:collection/collection.dart';
import 'package:riderescue_api/dtos/shared/geo_location/model.dart';
import 'package:riderescue_api/enums/user_role/enum.dart';
import 'package:riderescue_api/enums/user_status/enum.dart';
import 'package:riderescue_api/models/user/partial_public_user/fields.dart';

class PartialPublicUser {
  final String? id;
  final String? name;
  final String? email;
  final UserStatus? status;
  final List<UserRole>? roles;
  final String? phone;
  final String? avatar;
  final String? address;
  final GeoLocation? location;
  final bool? isOnline;
  final bool? emailVerified;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  const PartialPublicUser(
      {this.id,
      this.name,
      this.email,
      this.status,
      this.roles,
      this.phone,
      this.avatar,
      this.address,
      this.location,
      this.isOnline,
      this.emailVerified,
      this.createdAt,
      this.updatedAt});
  PartialPublicUser copyWith(
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
    return PartialPublicUser(
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

  factory PartialPublicUser.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return PartialPublicUser(
        id: map[PartialPublicUserFields.id]?.toString(),
        name: map[PartialPublicUserFields.name]?.toString(),
        email: map[PartialPublicUserFields.email]?.toString(),
        status: map[PartialPublicUserFields.status] == null
            ? null
            : UserStatus.fromValue(
                map[PartialPublicUserFields.status].toString()),
        roles: ((map[PartialPublicUserFields.roles] as List?) ?? [])
            .map((item) => UserRole.fromValue(item?.toString() ?? ""))
            .toList(),
        phone: map[PartialPublicUserFields.phone]?.toString(),
        avatar: map[PartialPublicUserFields.avatar]?.toString(),
        address: map[PartialPublicUserFields.address]?.toString(),
        location: map[PartialPublicUserFields.location] == null
            ? null
            : GeoLocation.fromJson(Map<String, dynamic>.from(
                (map[PartialPublicUserFields.location] as Map?) ?? {})),
        isOnline: map[PartialPublicUserFields.isOnline] == null
            ? null
            : map[PartialPublicUserFields.isOnline] == true,
        emailVerified: map[PartialPublicUserFields.emailVerified] == null
            ? null
            : map[PartialPublicUserFields.emailVerified] == true,
        createdAt: map[PartialPublicUserFields.createdAt] == null
            ? null
            : DateTime.parse(map[PartialPublicUserFields.createdAt].toString()),
        updatedAt: map[PartialPublicUserFields.updatedAt] == null
            ? null
            : DateTime.parse(
                map[PartialPublicUserFields.updatedAt].toString()));
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) PartialPublicUserFields.id: id,
      if (name != null) PartialPublicUserFields.name: name,
      if (email != null) PartialPublicUserFields.email: email,
      if (status != null) PartialPublicUserFields.status: status?.value,
      if (roles != null)
        PartialPublicUserFields.roles:
            roles?.map((item) => item.value).toList(),
      if (phone != null) PartialPublicUserFields.phone: phone,
      if (avatar != null) PartialPublicUserFields.avatar: avatar,
      if (address != null) PartialPublicUserFields.address: address,
      if (location != null)
        PartialPublicUserFields.location: location?.toJson(),
      if (isOnline != null) PartialPublicUserFields.isOnline: isOnline,
      if (emailVerified != null)
        PartialPublicUserFields.emailVerified: emailVerified,
      if (createdAt != null)
        PartialPublicUserFields.createdAt: createdAt?.toIso8601String(),
      if (updatedAt != null)
        PartialPublicUserFields.updatedAt: updatedAt?.toIso8601String()
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
    return 'PartialPublicUser(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    const equality = DeepCollectionEquality();

    return other is PartialPublicUser &&
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
