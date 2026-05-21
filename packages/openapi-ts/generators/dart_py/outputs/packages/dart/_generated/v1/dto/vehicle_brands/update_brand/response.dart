class UpdateBrandResponse {
  final bool success;
  final String message;
  final Map<String, Object?> brand;

  const UpdateBrandResponse({
    required this.success,
    required this.message,
    required this.brand,
  });

  factory UpdateBrandResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateBrandResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      brand: Map<String, Object?>.from((map['brand'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'brand': brand,
    };
  }
}
