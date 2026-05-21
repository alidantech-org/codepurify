class UserSettingsModelNotificationsQuietHours {
  final bool enabled;
  final String startTime;
  final String endTime;
  final String timezone;

  const UserSettingsModelNotificationsQuietHours({
    required this.enabled,
    required this.startTime,
    required this.endTime,
    required this.timezone,
  });

  UserSettingsModelNotificationsQuietHours copyWith({
    bool? enabled,
    String? startTime,
    String? endTime,
    String? timezone,
  }) {
    return UserSettingsModelNotificationsQuietHours(
      enabled: enabled ?? this.enabled,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      timezone: timezone ?? this.timezone,
    );
  }

  factory UserSettingsModelNotificationsQuietHours.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModelNotificationsQuietHours(
      enabled: map['enabled'] == true,
      startTime: map['startTime']?.toString() ?? "",
      endTime: map['endTime']?.toString() ?? "",
      timezone: map['timezone']?.toString() ?? "",
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'enabled': enabled,
      'startTime': startTime,
      'endTime': endTime,
      'timezone': timezone,
    };
  }

  @override
  String toString() {
    return 'UserSettingsModelNotificationsQuietHours('
        'enabled: $enabled, '
        'startTime: $startTime, '
        'endTime: $endTime, '
        'timezone: $timezone'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is UserSettingsModelNotificationsQuietHours &&
        other.enabled == enabled &&
        other.startTime == startTime &&
        other.endTime == endTime &&
        other.timezone == timezone;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      enabled,
      startTime,
      endTime,
      timezone,
    ]);
  }
}
