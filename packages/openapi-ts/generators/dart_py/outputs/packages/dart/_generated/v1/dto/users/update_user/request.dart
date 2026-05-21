class UpdateUserRequest {
  final String? name;
  final String? phone;
  final String? avatar;
  final String? address;
  final String? status;
  final List<String>? roles;
  final bool? isOnline;
  final bool? emailVerified;

  const UpdateUserRequest({
    this.name,
    this.phone,
    this.avatar,
    this.address,
    this.status,
    this.roles,
    this.isOnline,
    this.emailVerified,
  });

  factory UpdateUserRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateUserRequest(
      name: map['name']?.toString(),
      phone: map['phone']?.toString(),
      avatar: map['avatar']?.toString(),
      address: map['address']?.toString(),
      status: map['status']?.toString(),
      roles: map['roles'] == null
          ? null
          : ((map['roles'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      isOnline: map['isOnline'] == null ? null : map['isOnline'] == true,
      emailVerified:
          map['emailVerified'] == null ? null : map['emailVerified'] == true,
    );
  }

  Map<String, Object?> toJson() {
    return {
      if (name != null) 'name': name,
      if (phone != null) 'phone': phone,
      if (avatar != null) 'avatar': avatar,
      if (address != null) 'address': address,
      if (status != null) 'status': status,
      if (roles != null) 'roles': roles,
      if (isOnline != null) 'isOnline': isOnline,
      if (emailVerified != null) 'emailVerified': emailVerified,
    };
  }
}
