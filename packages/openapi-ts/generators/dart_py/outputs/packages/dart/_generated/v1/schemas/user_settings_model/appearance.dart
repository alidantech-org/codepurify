class UserSettingsModelAppearance {
  final String theme;
  final String density;
  final String? accentColor;

  const UserSettingsModelAppearance({
    required this.theme,
    required this.density,
    this.accentColor,
  });

  UserSettingsModelAppearance copyWith({
    String? theme,
    String? density,
    String? accentColor,
  }) {
    return UserSettingsModelAppearance(
      theme: theme ?? this.theme,
      density: density ?? this.density,
      accentColor: accentColor ?? this.accentColor,
    );
  }

  factory UserSettingsModelAppearance.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModelAppearance(
      theme: map['theme']?.toString() ?? "",
      density: map['density']?.toString() ?? "",
      accentColor: map['accentColor']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'theme': theme,
      'density': density,
      if (accentColor != null) 'accentColor': accentColor,
    };
  }

  @override
  String toString() {
    return 'UserSettingsModelAppearance('
        'theme: $theme, '
        'density: $density, '
        'accentColor: $accentColor'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is UserSettingsModelAppearance &&
        other.theme == theme &&
        other.density == density &&
        other.accentColor == accentColor;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      theme,
      density,
      accentColor,
    ]);
  }
}
