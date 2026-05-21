class GetRequiredDocumentsByServiceTypeResponse {
  final bool success;
  final String message;
  final List<Map<String, Object?>> requiredDocuments;

  const GetRequiredDocumentsByServiceTypeResponse({
    required this.success,
    required this.message,
    required this.requiredDocuments,
  });

  factory GetRequiredDocumentsByServiceTypeResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetRequiredDocumentsByServiceTypeResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      requiredDocuments: ((map['requiredDocuments'] as List?) ?? [])
          .map((item) => Map<String, Object?>.from(item as Map))
          .toList(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'requiredDocuments': requiredDocuments,
    };
  }
}
