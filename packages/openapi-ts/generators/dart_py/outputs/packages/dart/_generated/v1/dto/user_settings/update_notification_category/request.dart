class UpdateNotificationCategoryRequest {
  final bool? inApp;
  final bool? email;
  final bool? push;
  final bool? sms;

  const UpdateNotificationCategoryRequest({
    this.inApp,
    this.email,
    this.push,
    this.sms,
  });

  factory UpdateNotificationCategoryRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateNotificationCategoryRequest(
      inApp: map['in_app'] == null ? null : map['in_app'] == true,
      email: map['email'] == null ? null : map['email'] == true,
      push: map['push'] == null ? null : map['push'] == true,
      sms: map['sms'] == null ? null : map['sms'] == true,
    );
  }

  Map<String, Object?> toJson() {
    return {
      if (inApp != null) 'in_app': inApp,
      if (email != null) 'email': email,
      if (push != null) 'push': push,
      if (sms != null) 'sms': sms,
    };
  }
}
