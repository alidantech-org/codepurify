class UpdateVehicleResponse {
  final bool success;
  final String message;
  final Map<String, Object?> vehicle;

  const UpdateVehicleResponse({
    required this.success,
    required this.message,
    required this.vehicle,
  });

  factory UpdateVehicleResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateVehicleResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      vehicle: Map<String, Object?>.from((map['vehicle'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'vehicle': vehicle,
    };
  }
}
