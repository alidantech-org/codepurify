// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

import 'user.dart';
import 'user_setting.dart';

class NotificationDeliveryStatus {
  final NotificationChannel channel;
  final bool enabled;
  final NotificationStatus status;
  final String? provider;
  final String? providerMessageId;
  final String? errorMessage;
  final DateTime? attemptedAt;
  final DateTime? deliveredAt;
  final DateTime? readAt;

  const NotificationDeliveryStatus({
    required this.channel,
    required this.enabled,
    required this.status,
    this.provider,
    this.providerMessageId,
    this.errorMessage,
    this.attemptedAt,
    this.deliveredAt,
    this.readAt,
  });

  factory NotificationDeliveryStatus.fromJson(Map<String, dynamic> json) {
    return NotificationDeliveryStatus(
      channel: NotificationChannel.fromJson(json['channel'] as String?) ??
          NotificationChannel.values.first,
      enabled: json['enabled'] ?? false,
      status: NotificationStatus.fromJson(json['status'] as String?) ??
          NotificationStatus.values.first,
      provider: json['provider'],
      providerMessageId: json['providerMessageId'],
      errorMessage: json['errorMessage'],
      attemptedAt: json['attemptedAt'] == null
          ? null
          : DateTime.parse(json['attemptedAt'] as String),
      deliveredAt: json['deliveredAt'] == null
          ? null
          : DateTime.parse(json['deliveredAt'] as String),
      readAt: json['readAt'] == null
          ? null
          : DateTime.parse(json['readAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'channel': channel.toJson(),
      'enabled': enabled,
      'status': status.toJson(),
      'provider': provider,
      'providerMessageId': providerMessageId,
      'errorMessage': errorMessage,
      'attemptedAt': attemptedAt?.toIso8601String(),
      'deliveredAt': deliveredAt?.toIso8601String(),
      'readAt': readAt?.toIso8601String(),
    };
  }

  NotificationDeliveryStatus copyWith({
    NotificationChannel? channel,
    bool? enabled,
    NotificationStatus? status,
    String? provider,
    String? providerMessageId,
    String? errorMessage,
    DateTime? attemptedAt,
    DateTime? deliveredAt,
    DateTime? readAt,
  }) {
    return NotificationDeliveryStatus(
      channel: channel ?? this.channel,
      enabled: enabled ?? this.enabled,
      status: status ?? this.status,
      provider: provider ?? this.provider,
      providerMessageId: providerMessageId ?? this.providerMessageId,
      errorMessage: errorMessage ?? this.errorMessage,
      attemptedAt: attemptedAt ?? this.attemptedAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      readAt: readAt ?? this.readAt,
    );
  }
}

class Notification {
  final String id;
  final String userId;
  final NotificationCategory category;
  final NotificationType type;
  final String title;
  final String message;
  final String? shortMessage;
  final String? imageUrl;
  final String? actionUrl;
  final String? actionLabel;
  final NotificationPriority priority;
  final Map<String, dynamic>? data;
  final List<NotificationChannel> channels;
  final List<NotificationDeliveryStatus> delivery;
  final bool isRead;
  final DateTime? readAt;
  final DateTime? scheduledFor;
  final String? onesignalNotificationId;
  final Map<String, dynamic>? metadata;
  final User? user;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Notification({
    required this.id,
    required this.userId,
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
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      category: NotificationCategory.fromJson(json['category'] as String?) ??
          NotificationCategory.values.first,
      type: NotificationType.fromJson(json['type'] as String?) ??
          NotificationType.values.first,
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      shortMessage: json['shortMessage'],
      imageUrl: json['imageUrl'],
      actionUrl: json['actionUrl'],
      actionLabel: json['actionLabel'],
      priority: NotificationPriority.fromJson(json['priority'] as String?) ??
          NotificationPriority.values.first,
      data: json['data'] == null
          ? null
          : Map<String, dynamic>.from(json['data'] as Map),
      channels: json['channels'] == null
          ? <NotificationChannel>[]
          : (json['channels'] as List)
              .map((e) => NotificationChannel.fromJson(e as String)!)
              .toList(),
      delivery: json['delivery'] == null
          ? <NotificationDeliveryStatus>[]
          : (json['delivery'] as List)
              .map((e) => NotificationDeliveryStatus.fromJson(
                  Map<String, dynamic>.from(e as Map)))
              .toList(),
      isRead: json['isRead'] ?? false,
      readAt: json['readAt'] == null
          ? null
          : DateTime.parse(json['readAt'] as String),
      scheduledFor: json['scheduledFor'] == null
          ? null
          : DateTime.parse(json['scheduledFor'] as String),
      onesignalNotificationId: json['onesignalNotificationId'],
      metadata: json['metadata'] == null
          ? null
          : Map<String, dynamic>.from(json['metadata'] as Map),
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
      'category': category.toJson(),
      'type': type.toJson(),
      'title': title,
      'message': message,
      'shortMessage': shortMessage,
      'imageUrl': imageUrl,
      'actionUrl': actionUrl,
      'actionLabel': actionLabel,
      'priority': priority.toJson(),
      'data': data,
      'channels': channels.map((e) => e.toJson()).toList(),
      'delivery': delivery.map((e) => e.toJson()).toList(),
      'isRead': isRead,
      'readAt': readAt?.toIso8601String(),
      'scheduledFor': scheduledFor?.toIso8601String(),
      'onesignalNotificationId': onesignalNotificationId,
      'metadata': metadata,
      'user': user?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Notification copyWith({
    String? id,
    String? userId,
    NotificationCategory? category,
    NotificationType? type,
    String? title,
    String? message,
    String? shortMessage,
    String? imageUrl,
    String? actionUrl,
    String? actionLabel,
    NotificationPriority? priority,
    Map<String, dynamic>? data,
    List<NotificationChannel>? channels,
    List<NotificationDeliveryStatus>? delivery,
    bool? isRead,
    DateTime? readAt,
    DateTime? scheduledFor,
    String? onesignalNotificationId,
    Map<String, dynamic>? metadata,
    User? user,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Notification(
      id: id ?? this.id,
      userId: userId ?? this.userId,
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
      user: user ?? this.user,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class SendNotificationPayload {
  final String userId;
  final NotificationCategory category;
  final NotificationType type;
  final String title;
  final String message;
  final String? shortMessage;
  final String? imageUrl;
  final String? actionUrl;
  final String? actionLabel;
  final NotificationPriority? priority;
  final List<NotificationChannel>? channels;
  final Map<String, dynamic>? data;
  final Map<String, dynamic>? metadata;
  final DateTime? scheduledFor;

  const SendNotificationPayload({
    required this.userId,
    required this.category,
    required this.type,
    required this.title,
    required this.message,
    this.shortMessage,
    this.imageUrl,
    this.actionUrl,
    this.actionLabel,
    this.priority,
    this.channels,
    this.data,
    this.metadata,
    this.scheduledFor,
  });

  factory SendNotificationPayload.fromJson(Map<String, dynamic> json) {
    return SendNotificationPayload(
      userId: json['userId'] ?? '',
      category: NotificationCategory.fromJson(json['category'] as String?) ??
          NotificationCategory.values.first,
      type: NotificationType.fromJson(json['type'] as String?) ??
          NotificationType.values.first,
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      shortMessage: json['shortMessage'],
      imageUrl: json['imageUrl'],
      actionUrl: json['actionUrl'],
      actionLabel: json['actionLabel'],
      priority: NotificationPriority.fromJson(json['priority'] as String?),
      channels: json['channels'] == null
          ? null
          : (json['channels'] as List)
              .map((e) => NotificationChannel.fromJson(e as String)!)
              .toList(),
      data: json['data'] == null
          ? null
          : Map<String, dynamic>.from(json['data'] as Map),
      metadata: json['metadata'] == null
          ? null
          : Map<String, dynamic>.from(json['metadata'] as Map),
      scheduledFor: json['scheduledFor'] == null
          ? null
          : DateTime.parse(json['scheduledFor'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'category': category.toJson(),
      'type': type.toJson(),
      'title': title,
      'message': message,
      'shortMessage': shortMessage,
      'imageUrl': imageUrl,
      'actionUrl': actionUrl,
      'actionLabel': actionLabel,
      'priority': priority?.toJson(),
      'channels': channels?.map((e) => e.toJson()).toList(),
      'data': data,
      'metadata': metadata,
      'scheduledFor': scheduledFor?.toIso8601String(),
    };
  }

  SendNotificationPayload copyWith({
    String? userId,
    NotificationCategory? category,
    NotificationType? type,
    String? title,
    String? message,
    String? shortMessage,
    String? imageUrl,
    String? actionUrl,
    String? actionLabel,
    NotificationPriority? priority,
    List<NotificationChannel>? channels,
    Map<String, dynamic>? data,
    Map<String, dynamic>? metadata,
    DateTime? scheduledFor,
  }) {
    return SendNotificationPayload(
      userId: userId ?? this.userId,
      category: category ?? this.category,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      shortMessage: shortMessage ?? this.shortMessage,
      imageUrl: imageUrl ?? this.imageUrl,
      actionUrl: actionUrl ?? this.actionUrl,
      actionLabel: actionLabel ?? this.actionLabel,
      priority: priority ?? this.priority,
      channels: channels ?? this.channels,
      data: data ?? this.data,
      metadata: metadata ?? this.metadata,
      scheduledFor: scheduledFor ?? this.scheduledFor,
    );
  }
}

class SendPushNotificationPayload {
  final String userId;
  final String title;
  final String message;
  final String? imageUrl;
  final String? actionUrl;
  final Map<String, dynamic>? data;

  const SendPushNotificationPayload({
    required this.userId,
    required this.title,
    required this.message,
    this.imageUrl,
    this.actionUrl,
    this.data,
  });

  factory SendPushNotificationPayload.fromJson(Map<String, dynamic> json) {
    return SendPushNotificationPayload(
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      imageUrl: json['imageUrl'],
      actionUrl: json['actionUrl'],
      data: json['data'] == null
          ? null
          : Map<String, dynamic>.from(json['data'] as Map),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'title': title,
      'message': message,
      'imageUrl': imageUrl,
      'actionUrl': actionUrl,
      'data': data,
    };
  }

  SendPushNotificationPayload copyWith({
    String? userId,
    String? title,
    String? message,
    String? imageUrl,
    String? actionUrl,
    Map<String, dynamic>? data,
  }) {
    return SendPushNotificationPayload(
      userId: userId ?? this.userId,
      title: title ?? this.title,
      message: message ?? this.message,
      imageUrl: imageUrl ?? this.imageUrl,
      actionUrl: actionUrl ?? this.actionUrl,
      data: data ?? this.data,
    );
  }
}

class SendEmailNotificationPayload {
  final String userId;
  final String email;
  final String subject;
  final String html;
  final String? text;

  const SendEmailNotificationPayload({
    required this.userId,
    required this.email,
    required this.subject,
    required this.html,
    this.text,
  });

  factory SendEmailNotificationPayload.fromJson(Map<String, dynamic> json) {
    return SendEmailNotificationPayload(
      userId: json['userId'] ?? '',
      email: json['email'] ?? '',
      subject: json['subject'] ?? '',
      html: json['html'] ?? '',
      text: json['text'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'email': email,
      'subject': subject,
      'html': html,
      'text': text,
    };
  }

  SendEmailNotificationPayload copyWith({
    String? userId,
    String? email,
    String? subject,
    String? html,
    String? text,
  }) {
    return SendEmailNotificationPayload(
      userId: userId ?? this.userId,
      email: email ?? this.email,
      subject: subject ?? this.subject,
      html: html ?? this.html,
      text: text ?? this.text,
    );
  }
}

class NotificationChannelResult {
  final NotificationChannel channel;
  final bool success;
  final String? provider;
  final String? providerMessageId;
  final String? errorMessage;

  const NotificationChannelResult({
    required this.channel,
    required this.success,
    this.provider,
    this.providerMessageId,
    this.errorMessage,
  });

  factory NotificationChannelResult.fromJson(Map<String, dynamic> json) {
    return NotificationChannelResult(
      channel: NotificationChannel.fromJson(json['channel'] as String?) ??
          NotificationChannel.values.first,
      success: json['success'] ?? false,
      provider: json['provider'],
      providerMessageId: json['providerMessageId'],
      errorMessage: json['errorMessage'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'channel': channel.toJson(),
      'success': success,
      'provider': provider,
      'providerMessageId': providerMessageId,
      'errorMessage': errorMessage,
    };
  }

  NotificationChannelResult copyWith({
    NotificationChannel? channel,
    bool? success,
    String? provider,
    String? providerMessageId,
    String? errorMessage,
  }) {
    return NotificationChannelResult(
      channel: channel ?? this.channel,
      success: success ?? this.success,
      provider: provider ?? this.provider,
      providerMessageId: providerMessageId ?? this.providerMessageId,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
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

enum NotificationType {
  serviceApproved('service_approved'),
  serviceRejected('service_rejected'),
  newRequest('new_request'),
  paymentReceived('payment_received'),
  serviceUpdate('service_update'),
  bookingStatusUpdate('booking_status_update'),
  systemMessage('system_message');

  final String value;

  const NotificationType(this.value);

  static NotificationType? fromJson(String? value) {
    if (value == null) return null;

    return NotificationType.values.firstWhere(
      (item) => item.value == value,
      orElse: () => NotificationType.serviceApproved,
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

enum NotificationPriority {
  low('low'),
  normal('normal'),
  high('high'),
  urgent('urgent');

  final String value;

  const NotificationPriority(this.value);

  static NotificationPriority? fromJson(String? value) {
    if (value == null) return null;

    return NotificationPriority.values.firstWhere(
      (item) => item.value == value,
      orElse: () => NotificationPriority.low,
    );
  }

  String toJson() => value;
}

enum NotificationStatus {
  pending('pending'),
  sent('sent'),
  delivered('delivered'),
  read('read'),
  failed('failed');

  final String value;

  const NotificationStatus(this.value);

  static NotificationStatus? fromJson(String? value) {
    if (value == null) return null;

    return NotificationStatus.values.firstWhere(
      (item) => item.value == value,
      orElse: () => NotificationStatus.pending,
    );
  }

  String toJson() => value;
}
