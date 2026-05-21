import 'notifications_channels.dart';
import 'notifications_quiet_hours.dart';
import 'package:collection/collection.dart';

class UserSettingsModelNotifications {
  final bool enabled;
  final UserSettingsModelNotificationsChannels channels;
  final Map<String, Map<String, Object?>> categories;
  final UserSettingsModelNotificationsQuietHours quietHours;

  const UserSettingsModelNotifications({
    required this.enabled,
    required this.channels,
    required this.categories,
    required this.quietHours,
  });

  UserSettingsModelNotifications copyWith({
    bool? enabled,
    UserSettingsModelNotificationsChannels? channels,
    Map<String, Map<String, Object?>>? categories,
    UserSettingsModelNotificationsQuietHours? quietHours,
  }) {
    return UserSettingsModelNotifications(
      enabled: enabled ?? this.enabled,
      channels: channels ?? this.channels,
      categories: categories ?? this.categories,
      quietHours: quietHours ?? this.quietHours,
    );
  }

  factory UserSettingsModelNotifications.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModelNotifications(
      enabled: map['enabled'] == true,
      channels:
          UserSettingsModelNotificationsChannels.fromJson(map['channels']),
      categories: Map<String, Map<String, Object?>>.from(
          (map['categories'] as Map?) ?? {}),
      quietHours:
          UserSettingsModelNotificationsQuietHours.fromJson(map['quietHours']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'enabled': enabled,
      'channels': channels.toJson(),
      'categories': categories,
      'quietHours': quietHours.toJson(),
    };
  }

  @override
  String toString() {
    return 'UserSettingsModelNotifications('
        'enabled: $enabled, '
        'channels: $channels, '
        'categories: $categories, '
        'quietHours: $quietHours'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is UserSettingsModelNotifications &&
        other.enabled == enabled &&
        equality.equals(other.channels, channels) &&
        equality.equals(other.categories, categories) &&
        equality.equals(other.quietHours, quietHours);
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      enabled,
      equality.hash(channels),
      equality.hash(categories),
      equality.hash(quietHours),
    ]);
  }
}
