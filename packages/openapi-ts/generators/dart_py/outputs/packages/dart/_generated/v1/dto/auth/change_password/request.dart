class ChangePasswordRequest {
  final String currentPassword;
  final String newPassword;
  final String confirmPassword;

  const ChangePasswordRequest({
    required this.currentPassword,
    required this.newPassword,
    required this.confirmPassword,
  });

  factory ChangePasswordRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ChangePasswordRequest(
      currentPassword: map['currentPassword']?.toString() ?? "",
      newPassword: map['newPassword']?.toString() ?? "",
      confirmPassword: map['confirmPassword']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
      'confirmPassword': confirmPassword,
    };
  }
}
