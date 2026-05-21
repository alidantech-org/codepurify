import 'appearance.dart';
import 'communication.dart';
import 'localization.dart';
import 'notifications.dart';
import 'privacy.dart';
import 'security.dart';
import 'user.dart';
import 'package:collection/collection.dart';

class UserSettingsModel {
  final String id;
  final String userId;
  final UserSettingsModelUser? user;
  final UserSettingsModelNotifications notifications;
  final UserSettingsModelAppearance appearance;
  final UserSettingsModelLocalization localization;
  final UserSettingsModelPrivacy privacy;
  final UserSettingsModelSecurity security;
  final UserSettingsModelCommunication communication;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const UserSettingsModel({
    required this.id,
    required this.userId,
    this.user,
    required this.notifications,
    required this.appearance,
    required this.localization,
    required this.privacy,
    required this.security,
    required this.communication,
    this.createdAt,
    this.updatedAt,
  });

  UserSettingsModel copyWith({
    String? id,
    String? userId,
    UserSettingsModelUser? user,
    UserSettingsModelNotifications? notifications,
    UserSettingsModelAppearance? appearance,
    UserSettingsModelLocalization? localization,
    UserSettingsModelPrivacy? privacy,
    UserSettingsModelSecurity? security,
    UserSettingsModelCommunication? communication,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserSettingsModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      user: user ?? this.user,
      notifications: notifications ?? this.notifications,
      appearance: appearance ?? this.appearance,
      localization: localization ?? this.localization,
      privacy: privacy ?? this.privacy,
      security: security ?? this.security,
      communication: communication ?? this.communication,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory UserSettingsModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UserSettingsModel(
      id: map['id']?.toString() ?? "",
      userId: map['userId']?.toString() ?? "",
      user: map['user'] == null
          ? null
          : UserSettingsModelUser.fromJson(map['user']),
      notifications:
          UserSettingsModelNotifications.fromJson(map['notifications']),
      appearance: UserSettingsModelAppearance.fromJson(map['appearance']),
      localization: UserSettingsModelLocalization.fromJson(map['localization']),
      privacy: UserSettingsModelPrivacy.fromJson(map['privacy']),
      security: UserSettingsModelSecurity.fromJson(map['security']),
      communication:
          UserSettingsModelCommunication.fromJson(map['communication']),
      createdAt: map['createdAt'] == null
          ? null
          : DateTime.parse(map['createdAt'].toString()),
      updatedAt: map['updatedAt'] == null
          ? null
          : DateTime.parse(map['updatedAt'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      if (user != null) 'user': user?.toJson(),
      'notifications': notifications.toJson(),
      'appearance': appearance.toJson(),
      'localization': localization.toJson(),
      'privacy': privacy.toJson(),
      'security': security.toJson(),
      'communication': communication.toJson(),
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'UserSettingsModel('
        'id: $id, '
        'userId: $userId, '
        'user: $user, '
        'notifications: $notifications, '
        'appearance: $appearance, '
        'localization: $localization, '
        'privacy: $privacy, '
        'security: $security, '
        'communication: $communication, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is UserSettingsModel &&
        other.id == id &&
        other.userId == userId &&
        equality.equals(other.user, user) &&
        equality.equals(other.notifications, notifications) &&
        equality.equals(other.appearance, appearance) &&
        equality.equals(other.localization, localization) &&
        equality.equals(other.privacy, privacy) &&
        equality.equals(other.security, security) &&
        equality.equals(other.communication, communication) &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      id,
      userId,
      equality.hash(user),
      equality.hash(notifications),
      equality.hash(appearance),
      equality.hash(localization),
      equality.hash(privacy),
      equality.hash(security),
      equality.hash(communication),
      createdAt,
      updatedAt,
    ]);
  }
}
