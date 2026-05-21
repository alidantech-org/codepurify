class CreateServiceResponse {
  final bool success;
  final String message;
  final Map<String, Object?> service;

  const CreateServiceResponse({
    required this.success,
    required this.message,
    required this.service,
  });

  factory CreateServiceResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateServiceResponse(
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
