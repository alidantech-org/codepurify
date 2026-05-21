class CreateNotificationRequest {
  final String userId;
  final String category;
  final String type;
  final String title;
  final String message;
  final String? shortMessage;
  final String? imageUrl;
  final String? actionUrl;
  final String? actionLabel;
  final String? priority;
  final List<String>? channels;
  final Map<String, Object>? data;
  final Map<String, Object>? metadata;
  final DateTime? scheduledFor;

  const CreateNotificationRequest({
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

  factory CreateNotificationRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateNotificationRequest(
      userId: map['userId']?.toString() ?? "",
      category: map['category']?.toString() ?? "",
      type: map['type']?.toString() ?? "",
      title: map['title']?.toString() ?? "",
      message: map['message']?.toString() ?? "",
      shortMessage: map['shortMessage']?.toString(),
      imageUrl: map['imageUrl']?.toString(),
      actionUrl: map['actionUrl']?.toString(),
      actionLabel: map['actionLabel']?.toString(),
      priority: map['priority']?.toString(),
      channels: map['channels'] == null
          ? null
          : ((map['channels'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      data: map['data'] == null
          ? null
          : Map<String, Object>.from(map['data'] as Map),
      metadata: map['metadata'] == null
          ? null
          : Map<String, Object>.from(map['metadata'] as Map),
      scheduledFor: map['scheduledFor'] == null
          ? null
          : DateTime.parse(map['scheduledFor'].toString()),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'userId': userId,
      'category': category,
      'type': type,
      'title': title,
      'message': message,
      if (shortMessage != null) 'shortMessage': shortMessage,
      if (imageUrl != null) 'imageUrl': imageUrl,
      if (actionUrl != null) 'actionUrl': actionUrl,
      if (actionLabel != null) 'actionLabel': actionLabel,
      if (priority != null) 'priority': priority,
      if (channels != null) 'channels': channels,
      if (data != null) 'data': data,
      if (metadata != null) 'metadata': metadata,
      if (scheduledFor != null) 'scheduledFor': scheduledFor?.toIso8601String(),
    };
  }
}
