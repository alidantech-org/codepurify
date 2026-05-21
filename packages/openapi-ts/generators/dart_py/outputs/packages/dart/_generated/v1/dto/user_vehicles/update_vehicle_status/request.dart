class UpdateVehicleStatusRequest {
  final String status;
  final String? reason;

  const UpdateVehicleStatusRequest({
    required this.status,
    this.reason,
  });

  factory UpdateVehicleStatusRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateVehicleStatusRequest(
      status: map['status']?.toString() ?? "",
      reason: map['reason']?.toString(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'status': status,
      if (reason != null) 'reason': reason,
    };
  }
}
