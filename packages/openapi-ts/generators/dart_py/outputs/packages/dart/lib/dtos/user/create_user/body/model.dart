// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\create_user\body\model.dart

import 'package:riderescue_api/dtos/shared/geo_location/model.dart';
import 'package:riderescue_api/dtos/user/create_user/body/fields.dart';

class CreateUserBody {
  final String name;
  final String email;
  final String password;
  final String confirmPassword;
  final String? phone;
  final String? avatar;
  final String? address;
  final GeoLocation? location;
  const CreateUserBody(
      {required this.name,
      required this.email,
      required this.password,
      required this.confirmPassword,
      this.phone,
      this.avatar,
      this.address,
      this.location});
  CreateUserBody copyWith(
      {String? name,
      String? email,
      String? password,
      String? confirmPassword,
      String? phone,
      String? avatar,
      String? address,
      GeoLocation? location}) {
    return CreateUserBody(
        name: name ?? this.name,
        email: email ?? this.email,
        password: password ?? this.password,
        confirmPassword: confirmPassword ?? this.confirmPassword,
        phone: phone ?? this.phone,
        avatar: avatar ?? this.avatar,
        address: address ?? this.address,
        location: location ?? this.location);
  }

  factory CreateUserBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return CreateUserBody(
        name: map[CreateUserBodyFields.name]?.toString() ?? "",
        email: map[CreateUserBodyFields.email]?.toString() ?? "",
        password: map[CreateUserBodyFields.password]?.toString() ?? "",
        confirmPassword:
            map[CreateUserBodyFields.confirmPassword]?.toString() ?? "",
        phone: map[CreateUserBodyFields.phone]?.toString(),
        avatar: map[CreateUserBodyFields.avatar]?.toString(),
        address: map[CreateUserBodyFields.address]?.toString(),
        location: map[CreateUserBodyFields.location] == null
            ? null
            : GeoLocation.fromJson(Map<String, dynamic>.from(
                (map[CreateUserBodyFields.location] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      CreateUserBodyFields.name: name,
      CreateUserBodyFields.email: email,
      CreateUserBodyFields.password: password,
      CreateUserBodyFields.confirmPassword: confirmPassword,
      if (phone != null) CreateUserBodyFields.phone: phone,
      if (avatar != null) CreateUserBodyFields.avatar: avatar,
      if (address != null) CreateUserBodyFields.address: address,
      if (location != null) CreateUserBodyFields.location: location?.toJson()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('name: $name');
    parts.add('email: $email');
    parts.add('password: ***');
    parts.add('confirmPassword: ***');
    parts.add('phone: $phone');
    parts.add('avatar: $avatar');
    parts.add('address: $address');
    parts.add('location: $location');
    return 'CreateUserBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is CreateUserBody &&
        other.name == name &&
        other.email == email &&
        other.password == password &&
        other.confirmPassword == confirmPassword &&
        other.phone == phone &&
        other.avatar == avatar &&
        other.address == address &&
        other.location == location;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      name,
      email,
      password,
      confirmPassword,
      phone,
      avatar,
      address,
      location
    ]);
  }
}
