// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\signup\body\model.dart

import 'package:riderescue_api/dtos/auth/signup/body/fields.dart';

class SignupBody {
  final String email;
  final String password;
  final String confirmPassword;
  final String name;
  final String? phone;
  final String? avatar;
  final String address;
  const SignupBody(
      {required this.email,
      required this.password,
      required this.confirmPassword,
      required this.name,
      this.phone,
      this.avatar,
      required this.address});
  SignupBody copyWith(
      {String? email,
      String? password,
      String? confirmPassword,
      String? name,
      String? phone,
      String? avatar,
      String? address}) {
    return SignupBody(
        email: email ?? this.email,
        password: password ?? this.password,
        confirmPassword: confirmPassword ?? this.confirmPassword,
        name: name ?? this.name,
        phone: phone ?? this.phone,
        avatar: avatar ?? this.avatar,
        address: address ?? this.address);
  }

  factory SignupBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return SignupBody(
        email: map[SignupBodyFields.email]?.toString() ?? "",
        password: map[SignupBodyFields.password]?.toString() ?? "",
        confirmPassword:
            map[SignupBodyFields.confirmPassword]?.toString() ?? "",
        name: map[SignupBodyFields.name]?.toString() ?? "",
        phone: map[SignupBodyFields.phone]?.toString(),
        avatar: map[SignupBodyFields.avatar]?.toString(),
        address: map[SignupBodyFields.address]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      SignupBodyFields.email: email,
      SignupBodyFields.password: password,
      SignupBodyFields.confirmPassword: confirmPassword,
      SignupBodyFields.name: name,
      if (phone != null) SignupBodyFields.phone: phone,
      if (avatar != null) SignupBodyFields.avatar: avatar,
      SignupBodyFields.address: address
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('email: $email');
    parts.add('password: ***');
    parts.add('confirmPassword: ***');
    parts.add('name: $name');
    parts.add('phone: $phone');
    parts.add('avatar: $avatar');
    parts.add('address: $address');
    return 'SignupBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SignupBody &&
        other.email == email &&
        other.password == password &&
        other.confirmPassword == confirmPassword &&
        other.name == name &&
        other.phone == phone &&
        other.avatar == avatar &&
        other.address == address;
  }

  @override
  int get hashCode {
    return Object.hashAll(
        [email, password, confirmPassword, name, phone, avatar, address]);
  }
}
