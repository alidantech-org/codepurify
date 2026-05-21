class UpdateCurrentUserRequest {
  final String? name;
  final String? phone;
  final String? avatar;
  final String? address;

  const UpdateCurrentUserRequest({
    this.name,
    this.phone,
    this.avatar,
    this.address,
  });

  factory UpdateCurrentUserRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateCurrentUserRequest(
      name: map['name']?.toString(),
      phone: map['phone']?.toString(),
      avatar: map['avatar']?.toString(),
      address: map['address']?.toString(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      if (name != null) 'name': name,
      if (phone != null) 'phone': phone,
      if (avatar != null) 'avatar': avatar,
      if (address != null) 'address': address,
    };
  }
}
