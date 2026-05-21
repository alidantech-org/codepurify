import 'roles.dart';
import 'status.dart';
import 'package:collection/collection.dart';

class PartialPublicUserModel {
  final String? id;
  final String? name;
  final String? email;
  final PartialPublicUserModelStatus? status;
  final List<PartialPublicUserModelRoles>? roles;
  final String? phone;
  final String? avatar;
  final String? address;
  final bool? isOnline;
  final bool? emailVerified;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const PartialPublicUserModel({
    this.id,
    this.name,
    this.email,
    this.status,
    this.roles,
    this.phone,
    this.avatar,
    this.address,
    this.isOnline,
    this.emailVerified,
    this.createdAt,
    this.updatedAt,
  });

  PartialPublicUserModel copyWith({
    String? id,
    String? name,
    String? email,
    PartialPublicUserModelStatus? status,
    List<PartialPublicUserModelRoles>? roles,
    String? phone,
    String? avatar,
    String? address,
    bool? isOnline,
    bool? emailVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PartialPublicUserModel(
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

  factory PartialPublicUserModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return PartialPublicUserModel(
      id: map['id']?.toString(),
      name: map['name']?.toString(),
      email: map['email']?.toString(),
      status: map['status'] == null
          ? null
          : PartialPublicUserModelStatus.fromValue(map['status'].toString()),
      roles: ((map['roles'] as List?) ?? [])
          .map((item) => PartialPublicUserModelRoles.fromValue(item.toString()))
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
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (email != null) 'email': email,
      if (status != null) 'status': status?.value,
      if (roles != null) 'roles': roles!.map((item) => item.value).toList(),
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
    return 'PartialPublicUserModel('
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

    return other is PartialPublicUserModel &&
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
