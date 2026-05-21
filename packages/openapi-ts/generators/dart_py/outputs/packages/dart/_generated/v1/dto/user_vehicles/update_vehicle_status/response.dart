class UpdateVehicleStatusResponse {
  final bool success;
  final String message;
  final Map<String, Object?> vehicle;

  const UpdateVehicleStatusResponse({
    required this.success,
    required this.message,
    required this.vehicle,
  });

  factory UpdateVehicleStatusResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateVehicleStatusResponse(
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
