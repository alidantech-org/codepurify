class UpdateMySettingsRequest {
  final Map<String, Object?>? notifications;
  final Map<String, Object?>? appearance;
  final Map<String, Object?>? localization;
  final Map<String, Object?>? privacy;
  final Map<String, Object?>? security;
  final Map<String, Object?>? communication;

  const UpdateMySettingsRequest({
    this.notifications,
    this.appearance,
    this.localization,
    this.privacy,
    this.security,
    this.communication,
  });

  factory UpdateMySettingsRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateMySettingsRequest(
      notifications: map['notifications'] == null
          ? null
          : Map<String, Object?>.from(map['notifications'] as Map),
      appearance: map['appearance'] == null
          ? null
          : Map<String, Object?>.from(map['appearance'] as Map),
      localization: map['localization'] == null
          ? null
          : Map<String, Object?>.from(map['localization'] as Map),
      privacy: map['privacy'] == null
          ? null
          : Map<String, Object?>.from(map['privacy'] as Map),
      security: map['security'] == null
          ? null
          : Map<String, Object?>.from(map['security'] as Map),
      communication: map['communication'] == null
          ? null
          : Map<String, Object?>.from(map['communication'] as Map),
    );
  }

  Map<String, Object?> toJson() {
    return {
      if (notifications != null) 'notifications': notifications,
      if (appearance != null) 'appearance': appearance,
      if (localization != null) 'localization': localization,
      if (privacy != null) 'privacy': privacy,
      if (security != null) 'security': security,
      if (communication != null) 'communication': communication,
    };
  }
}
