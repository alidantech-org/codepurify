class GetServiceByIdResponse {
  final bool success;
  final String message;
  final Map<String, Object?> service;

  const GetServiceByIdResponse({
    required this.success,
    required this.message,
    required this.service,
  });

  factory GetServiceByIdResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetServiceByIdResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      service: Map<String, Object?>.from((map['service'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'service': service,
    };
  }
}
