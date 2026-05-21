// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\update_current_user\body\model.dart

import 'package:riderescue_api/dtos/shared/geo_location/model.dart';
import 'package:riderescue_api/dtos/user/update_current_user/body/fields.dart';

class UpdateUserProfileBody {
  final String? name;
  final String? phone;
  final String? avatar;
  final String? address;
  final GeoLocation? location;
  const UpdateUserProfileBody(
      {this.name, this.phone, this.avatar, this.address, this.location});
  UpdateUserProfileBody copyWith(
      {String? name,
      String? phone,
      String? avatar,
      String? address,
      GeoLocation? location}) {
    return UpdateUserProfileBody(
        name: name ?? this.name,
        phone: phone ?? this.phone,
        avatar: avatar ?? this.avatar,
        address: address ?? this.address,
        location: location ?? this.location);
  }

  factory UpdateUserProfileBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return UpdateUserProfileBody(
        name: map[UpdateUserProfileBodyFields.name]?.toString(),
        phone: map[UpdateUserProfileBodyFields.phone]?.toString(),
        avatar: map[UpdateUserProfileBodyFields.avatar]?.toString(),
        address: map[UpdateUserProfileBodyFields.address]?.toString(),
        location: map[UpdateUserProfileBodyFields.location] == null
            ? null
            : GeoLocation.fromJson(Map<String, dynamic>.from(
                (map[UpdateUserProfileBodyFields.location] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      if (name != null) UpdateUserProfileBodyFields.name: name,
      if (phone != null) UpdateUserProfileBodyFields.phone: phone,
      if (avatar != null) UpdateUserProfileBodyFields.avatar: avatar,
      if (address != null) UpdateUserProfileBodyFields.address: address,
      if (location != null)
        UpdateUserProfileBodyFields.location: location?.toJson()
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
    return 'UpdateUserProfileBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UpdateUserProfileBody &&
        other.name == name &&
        other.phone == phone &&
        other.avatar == avatar &&
        other.address == address &&
        other.location == location;
  }

  @override
  int get hashCode {
    return Object.hashAll([name, phone, avatar, address, location]);
  }
}
