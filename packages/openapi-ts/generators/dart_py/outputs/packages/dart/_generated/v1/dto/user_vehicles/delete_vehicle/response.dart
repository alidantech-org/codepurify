class DeleteVehicleResponse {
  final bool success;
  final String message;

  const DeleteVehicleResponse({
    required this.success,
    required this.message,
  });

  factory DeleteVehicleResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return DeleteVehicleResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
    };
  }
}
