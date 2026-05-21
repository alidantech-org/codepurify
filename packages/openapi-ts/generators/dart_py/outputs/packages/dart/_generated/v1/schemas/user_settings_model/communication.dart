class UserSettingsModelCommunication {
  final bool allowSupportEmails;
  final bool allowProductUpdates;
  final bool allowMarketingEmails;

  const UserSettingsModelCommunication({
    required this.allowSupportEmails,
    required this.allowProductUpdates,
    required this.allowMarketingEmails,
  });

  UserSettingsModelCommunication copyWith({
    bool? allowSupportEmails,
    bool? allowProductUpdates,
    bool? allowMarketingEmails,
  }) {
    return UserSettingsModelCommunication(
      allowSupportEmails: allowSupportEmails ?? this.allowSupportEmails,
      allowProductUpdates: allowProductUpdates ?? this.allowProductUpdates,
      allowMarketingEmails: allowMarketingEmails ?? this.allowMarketingEmails,
    );
  }

  factory UserSettingsModelCommunication.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModelCommunication(
      allowSupportEmails: map['allowSupportEmails'] == true,
      allowProductUpdates: map['allowProductUpdates'] == true,
      allowMarketingEmails: map['allowMarketingEmails'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'allowSupportEmails': allowSupportEmails,
      'allowProductUpdates': allowProductUpdates,
      'allowMarketingEmails': allowMarketingEmails,
    };
  }

  @override
  String toString() {
    return 'UserSettingsModelCommunication('
        'allowSupportEmails: $allowSupportEmails, '
        'allowProductUpdates: $allowProductUpdates, '
        'allowMarketingEmails: $allowMarketingEmails'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is UserSettingsModelCommunication &&
        other.allowSupportEmails == allowSupportEmails &&
        other.allowProductUpdates == allowProductUpdates &&
        other.allowMarketingEmails == allowMarketingEmails;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      allowSupportEmails,
      allowProductUpdates,
      allowMarketingEmails,
    ]);
  }
}
