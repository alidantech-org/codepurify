class GetUnreadCountResponse {
  final bool success;
  final String message;
  final num count;

  const GetUnreadCountResponse({
    required this.success,
    required this.message,
    required this.count,
  });

  factory GetUnreadCountResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetUnreadCountResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      count: num.tryParse(map['count']?.toString() ?? "") ?? 0,
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'count': count,
    };
  }
}
