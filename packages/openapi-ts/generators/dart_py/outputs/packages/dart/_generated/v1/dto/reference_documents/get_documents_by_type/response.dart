class GetDocumentsByTypeResponse {
  final bool success;
  final String message;
  final List<Map<String, Object?>> documents;

  const GetDocumentsByTypeResponse({
    required this.success,
    required this.message,
    required this.documents,
  });

  factory GetDocumentsByTypeResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetDocumentsByTypeResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      documents: ((map['documents'] as List?) ?? [])
          .map((item) => Map<String, Object?>.from(item as Map))
          .toList(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'documents': documents,
    };
  }
}
