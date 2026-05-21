// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

import 'user.dart';

class NotificationChannelSettings {
  final bool in_app;
  final bool email;
  final bool push;
  final bool sms;

  const NotificationChannelSettings({
    required this.in_app,
    required this.email,
    required this.push,
    required this.sms,
  });

  factory NotificationChannelSettings.fromJson(Map<String, dynamic> json) {
    return NotificationChannelSettings(
      in_app: json['in_app'] ?? false,
      email: json['email'] ?? false,
      push: json['push'] ?? false,
      sms: json['sms'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'in_app': in_app,
      'email': email,
      'push': push,
      'sms': sms,
    };
  }

  NotificationChannelSettings copyWith({
    bool? in_app,
    bool? email,
    bool? push,
    bool? sms,
  }) {
    return NotificationChannelSettings(
      in_app: in_app ?? this.in_app,
      email: email ?? this.email,
      push: push ?? this.push,
      sms: sms ?? this.sms,
    );
  }
}

class UserNotificationSettings {
  final bool enabled;
  final NotificationChannelSettings channels;
  final Map<String, dynamic> categories;
  final QuietHours quietHours;

  const UserNotificationSettings({
    required this.enabled,
    required this.channels,
    required this.categories,
    required this.quietHours,
  });

  factory UserNotificationSettings.fromJson(Map<String, dynamic> json) {
    return UserNotificationSettings(
      enabled: json['enabled'] ?? false,
      channels: json['channels'] == null
          ? NotificationChannelSettings.fromJson(<String, dynamic>{})
          : NotificationChannelSettings.fromJson(
              Map<String, dynamic>.from(json['channels'] as Map)),
      categories: json['categories'] == null
          ? <String, dynamic>{}
          : Map<String, dynamic>.from(json['categories'] as Map),
      quietHours: json['quietHours'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'enabled': enabled,
      'channels': channels.toJson(),
      'categories': categories,
      'quietHours': quietHours,
    };
  }

  UserNotificationSettings copyWith({
    bool? enabled,
    NotificationChannelSettings? channels,
    Map<String, dynamic>? categories,
    QuietHours? quietHours,
  }) {
    return UserNotificationSettings(
      enabled: enabled ?? this.enabled,
      channels: channels ?? this.channels,
      categories: categories ?? this.categories,
      quietHours: quietHours ?? this.quietHours,
    );
  }
}

class UserAppearanceSettings {
  final UserTheme theme;
  final UserDensity density;
  final String? accentColor;

  const UserAppearanceSettings({
    required this.theme,
    required this.density,
    this.accentColor,
  });

  factory UserAppearanceSettings.fromJson(Map<String, dynamic> json) {
    return UserAppearanceSettings(
      theme: UserTheme.fromJson(json['theme'] as String?) ??
          UserTheme.values.first,
      density: UserDensity.fromJson(json['density'] as String?) ??
          UserDensity.values.first,
      accentColor: json['accentColor'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'theme': theme.toJson(),
      'density': density.toJson(),
      'accentColor': accentColor,
    };
  }

  UserAppearanceSettings copyWith({
    UserTheme? theme,
    UserDensity? density,
    String? accentColor,
  }) {
    return UserAppearanceSettings(
      theme: theme ?? this.theme,
      density: density ?? this.density,
      accentColor: accentColor ?? this.accentColor,
    );
  }
}

class UserLocalizationSettings {
  final UserLanguage language;
  final String timezone;
  final String dateFormat;
  final String timeFormat;

  const UserLocalizationSettings({
    required this.language,
    required this.timezone,
    required this.dateFormat,
    required this.timeFormat,
  });

  factory UserLocalizationSettings.fromJson(Map<String, dynamic> json) {
    return UserLocalizationSettings(
      language: UserLanguage.fromJson(json['language'] as String?) ??
          UserLanguage.values.first,
      timezone: json['timezone'] ?? '',
      dateFormat: json['dateFormat'] ?? '',
      timeFormat: json['timeFormat'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'language': language.toJson(),
      'timezone': timezone,
      'dateFormat': dateFormat,
      'timeFormat': timeFormat,
    };
  }

  UserLocalizationSettings copyWith({
    UserLanguage? language,
    String? timezone,
    String? dateFormat,
    String? timeFormat,
  }) {
    return UserLocalizationSettings(
      language: language ?? this.language,
      timezone: timezone ?? this.timezone,
      dateFormat: dateFormat ?? this.dateFormat,
      timeFormat: timeFormat ?? this.timeFormat,
    );
  }
}

class UserPrivacySettings {
  final String profileVisibility;
  final bool showOnlineStatus;
  final bool allowSearchIndexing;

