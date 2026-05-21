class DeleteUploadResponse {
  final bool success;
  final String message;
  final Map<String, Object?>? upload;

  const DeleteUploadResponse({
    required this.success,
    required this.message,
    this.upload,
  });

  factory DeleteUploadResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return DeleteUploadResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      upload: map['upload'] == null
          ? null
          : Map<String, Object?>.from(map['upload'] as Map),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      if (upload != null) 'upload': upload,
    };
  }
}
