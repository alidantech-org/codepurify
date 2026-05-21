// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

import 'global.dart';

class User {
  final String id;
  final String name;
  final String email;
  final String password;
  final UserStatus status;
  final List<UserRoles> roles;
  final String? phone;
  final String? avatar;
  final String? address;
  final GeoLocation? location;
  final bool isOnline;
  final bool emailVerified;
  final String? emailVerificationOtp;
  final DateTime? emailVerificationOtpExpires;
  final String? resetPasswordOtp;
  final DateTime? resetPasswordOtpExpires;
  final DateTime? passwordChangedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.password,
    required this.status,
    required this.roles,
    this.phone,
    this.avatar,
    this.address,
    this.location,
    required this.isOnline,
    required this.emailVerified,
    this.emailVerificationOtp,
    this.emailVerificationOtpExpires,
    this.resetPasswordOtp,
    this.resetPasswordOtpExpires,
    this.passwordChangedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      password: json['password'] ?? '',
      status: UserStatus.fromJson(json['status'] as String?) ??
          UserStatus.values.first,
      roles: json['roles'] == null
          ? <UserRoles>[]
          : (json['roles'] as List)
              .map((e) => UserRoles.fromJson(e as String)!)
              .toList(),
      phone: json['phone'],
      avatar: json['avatar'],
      address: json['address'],
      location: json['location'] == null
          ? null
          : GeoLocation.fromJson(
              Map<String, dynamic>.from(json['location'] as Map)),
      isOnline: json['isOnline'] ?? false,
      emailVerified: json['emailVerified'] ?? false,
      emailVerificationOtp: json['emailVerificationOtp'],
      emailVerificationOtpExpires: json['emailVerificationOtpExpires'] == null
          ? null
          : DateTime.parse(json['emailVerificationOtpExpires'] as String),
      resetPasswordOtp: json['resetPasswordOtp'],
      resetPasswordOtpExpires: json['resetPasswordOtpExpires'] == null
          ? null
          : DateTime.parse(json['resetPasswordOtpExpires'] as String),
      passwordChangedAt: json['passwordChangedAt'] == null
          ? null
          : DateTime.parse(json['passwordChangedAt'] as String),
      createdAt: json['createdAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'password': password,
      'status': status.toJson(),
      'roles': roles.map((e) => e.toJson()).toList(),
      'phone': phone,
      'avatar': avatar,
      'address': address,
      'location': location?.toJson(),
      'isOnline': isOnline,
      'emailVerified': emailVerified,
      'emailVerificationOtp': emailVerificationOtp,
      'emailVerificationOtpExpires':
          emailVerificationOtpExpires?.toIso8601String(),
      'resetPasswordOtp': resetPasswordOtp,
      'resetPasswordOtpExpires': resetPasswordOtpExpires?.toIso8601String(),
      'passwordChangedAt': passwordChangedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? password,
    UserStatus? status,
    List<UserRoles>? roles,
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
    DateTime? updatedAt,
  }) {
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
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

enum UserStatus {
  active('active'),
  suspended('suspended'),
  deleted('deleted');

  final String value;

  const UserStatus(this.value);

  static UserStatus? fromJson(String? value) {
    if (value == null) return null;

    return UserStatus.values.firstWhere(
      (item) => item.value == value,
      orElse: () => UserStatus.active,
    );
  }

  String toJson() => value;
}

enum UserRoles {
  admin('admin'),
  user('user'),
  serviceProvider('service_provider'),
  driver('driver');

  final String value;

  const UserRoles(this.value);

  static UserRoles? fromJson(String? value) {
    if (value == null) return null;

    return UserRoles.values.firstWhere(
      (item) => item.value == value,
      orElse: () => UserRoles.admin,
    );
  }

  String toJson() => value;
}
