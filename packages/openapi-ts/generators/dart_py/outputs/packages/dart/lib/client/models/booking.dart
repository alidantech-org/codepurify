class Booking {
  final String? id;
  final String? userId;
  final String? vehicleId;
  final String? serviceId;
  final String? status;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Map<String, dynamic>? metadata;

  Booking({
    this.id,
    this.userId,
    this.vehicleId,
    this.serviceId,
    this.status,
    this.createdAt,
    this.updatedAt,
    this.metadata,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['_id'] ?? json['id'],
      userId: json['userId'],
      vehicleId: json['vehicleId'],
      serviceId: json['serviceId'],
      status: json['status'],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
          : null,
      metadata: json['metadata'] != null
          ? Map<String, dynamic>.from(json['metadata'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'vehicleId': vehicleId,
      'serviceId': serviceId,
      'status': status,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'metadata': metadata,
    };
  }
}