  const UserPrivacySettings({
    required this.profileVisibility,
    required this.showOnlineStatus,
    required this.allowSearchIndexing,
  });

  factory UserPrivacySettings.fromJson(Map<String, dynamic> json) {
    return UserPrivacySettings(
      profileVisibility: json['profileVisibility'] ?? '',
      showOnlineStatus: json['showOnlineStatus'] ?? false,
      allowSearchIndexing: json['allowSearchIndexing'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'profileVisibility': profileVisibility,
      'showOnlineStatus': showOnlineStatus,
      'allowSearchIndexing': allowSearchIndexing,
    };
  }

  UserPrivacySettings copyWith({
    String? profileVisibility,
    bool? showOnlineStatus,
    bool? allowSearchIndexing,
  }) {
    return UserPrivacySettings(
      profileVisibility: profileVisibility ?? this.profileVisibility,
      showOnlineStatus: showOnlineStatus ?? this.showOnlineStatus,
      allowSearchIndexing: allowSearchIndexing ?? this.allowSearchIndexing,
    );
  }
}

class UserSecuritySettings {
  final bool twoFactorEnabled;
  final bool loginAlerts;
  final bool trustedDevicesEnabled;

  const UserSecuritySettings({
    required this.twoFactorEnabled,
    required this.loginAlerts,
    required this.trustedDevicesEnabled,
  });

  factory UserSecuritySettings.fromJson(Map<String, dynamic> json) {
    return UserSecuritySettings(
      twoFactorEnabled: json['twoFactorEnabled'] ?? false,
      loginAlerts: json['loginAlerts'] ?? false,
      trustedDevicesEnabled: json['trustedDevicesEnabled'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'twoFactorEnabled': twoFactorEnabled,
      'loginAlerts': loginAlerts,
      'trustedDevicesEnabled': trustedDevicesEnabled,
    };
  }

  UserSecuritySettings copyWith({
    bool? twoFactorEnabled,
    bool? loginAlerts,
    bool? trustedDevicesEnabled,
  }) {
    return UserSecuritySettings(
      twoFactorEnabled: twoFactorEnabled ?? this.twoFactorEnabled,
      loginAlerts: loginAlerts ?? this.loginAlerts,
      trustedDevicesEnabled:
          trustedDevicesEnabled ?? this.trustedDevicesEnabled,
    );
  }
}

class UserCommunicationSettings {
  final bool allowSupportEmails;
  final bool allowProductUpdates;
  final bool allowMarketingEmails;

  const UserCommunicationSettings({
    required this.allowSupportEmails,
    required this.allowProductUpdates,
    required this.allowMarketingEmails,
  });

  factory UserCommunicationSettings.fromJson(Map<String, dynamic> json) {
    return UserCommunicationSettings(
      allowSupportEmails: json['allowSupportEmails'] ?? false,
      allowProductUpdates: json['allowProductUpdates'] ?? false,
      allowMarketingEmails: json['allowMarketingEmails'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'allowSupportEmails': allowSupportEmails,
      'allowProductUpdates': allowProductUpdates,
      'allowMarketingEmails': allowMarketingEmails,
    };
  }

  UserCommunicationSettings copyWith({
    bool? allowSupportEmails,
    bool? allowProductUpdates,
    bool? allowMarketingEmails,
  }) {
    return UserCommunicationSettings(
      allowSupportEmails: allowSupportEmails ?? this.allowSupportEmails,
      allowProductUpdates: allowProductUpdates ?? this.allowProductUpdates,
      allowMarketingEmails: allowMarketingEmails ?? this.allowMarketingEmails,
    );
  }
}

class UserSettings {
  final String id;
  final String userId;
  final UserNotificationSettings notifications;
  final UserAppearanceSettings appearance;
  final UserLocalizationSettings localization;
  final UserPrivacySettings privacy;
  final UserSecuritySettings security;
  final UserCommunicationSettings communication;
  final User? user;
  final DateTime createdAt;
  final DateTime updatedAt;

