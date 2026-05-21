import 'user_roles.dart';
import 'user_status.dart';
import 'package:collection/collection.dart';

class UploadModelUser {
  final String id;
  final String name;
  final String email;
  final UploadModelUserStatus status;
  final List<UploadModelUserRoles> roles;
  final String? phone;
  final String? avatar;
  final String? address;
  final bool? isOnline;
  final bool? emailVerified;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const UploadModelUser({
    required this.id,
    required this.name,
    required this.email,
    required this.status,
    required this.roles,
    this.phone,
    this.avatar,
    this.address,
    this.isOnline,
    this.emailVerified,
    this.createdAt,
    this.updatedAt,
  });

  UploadModelUser copyWith({
    String? id,
    String? name,
    String? email,
    UploadModelUserStatus? status,
    List<UploadModelUserRoles>? roles,
    String? phone,
    String? avatar,
    String? address,
    bool? isOnline,
    bool? emailVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UploadModelUser(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      status: status ?? this.status,
      roles: roles ?? this.roles,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      address: address ?? this.address,
      isOnline: isOnline ?? this.isOnline,
      emailVerified: emailVerified ?? this.emailVerified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory UploadModelUser.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UploadModelUser(
      id: map['id']?.toString() ?? "",
      name: map['name']?.toString() ?? "",
      email: map['email']?.toString() ?? "",
      status: UploadModelUserStatus.fromValue(map['status']?.toString() ?? ""),
      roles: ((map['roles'] as List?) ?? [])
          .map((item) => UploadModelUserRoles.fromValue(item.toString()))
          .toList(),
      phone: map['phone']?.toString(),
      avatar: map['avatar']?.toString(),
      address: map['address']?.toString(),
      isOnline: map['isOnline'] == null ? null : map['isOnline'] == true,
      emailVerified:
          map['emailVerified'] == null ? null : map['emailVerified'] == true,
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
      'status': status.value,
      'roles': roles.map((item) => item.value).toList(),
      if (phone != null) 'phone': phone,
      if (avatar != null) 'avatar': avatar,
      if (address != null) 'address': address,
      if (isOnline != null) 'isOnline': isOnline,
      if (emailVerified != null) 'emailVerified': emailVerified,
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'UploadModelUser('
        'id: $id, '
        'name: $name, '
        'email: $email, '
        'status: $status, '
        'roles: $roles, '
        'phone: $phone, '
        'avatar: $avatar, '
        'address: $address, '
        'isOnline: $isOnline, '
        'emailVerified: $emailVerified, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is UploadModelUser &&
        other.id == id &&
        other.name == name &&
        other.email == email &&
        other.status == status &&
        equality.equals(other.roles, roles) &&
        other.phone == phone &&
        other.avatar == avatar &&
        other.address == address &&
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
      isOnline,
      emailVerified,
      createdAt,
      updatedAt,
    ]);
  }
}
