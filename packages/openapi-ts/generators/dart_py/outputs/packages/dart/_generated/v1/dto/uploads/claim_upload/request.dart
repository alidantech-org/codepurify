class ClaimUploadRequest {
  final String claimedByTable;
  final String claimedById;

  const ClaimUploadRequest({
    required this.claimedByTable,
    required this.claimedById,
  });

  factory ClaimUploadRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ClaimUploadRequest(
      claimedByTable: map['claimedByTable']?.toString() ?? "",
      claimedById: map['claimedById']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'claimedByTable': claimedByTable,
      'claimedById': claimedById,
    };
  }
}
