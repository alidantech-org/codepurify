class UserSettingsModelSecurity {
  final bool twoFactorEnabled;
  final bool loginAlerts;
  final bool trustedDevicesEnabled;

  const UserSettingsModelSecurity({
    required this.twoFactorEnabled,
    required this.loginAlerts,
    required this.trustedDevicesEnabled,
  });

  UserSettingsModelSecurity copyWith({
    bool? twoFactorEnabled,
    bool? loginAlerts,
    bool? trustedDevicesEnabled,
  }) {
    return UserSettingsModelSecurity(
      twoFactorEnabled: twoFactorEnabled ?? this.twoFactorEnabled,
      loginAlerts: loginAlerts ?? this.loginAlerts,
      trustedDevicesEnabled:
          trustedDevicesEnabled ?? this.trustedDevicesEnabled,
    );
  }

  factory UserSettingsModelSecurity.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModelSecurity(
      twoFactorEnabled: map['twoFactorEnabled'] == true,
      loginAlerts: map['loginAlerts'] == true,
      trustedDevicesEnabled: map['trustedDevicesEnabled'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'twoFactorEnabled': twoFactorEnabled,
      'loginAlerts': loginAlerts,
      'trustedDevicesEnabled': trustedDevicesEnabled,
    };
  }

  @override
  String toString() {
    return 'UserSettingsModelSecurity('
        'twoFactorEnabled: $twoFactorEnabled, '
        'loginAlerts: $loginAlerts, '
        'trustedDevicesEnabled: $trustedDevicesEnabled'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is UserSettingsModelSecurity &&
        other.twoFactorEnabled == twoFactorEnabled &&
        other.loginAlerts == loginAlerts &&
        other.trustedDevicesEnabled == trustedDevicesEnabled;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      twoFactorEnabled,
      loginAlerts,
      trustedDevicesEnabled,
    ]);
  }
}
