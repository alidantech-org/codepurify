class GetVehicleByIdResponse {
  final bool success;
  final String message;
  final Map<String, Object?> vehicle;

  const GetVehicleByIdResponse({
    required this.success,
    required this.message,
    required this.vehicle,
  });

  factory GetVehicleByIdResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetVehicleByIdResponse(
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
