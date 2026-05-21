class CreateBrandResponse {
  final bool success;
  final String message;
  final Map<String, Object?> brand;

  const CreateBrandResponse({
    required this.success,
    required this.message,
    required this.brand,
  });

  factory CreateBrandResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateBrandResponse(
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