  const UserSettings({
    required this.id,
    required this.userId,
    required this.notifications,
    required this.appearance,
    required this.localization,
    required this.privacy,
    required this.security,
    required this.communication,
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      notifications: json['notifications'] == null
          ? UserNotificationSettings.fromJson(<String, dynamic>{})
          : UserNotificationSettings.fromJson(
              Map<String, dynamic>.from(json['notifications'] as Map)),
      appearance: json['appearance'] == null
          ? UserAppearanceSettings.fromJson(<String, dynamic>{})
          : UserAppearanceSettings.fromJson(
              Map<String, dynamic>.from(json['appearance'] as Map)),
      localization: json['localization'] == null
          ? UserLocalizationSettings.fromJson(<String, dynamic>{})
          : UserLocalizationSettings.fromJson(
              Map<String, dynamic>.from(json['localization'] as Map)),
      privacy: json['privacy'] == null
          ? UserPrivacySettings.fromJson(<String, dynamic>{})
          : UserPrivacySettings.fromJson(
              Map<String, dynamic>.from(json['privacy'] as Map)),
      security: json['security'] == null
          ? UserSecuritySettings.fromJson(<String, dynamic>{})
          : UserSecuritySettings.fromJson(
              Map<String, dynamic>.from(json['security'] as Map)),
      communication: json['communication'] == null
          ? UserCommunicationSettings.fromJson(<String, dynamic>{})
          : UserCommunicationSettings.fromJson(
              Map<String, dynamic>.from(json['communication'] as Map)),
      user: json['user'] == null
          ? null
          : User.fromJson(Map<String, dynamic>.from(json['user'] as Map)),
      createdAt: json['createdAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'notifications': notifications.toJson(),
      'appearance': appearance.toJson(),
      'localization': localization.toJson(),
      'privacy': privacy.toJson(),
      'security': security.toJson(),
      'communication': communication.toJson(),
      'user': user?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  UserSettings copyWith({
    String? id,
    String? userId,
    UserNotificationSettings? notifications,
    UserAppearanceSettings? appearance,
    UserLocalizationSettings? localization,
    UserPrivacySettings? privacy,
    UserSecuritySettings? security,
    UserCommunicationSettings? communication,
    User? user,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserSettings(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      notifications: notifications ?? this.notifications,
      appearance: appearance ?? this.appearance,
      localization: localization ?? this.localization,
      privacy: privacy ?? this.privacy,
      security: security ?? this.security,
      communication: communication ?? this.communication,
      user: user ?? this.user,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class UpdateUserSettingsPayload {
  final UserNotificationSettings? notifications;
  final UserAppearanceSettings? appearance;
  final UserLocalizationSettings? localization;
  final UserPrivacySettings? privacy;
  final UserSecuritySettings? security;
  final UserCommunicationSettings? communication;

  const UpdateUserSettingsPayload({
    this.notifications,
    this.appearance,
    this.localization,
    this.privacy,
    this.security,
    this.communication,
  });

  factory UpdateUserSettingsPayload.fromJson(Map<String, dynamic> json) {
    return UpdateUserSettingsPayload(
      notifications: json['notifications'] == null
          ? null
          : UserNotificationSettings.fromJson(
              Map<String, dynamic>.from(json['notifications'] as Map)),
      appearance: json['appearance'] == null
          ? null
          : UserAppearanceSettings.fromJson(
              Map<String, dynamic>.from(json['appearance'] as Map)),
      localization: json['localization'] == null
          ? null
          : UserLocalizationSettings.fromJson(
              Map<String, dynamic>.from(json['localization'] as Map)),
      privacy: json['privacy'] == null
          ? null
          : UserPrivacySettings.fromJson(
              Map<String, dynamic>.from(json['privacy'] as Map)),
      security: json['security'] == null
          ? null
          : UserSecuritySettings.fromJson(
              Map<String, dynamic>.from(json['security'] as Map)),
      communication: json['communication'] == null
          ? null
          : UserCommunicationSettings.fromJson(
              Map<String, dynamic>.from(json['communication'] as Map)),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notifications': notifications?.toJson(),
      'appearance': appearance?.toJson(),
      'localization': localization?.toJson(),
      'privacy': privacy?.toJson(),
      'security': security?.toJson(),
      'communication': communication?.toJson(),
    };
  }

  UpdateUserSettingsPayload copyWith({
    UserNotificationSettings? notifications,
    UserAppearanceSettings? appearance,
    UserLocalizationSettings? localization,
    UserPrivacySettings? privacy,
    UserSecuritySettings? security,
    UserCommunicationSettings? communication,
  }) {
    return UpdateUserSettingsPayload(
      notifications: notifications ?? this.notifications,
      appearance: appearance ?? this.appearance,
      localization: localization ?? this.localization,
      privacy: privacy ?? this.privacy,
      security: security ?? this.security,
      communication: communication ?? this.communication,
    );
  }
}

enum UserTheme {
  system('system'),
  light('light'),
  dark('dark');

  final String value;

  const UserTheme(this.value);

  static UserTheme? fromJson(String? value) {
    if (value == null) return null;

    return UserTheme.values.firstWhere(
      (item) => item.value == value,
      orElse: () => UserTheme.system,
    );
  }

  String toJson() => value;
}

enum UserDensity {
  comfortable('comfortable'),
  compact('compact');

  final String value;

  const UserDensity(this.value);

  static UserDensity? fromJson(String? value) {
    if (value == null) return null;

    return UserDensity.values.firstWhere(
      (item) => item.value == value,
      orElse: () => UserDensity.comfortable,
    );
  }

  String toJson() => value;
}

enum UserLanguage {
  en('en'),
  sw('sw');

  final String value;

  const UserLanguage(this.value);

  static UserLanguage? fromJson(String? value) {
    if (value == null) return null;

    return UserLanguage.values.firstWhere(
      (item) => item.value == value,
      orElse: () => UserLanguage.en,
    );
  }

  String toJson() => value;
}

enum UserTimezone {
  africaNairobi('Africa/Nairobi'),
  utc('UTC');

  final String value;

  const UserTimezone(this.value);

  static UserTimezone? fromJson(String? value) {
    if (value == null) return null;

    return UserTimezone.values.firstWhere(
      (item) => item.value == value,
      orElse: () => UserTimezone.africaNairobi,
    );
  }

  String toJson() => value;
}

enum NotificationCategory {
  account('account'),
  security('security'),
  booking('booking'),
  payment('payment'),
  message('message'),
  system('system'),
  marketing('marketing');

  final String value;

  const NotificationCategory(this.value);

  static NotificationCategory? fromJson(String? value) {
    if (value == null) return null;

    return NotificationCategory.values.firstWhere(
      (item) => item.value == value,
      orElse: () => NotificationCategory.account,
    );
  }

  String toJson() => value;
}

enum NotificationChannel {
  inApp('in_app'),
  email('email'),
  push('push'),
  sms('sms');

  final String value;

  const NotificationChannel(this.value);

  static NotificationChannel? fromJson(String? value) {
    if (value == null) return null;

    return NotificationChannel.values.firstWhere(
      (item) => item.value == value,
      orElse: () => NotificationChannel.inApp,
    );
  }

  String toJson() => value;
}

class QuietHours {
  final bool enabled;
  final String startTime;
  final String endTime;
  final String timezone;

  const QuietHours({
    required this.enabled,
    required this.startTime,
    required this.endTime,
    required this.timezone,
  });

  factory QuietHours.fromJson(Map<String, dynamic> json) {
    return QuietHours(
      enabled: json['enabled'] ?? false,
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      timezone: json['timezone'] ?? '',
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

  QuietHours copyWith({
    bool? enabled,
    String? startTime,
    String? endTime,
    String? timezone,
  }) {
    return QuietHours(
      enabled: enabled ?? this.enabled,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      timezone: timezone ?? this.timezone,
    );
  }
}
