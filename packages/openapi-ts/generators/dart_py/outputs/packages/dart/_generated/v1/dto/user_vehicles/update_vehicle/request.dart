class UpdateVehicleRequest {
  final String? userId;
  final String? brandId;
  final String? model;
  final num? year;
  final String? plateNumber;
  final String? color;
  final String? vin;
  final num? mileage;
  final bool? isPrimary;
  final bool? isVerified;
  final List<String>? documents;
  final List<String>? images;

  const UpdateVehicleRequest({
    this.userId,
    this.brandId,
    this.model,
    this.year,
    this.plateNumber,
    this.color,
    this.vin,
    this.mileage,
    this.isPrimary,
    this.isVerified,
    this.documents,
    this.images,
  });

  factory UpdateVehicleRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateVehicleRequest(
      userId: map['userId']?.toString(),
      brandId: map['brandId']?.toString(),
      model: map['model']?.toString(),
      year: map['year'] == null ? null : num.tryParse(map['year'].toString()),
      plateNumber: map['plateNumber']?.toString(),
      color: map['color']?.toString(),
      vin: map['vin']?.toString(),
      mileage: map['mileage'] == null
          ? null
          : num.tryParse(map['mileage'].toString()),
      isPrimary: map['isPrimary'] == null ? null : map['isPrimary'] == true,
      isVerified: map['isVerified'] == null ? null : map['isVerified'] == true,
      documents: map['documents'] == null
          ? null
          : ((map['documents'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      images: map['images'] == null
          ? null
          : ((map['images'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      if (userId != null) 'userId': userId,
      if (brandId != null) 'brandId': brandId,
      if (model != null) 'model': model,
      if (year != null) 'year': year,
      if (plateNumber != null) 'plateNumber': plateNumber,
      if (color != null) 'color': color,
      if (vin != null) 'vin': vin,
      if (mileage != null) 'mileage': mileage,
      if (isPrimary != null) 'isPrimary': isPrimary,
      if (isVerified != null) 'isVerified': isVerified,
      if (documents != null) 'documents': documents,
      if (images != null) 'images': images,
    };
  }
}
