import 'status.dart';
import 'package:collection/collection.dart';

class VehicleModel {
  final String id;
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
  final VehicleModelStatus status;
  final List<String> documents;
  final List<String> images;
  final bool ownershipVerified;
  final DateTime? ownershipVerifiedAt;
  final String? ownershipVerifiedBy;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const VehicleModel({
    required this.id,
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
    required this.status,
    required this.documents,
    required this.images,
    required this.ownershipVerified,
    this.ownershipVerifiedAt,
    this.ownershipVerifiedBy,
    this.createdAt,
    this.updatedAt,
  });

  VehicleModel copyWith({
    String? id,
    String? userId,
    String? brandId,
    String? model,
    num? year,
    String? plateNumber,
    String? color,
    String? vin,
    num? mileage,
    bool? isPrimary,
    bool? isVerified,
    VehicleModelStatus? status,
    List<String>? documents,
    List<String>? images,
    bool? ownershipVerified,
    DateTime? ownershipVerifiedAt,
    String? ownershipVerifiedBy,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return VehicleModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      brandId: brandId ?? this.brandId,
      model: model ?? this.model,
      year: year ?? this.year,
      plateNumber: plateNumber ?? this.plateNumber,
      color: color ?? this.color,
      vin: vin ?? this.vin,
      mileage: mileage ?? this.mileage,
      isPrimary: isPrimary ?? this.isPrimary,
      isVerified: isVerified ?? this.isVerified,
      status: status ?? this.status,
      documents: documents ?? this.documents,
      images: images ?? this.images,
      ownershipVerified: ownershipVerified ?? this.ownershipVerified,
      ownershipVerifiedAt: ownershipVerifiedAt ?? this.ownershipVerifiedAt,
      ownershipVerifiedBy: ownershipVerifiedBy ?? this.ownershipVerifiedBy,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory VehicleModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return VehicleModel(
      id: map['id']?.toString() ?? "",
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
      status: VehicleModelStatus.fromValue(map['status']?.toString() ?? ""),
      documents: ((map['documents'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      images: ((map['images'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      ownershipVerified: map['ownershipVerified'] == true,
      ownershipVerifiedAt: map['ownershipVerifiedAt'] == null
          ? null
          : DateTime.parse(map['ownershipVerifiedAt'].toString()),
      ownershipVerifiedBy: map['ownershipVerifiedBy']?.toString(),
      createdAt: map['createdAt'] == null
          ? null
          : DateTime.parse(map['createdAt'].toString()),
      updatedAt: map['updatedAt'] == null
          ? null
          : DateTime.parse(map['updatedAt'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
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
      'status': status.value,
      'documents': documents,
      'images': images,
      'ownershipVerified': ownershipVerified,
      if (ownershipVerifiedAt != null)
        'ownershipVerifiedAt': ownershipVerifiedAt?.toIso8601String(),
      if (ownershipVerifiedBy != null)
        'ownershipVerifiedBy': ownershipVerifiedBy,
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'VehicleModel('
        'id: $id, '
        'userId: $userId, '
        'brandId: $brandId, '
        'model: $model, '
        'year: $year, '
        'plateNumber: $plateNumber, '
        'color: $color, '
        'vin: $vin, '
        'mileage: $mileage, '
        'isPrimary: $isPrimary, '
        'isVerified: $isVerified, '
        'status: $status, '
        'documents: $documents, '
        'images: $images, '
        'ownershipVerified: $ownershipVerified, '
        'ownershipVerifiedAt: $ownershipVerifiedAt, '
        'ownershipVerifiedBy: $ownershipVerifiedBy, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is VehicleModel &&
        other.id == id &&
        other.userId == userId &&
        other.brandId == brandId &&
        other.model == model &&
        other.year == year &&
        other.plateNumber == plateNumber &&
        other.color == color &&
        other.vin == vin &&
        other.mileage == mileage &&
        other.isPrimary == isPrimary &&
        other.isVerified == isVerified &&
        other.status == status &&
        equality.equals(other.documents, documents) &&
        equality.equals(other.images, images) &&
        other.ownershipVerified == ownershipVerified &&
        other.ownershipVerifiedAt == ownershipVerifiedAt &&
        other.ownershipVerifiedBy == ownershipVerifiedBy &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      id,
      userId,
      brandId,
      model,
      year,
      plateNumber,
      color,
      vin,
      mileage,
      isPrimary,
      isVerified,
      status,
      equality.hash(documents),
      equality.hash(images),
      ownershipVerified,
      ownershipVerifiedAt,
      ownershipVerifiedBy,
      createdAt,
      updatedAt,
    ]);
  }
}
