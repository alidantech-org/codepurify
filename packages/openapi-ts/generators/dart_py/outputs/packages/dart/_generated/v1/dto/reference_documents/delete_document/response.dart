class DeleteDocumentResponse {
  final bool success;
  final String message;
  final Map<String, Object?> document;

  const DeleteDocumentResponse({
    required this.success,
    required this.message,
    required this.document,
  });

  factory DeleteDocumentResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return DeleteDocumentResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      document: Map<String, Object?>.from((map['document'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'document': document,
    };
  }
}
