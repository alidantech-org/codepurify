class UserSettingsModelNotificationsChannels {
  final bool inApp;
  final bool email;
  final bool push;
  final bool sms;

  const UserSettingsModelNotificationsChannels({
    required this.inApp,
    required this.email,
    required this.push,
    required this.sms,
  });

  UserSettingsModelNotificationsChannels copyWith({
    bool? inApp,
    bool? email,
    bool? push,
    bool? sms,
  }) {
    return UserSettingsModelNotificationsChannels(
      inApp: inApp ?? this.inApp,
      email: email ?? this.email,
      push: push ?? this.push,
      sms: sms ?? this.sms,
    );
  }

  factory UserSettingsModelNotificationsChannels.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModelNotificationsChannels(
      inApp: map['in_app'] == true,
      email: map['email'] == true,
      push: map['push'] == true,
      sms: map['sms'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'in_app': inApp,
      'email': email,
      'push': push,
      'sms': sms,
    };
  }

  @override
  String toString() {
    return 'UserSettingsModelNotificationsChannels('
        'inApp: $inApp, '
        'email: $email, '
        'push: $push, '
        'sms: $sms'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is UserSettingsModelNotificationsChannels &&
        other.inApp == inApp &&
        other.email == email &&
        other.push == push &&
        other.sms == sms;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      inApp,
      email,
      push,
      sms,
    ]);
  }
}
