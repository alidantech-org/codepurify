class ClaimUploadResponse {
  final bool success;
  final String message;
  final Map<String, Object?> upload;

  const ClaimUploadResponse({
    required this.success,
    required this.message,
    required this.upload,
  });

  factory ClaimUploadResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ClaimUploadResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      upload: Map<String, Object?>.from((map['upload'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'upload': upload,
    };
  }
}
