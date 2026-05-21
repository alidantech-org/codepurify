import 'category.dart';
import 'channels.dart';
import 'priority.dart';
import 'type.dart';
import 'user.dart';
import 'package:collection/collection.dart';

class NotificationModel {
  final String id;
  final String userId;
  final NotificationModelUser? user;
  final NotificationModelCategory category;
  final NotificationModelType type;
  final String title;
  final String message;
  final String? shortMessage;
  final String? imageUrl;
  final String? actionUrl;
  final String? actionLabel;
  final NotificationModelPriority priority;
  final Map<String, Object>? data;
  final List<NotificationModelChannels> channels;
  final List<Object> delivery;
  final bool isRead;
  final DateTime? readAt;
  final DateTime? scheduledFor;
  final String? onesignalNotificationId;
  final Map<String, Object>? metadata;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const NotificationModel({
    required this.id,
    required this.userId,
    this.user,
    required this.category,
    required this.type,
    required this.title,
    required this.message,
    this.shortMessage,
    this.imageUrl,
    this.actionUrl,
    this.actionLabel,
    required this.priority,
    this.data,
    required this.channels,
    required this.delivery,
    required this.isRead,
    this.readAt,
    this.scheduledFor,
    this.onesignalNotificationId,
    this.metadata,
    this.createdAt,
    this.updatedAt,
  });

  NotificationModel copyWith({
    String? id,
    String? userId,
    NotificationModelUser? user,
    NotificationModelCategory? category,
    NotificationModelType? type,
    String? title,
    String? message,
    String? shortMessage,
    String? imageUrl,
    String? actionUrl,
    String? actionLabel,
    NotificationModelPriority? priority,
    Map<String, Object>? data,
    List<NotificationModelChannels>? channels,
    List<Object>? delivery,
    bool? isRead,
    DateTime? readAt,
    DateTime? scheduledFor,
    String? onesignalNotificationId,
    Map<String, Object>? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      user: user ?? this.user,
      category: category ?? this.category,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      shortMessage: shortMessage ?? this.shortMessage,
      imageUrl: imageUrl ?? this.imageUrl,
      actionUrl: actionUrl ?? this.actionUrl,
      actionLabel: actionLabel ?? this.actionLabel,
      priority: priority ?? this.priority,
      data: data ?? this.data,
      channels: channels ?? this.channels,
      delivery: delivery ?? this.delivery,
      isRead: isRead ?? this.isRead,
      readAt: readAt ?? this.readAt,
      scheduledFor: scheduledFor ?? this.scheduledFor,
      onesignalNotificationId:
          onesignalNotificationId ?? this.onesignalNotificationId,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory NotificationModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return NotificationModel(
      id: map['id']?.toString() ?? "",
      userId: map['userId']?.toString() ?? "",
      user: map['user'] == null
          ? null
          : NotificationModelUser.fromJson(map['user']),
      category: NotificationModelCategory.fromValue(
          map['category']?.toString() ?? ""),
      type: NotificationModelType.fromValue(map['type']?.toString() ?? ""),
      title: map['title']?.toString() ?? "",
      message: map['message']?.toString() ?? "",
      shortMessage: map['shortMessage']?.toString(),
      imageUrl: map['imageUrl']?.toString(),
      actionUrl: map['actionUrl']?.toString(),
      actionLabel: map['actionLabel']?.toString(),
      priority: NotificationModelPriority.fromValue(
          map['priority']?.toString() ?? ""),
      data: map['data'] == null
          ? null
          : Map<String, Object>.from(map['data'] as Map),
      channels: ((map['channels'] as List?) ?? [])
          .map((item) => NotificationModelChannels.fromValue(item.toString()))
          .toList(),
      delivery: ((map['delivery'] as List?) ?? []).cast<Object>(),
      isRead: map['isRead'] == true,
      readAt: map['readAt'] == null
          ? null
          : DateTime.parse(map['readAt'].toString()),
      scheduledFor: map['scheduledFor'] == null
          ? null
          : DateTime.parse(map['scheduledFor'].toString()),
      onesignalNotificationId: map['onesignalNotificationId']?.toString(),
      metadata: map['metadata'] == null
          ? null
          : Map<String, Object>.from(map['metadata'] as Map),
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
      'category': category.value,
      'type': type.value,
      'title': title,
      'message': message,
      if (shortMessage != null) 'shortMessage': shortMessage,
      if (imageUrl != null) 'imageUrl': imageUrl,
      if (actionUrl != null) 'actionUrl': actionUrl,
      if (actionLabel != null) 'actionLabel': actionLabel,
      'priority': priority.value,
      if (data != null) 'data': data,
      'channels': channels.map((item) => item.value).toList(),
      'delivery': delivery,
      'isRead': isRead,
      if (readAt != null) 'readAt': readAt?.toIso8601String(),
      if (scheduledFor != null) 'scheduledFor': scheduledFor?.toIso8601String(),
      if (onesignalNotificationId != null)
        'onesignalNotificationId': onesignalNotificationId,
      if (metadata != null) 'metadata': metadata,
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'NotificationModel('
        'id: $id, '
        'userId: $userId, '
        'user: $user, '
        'category: $category, '
        'type: $type, '
        'title: $title, '
        'message: $message, '
        'shortMessage: $shortMessage, '
        'imageUrl: $imageUrl, '
        'actionUrl: $actionUrl, '
        'actionLabel: $actionLabel, '
        'priority: $priority, '
        'data: $data, '
        'channels: $channels, '
        'delivery: $delivery, '
        'isRead: $isRead, '
        'readAt: $readAt, '
        'scheduledFor: $scheduledFor, '
        'onesignalNotificationId: $onesignalNotificationId, '
        'metadata: $metadata, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is NotificationModel &&
        other.id == id &&
        other.userId == userId &&
        equality.equals(other.user, user) &&
        other.category == category &&
        other.type == type &&
        other.title == title &&
        other.message == message &&
        other.shortMessage == shortMessage &&
        other.imageUrl == imageUrl &&
        other.actionUrl == actionUrl &&
        other.actionLabel == actionLabel &&
        other.priority == priority &&
        equality.equals(other.data, data) &&
        equality.equals(other.channels, channels) &&
        equality.equals(other.delivery, delivery) &&
        other.isRead == isRead &&
        other.readAt == readAt &&
        other.scheduledFor == scheduledFor &&
        other.onesignalNotificationId == onesignalNotificationId &&
        equality.equals(other.metadata, metadata) &&
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
      category,
      type,
      title,
      message,
      shortMessage,
      imageUrl,
      actionUrl,
      actionLabel,
      priority,
      equality.hash(data),
      equality.hash(channels),
      equality.hash(delivery),
      isRead,
      readAt,
      scheduledFor,
      onesignalNotificationId,
      equality.hash(metadata),
      createdAt,
      updatedAt,
    ]);
  }
}
