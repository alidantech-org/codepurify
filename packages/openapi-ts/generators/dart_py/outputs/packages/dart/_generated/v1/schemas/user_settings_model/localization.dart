class UserSettingsModelLocalization {
  final String language;
  final String timezone;
  final String dateFormat;
  final String timeFormat;

  const UserSettingsModelLocalization({
    required this.language,
    required this.timezone,
    required this.dateFormat,
    required this.timeFormat,
  });

  UserSettingsModelLocalization copyWith({
    String? language,
    String? timezone,
    String? dateFormat,
    String? timeFormat,
  }) {
    return UserSettingsModelLocalization(
      language: language ?? this.language,
      timezone: timezone ?? this.timezone,
      dateFormat: dateFormat ?? this.dateFormat,
      timeFormat: timeFormat ?? this.timeFormat,
    );
  }

  factory UserSettingsModelLocalization.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModelLocalization(
      language: map['language']?.toString() ?? "",
      timezone: map['timezone']?.toString() ?? "",
      dateFormat: map['dateFormat']?.toString() ?? "",
      timeFormat: map['timeFormat']?.toString() ?? "",
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'language': language,
      'timezone': timezone,
      'dateFormat': dateFormat,
      'timeFormat': timeFormat,
    };
  }

  @override
  String toString() {
    return 'UserSettingsModelLocalization('
        'language: $language, '
        'timezone: $timezone, '
        'dateFormat: $dateFormat, '
        'timeFormat: $timeFormat'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is UserSettingsModelLocalization &&
        other.language == language &&
        other.timezone == timezone &&
        other.dateFormat == dateFormat &&
        other.timeFormat == timeFormat;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      language,
      timezone,
      dateFormat,
      timeFormat,
    ]);
  }
}
