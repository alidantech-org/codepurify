import 'roles.dart';
import 'status.dart';
import 'package:collection/collection.dart';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String password;
  final UserModelStatus status;
  final List<UserModelRoles> roles;
  final String? phone;
  final String? avatar;
  final String? address;
  final bool? isOnline;
  final bool? emailVerified;
  final String? emailVerificationOtp;
  final DateTime? emailVerificationOtpExpires;
  final String? resetPasswordOtp;
  final DateTime? resetPasswordOtpExpires;
  final DateTime? passwordChangedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.password,
    required this.status,
    required this.roles,
    this.phone,
    this.avatar,
    this.address,
    this.isOnline,
    this.emailVerified,
    this.emailVerificationOtp,
    this.emailVerificationOtpExpires,
    this.resetPasswordOtp,
    this.resetPasswordOtpExpires,
    this.passwordChangedAt,
    this.createdAt,
    this.updatedAt,
  });

  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? password,
    UserModelStatus? status,
    List<UserModelRoles>? roles,
    String? phone,
    String? avatar,
    String? address,
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
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      password: password ?? this.password,
      status: status ?? this.status,
      roles: roles ?? this.roles,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      address: address ?? this.address,
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

  factory UserModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserModel(
      id: map['id']?.toString() ?? "",
      name: map['name']?.toString() ?? "",
      email: map['email']?.toString() ?? "",
      password: map['password']?.toString() ?? "",
      status: UserModelStatus.fromValue(map['status']?.toString() ?? ""),
      roles: ((map['roles'] as List?) ?? [])
          .map((item) => UserModelRoles.fromValue(item.toString()))
          .toList(),
      phone: map['phone']?.toString(),
      avatar: map['avatar']?.toString(),
      address: map['address']?.toString(),
      isOnline: map['isOnline'] == null ? null : map['isOnline'] == true,
      emailVerified:
          map['emailVerified'] == null ? null : map['emailVerified'] == true,
      emailVerificationOtp: map['emailVerificationOtp']?.toString(),
      emailVerificationOtpExpires: map['emailVerificationOtpExpires'] == null
          ? null
          : DateTime.parse(map['emailVerificationOtpExpires'].toString()),
      resetPasswordOtp: map['resetPasswordOtp']?.toString(),
      resetPasswordOtpExpires: map['resetPasswordOtpExpires'] == null
          ? null
          : DateTime.parse(map['resetPasswordOtpExpires'].toString()),
      passwordChangedAt: map['passwordChangedAt'] == null
          ? null
          : DateTime.parse(map['passwordChangedAt'].toString()),
      createdAt: map['createdAt'] == null
          ? null
          : DateTime.parse(map['createdAt'].toString()),
      updatedAt: map['updatedAt'] == null
          ? null
          : DateTime.parse(map['updatedAt'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'password': password,
      'status': status.value,
      'roles': roles.map((item) => item.value).toList(),
      if (phone != null) 'phone': phone,
      if (avatar != null) 'avatar': avatar,
      if (address != null) 'address': address,
      if (isOnline != null) 'isOnline': isOnline,
      if (emailVerified != null) 'emailVerified': emailVerified,
      if (emailVerificationOtp != null)
        'emailVerificationOtp': emailVerificationOtp,
      if (emailVerificationOtpExpires != null)
        'emailVerificationOtpExpires':
            emailVerificationOtpExpires?.toIso8601String(),
      if (resetPasswordOtp != null) 'resetPasswordOtp': resetPasswordOtp,
      if (resetPasswordOtpExpires != null)
        'resetPasswordOtpExpires': resetPasswordOtpExpires?.toIso8601String(),
      if (passwordChangedAt != null)
        'passwordChangedAt': passwordChangedAt?.toIso8601String(),
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'UserModel('
        'id: $id, '
        'name: $name, '
        'email: $email, '
        'password: $password, '
        'status: $status, '
        'roles: $roles, '
        'phone: $phone, '
        'avatar: $avatar, '
        'address: $address, '
        'isOnline: $isOnline, '
        'emailVerified: $emailVerified, '
        'emailVerificationOtp: $emailVerificationOtp, '
        'emailVerificationOtpExpires: $emailVerificationOtpExpires, '
        'resetPasswordOtp: $resetPasswordOtp, '
        'resetPasswordOtpExpires: $resetPasswordOtpExpires, '
        'passwordChangedAt: $passwordChangedAt, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is UserModel &&
        other.id == id &&
        other.name == name &&
        other.email == email &&
        other.password == password &&
        other.status == status &&
        equality.equals(other.roles, roles) &&
        other.phone == phone &&
        other.avatar == avatar &&
        other.address == address &&
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
      isOnline,
      emailVerified,
      emailVerificationOtp,
      emailVerificationOtpExpires,
      resetPasswordOtp,
      resetPasswordOtpExpires,
      passwordChangedAt,
      createdAt,
      updatedAt,
    ]);
  }
}
