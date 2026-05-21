class CreateVehicleRequest {
  final String userId;
  final String brandId;
  final String model;
  final num year;
  final String plateNumber;
  final String color;
  final String vin;
  final num? mileage;
  final bool isPrimary;
  final bool isVerified;
  final List<String> documents;
  final List<String> images;

  const CreateVehicleRequest({
    required this.userId,
    required this.brandId,
    required this.model,
    required this.year,
    required this.plateNumber,
    required this.color,
    required this.vin,
    this.mileage,
    required this.isPrimary,
    required this.isVerified,
    required this.documents,
    required this.images,
  });

  factory CreateVehicleRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateVehicleRequest(
      userId: map['userId']?.toString() ?? "",
      brandId: map['brandId']?.toString() ?? "",
      model: map['model']?.toString() ?? "",
      year: num.tryParse(map['year']?.toString() ?? "") ?? 0,
      plateNumber: map['plateNumber']?.toString() ?? "",
      color: map['color']?.toString() ?? "",
      vin: map['vin']?.toString() ?? "",
      mileage: map['mileage'] == null
          ? null
          : num.tryParse(map['mileage'].toString()),
      isPrimary: map['isPrimary'] == true,
      isVerified: map['isVerified'] == true,
      documents: ((map['documents'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      images: ((map['images'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'userId': userId,
      'brandId': brandId,
      'model': model,
      'year': year,
      'plateNumber': plateNumber,
      'color': color,
      'vin': vin,
      if (mileage != null) 'mileage': mileage,
      'isPrimary': isPrimary,
      'isVerified': isVerified,
      'documents': documents,
      'images': images,
    };
  }
}
