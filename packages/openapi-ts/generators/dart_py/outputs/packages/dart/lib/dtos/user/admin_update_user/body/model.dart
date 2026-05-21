// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\admin_update_user\body\model.dart

import 'package:collection/collection.dart';
import 'package:riderescue_api/dtos/shared/geo_location/model.dart';
import 'package:riderescue_api/dtos/user/admin_update_user/body/fields.dart';
import 'package:riderescue_api/enums/user_role/enum.dart';
import 'package:riderescue_api/enums/user_status/enum.dart';

class AdminUpdateUserBody {
  final String? name;
  final String? phone;
  final String? avatar;
  final String? address;
  final GeoLocation? location;
  final UserStatus? status;
  final List<UserRole>? roles;
  final bool? isOnline;
  final bool? emailVerified;
  const AdminUpdateUserBody(
      {this.name,
      this.phone,
      this.avatar,
      this.address,
      this.location,
      this.status,
      this.roles,
      this.isOnline,
      this.emailVerified});
  AdminUpdateUserBody copyWith(
      {String? name,
      String? phone,
      String? avatar,
      String? address,
      GeoLocation? location,
      UserStatus? status,
      List<UserRole>? roles,
      bool? isOnline,
      bool? emailVerified}) {
    return AdminUpdateUserBody(
        name: name ?? this.name,
        phone: phone ?? this.phone,
        avatar: avatar ?? this.avatar,
        address: address ?? this.address,
        location: location ?? this.location,
        status: status ?? this.status,
        roles: roles ?? this.roles,
        isOnline: isOnline ?? this.isOnline,
        emailVerified: emailVerified ?? this.emailVerified);
  }

  factory AdminUpdateUserBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return AdminUpdateUserBody(
        name: map[AdminUpdateUserBodyFields.name]?.toString(),
        phone: map[AdminUpdateUserBodyFields.phone]?.toString(),
        avatar: map[AdminUpdateUserBodyFields.avatar]?.toString(),
        address: map[AdminUpdateUserBodyFields.address]?.toString(),
        location: map[AdminUpdateUserBodyFields.location] == null
            ? null
            : GeoLocation.fromJson(Map<String, dynamic>.from(
                (map[AdminUpdateUserBodyFields.location] as Map?) ?? {})),
        status: map[AdminUpdateUserBodyFields.status] == null
            ? null
            : UserStatus.fromValue(
                map[AdminUpdateUserBodyFields.status].toString()),
        roles: ((map[AdminUpdateUserBodyFields.roles] as List?) ?? [])
            .map((item) => UserRole.fromValue(item?.toString() ?? ""))
            .toList(),
        isOnline: map[AdminUpdateUserBodyFields.isOnline] == null
            ? null
            : map[AdminUpdateUserBodyFields.isOnline] == true,
        emailVerified: map[AdminUpdateUserBodyFields.emailVerified] == null
            ? null
            : map[AdminUpdateUserBodyFields.emailVerified] == true);
  }

  Map<String, dynamic> toJson() {
    return {
      if (name != null) AdminUpdateUserBodyFields.name: name,
      if (phone != null) AdminUpdateUserBodyFields.phone: phone,
      if (avatar != null) AdminUpdateUserBodyFields.avatar: avatar,
      if (address != null) AdminUpdateUserBodyFields.address: address,
      if (location != null)
        AdminUpdateUserBodyFields.location: location?.toJson(),
      if (status != null) AdminUpdateUserBodyFields.status: status?.value,
      if (roles != null)
        AdminUpdateUserBodyFields.roles:
            roles?.map((item) => item.value).toList(),
      if (isOnline != null) AdminUpdateUserBodyFields.isOnline: isOnline,
      if (emailVerified != null)
        AdminUpdateUserBodyFields.emailVerified: emailVerified
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('name: $name');
    parts.add('phone: $phone');
    parts.add('avatar: $avatar');
    parts.add('address: $address');
    parts.add('location: $location');
    parts.add('status: $status');
    parts.add('roles: $roles');
    parts.add('isOnline: $isOnline');
    parts.add('emailVerified: $emailVerified');
    return 'AdminUpdateUserBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    const equality = DeepCollectionEquality();

    return other is AdminUpdateUserBody &&
        other.name == name &&
        other.phone == phone &&
        other.avatar == avatar &&
        other.address == address &&
        other.location == location &&
        other.status == status &&
        equality.equals(other.roles, roles) &&
        other.isOnline == isOnline &&
        other.emailVerified == emailVerified;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      name,
      phone,
      avatar,
      address,
      location,
      status,
      equality.hash(roles),
      isOnline,
      emailVerified
    ]);
  }
}
