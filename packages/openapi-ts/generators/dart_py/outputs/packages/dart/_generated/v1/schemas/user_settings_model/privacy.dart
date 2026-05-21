class UserSettingsModelPrivacy {
  final String profileVisibility;
  final bool showOnlineStatus;
  final bool allowSearchIndexing;

  const UserSettingsModelPrivacy({
    required this.profileVisibility,
    required this.showOnlineStatus,
    required this.allowSearchIndexing,
  });

  UserSettingsModelPrivacy copyWith({
    String? profileVisibility,
    bool? showOnlineStatus,
    bool? allowSearchIndexing,
  }) {
    return UserSettingsModelPrivacy(
      profileVisibility: profileVisibility ?? this.profileVisibility,
      showOnlineStatus: showOnlineStatus ?? this.showOnlineStatus,
      allowSearchIndexing: allowSearchIndexing ?? this.allowSearchIndexing,
    );
  }

  factory UserSettingsModelPrivacy.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModelPrivacy(
      profileVisibility: map['profileVisibility']?.toString() ?? "",
      showOnlineStatus: map['showOnlineStatus'] == true,
      allowSearchIndexing: map['allowSearchIndexing'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'profileVisibility': profileVisibility,
      'showOnlineStatus': showOnlineStatus,
      'allowSearchIndexing': allowSearchIndexing,
    };
  }

  @override
  String toString() {
    return 'UserSettingsModelPrivacy('
        'profileVisibility: $profileVisibility, '
        'showOnlineStatus: $showOnlineStatus, '
        'allowSearchIndexing: $allowSearchIndexing'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is UserSettingsModelPrivacy &&
        other.profileVisibility == profileVisibility &&
        other.showOnlineStatus == showOnlineStatus &&
        other.allowSearchIndexing == allowSearchIndexing;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      profileVisibility,
      showOnlineStatus,
      allowSearchIndexing,
    ]);
  }
}
