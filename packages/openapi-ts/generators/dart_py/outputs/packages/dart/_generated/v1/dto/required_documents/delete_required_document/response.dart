class DeleteRequiredDocumentResponse {
  final bool success;
  final String message;
  final Map<String, Object?> requiredDocument;

  const DeleteRequiredDocumentResponse({
    required this.success,
    required this.message,
    required this.requiredDocument,
  });

  factory DeleteRequiredDocumentResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return DeleteRequiredDocumentResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      requiredDocument:
          Map<String, Object?>.from((map['requiredDocument'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'requiredDocument': requiredDocument,
    };
  }
}
