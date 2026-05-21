// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

import 'user.dart';

class Vehicle {
  final String id;
  final String name;
  final String photo;
  final String insuranceCompany;
  final DateTime insurancePolicyExpirationDate;
  final User owner;
  final String type;
  final String numberPlate;
  final String vin;
  final String make;
  final String vehicleModel;
  final int year;
  final String color;
  final VehicleStatus status;
  final DateTime updatedAt;
  final DateTime createdAt;

  const Vehicle({
    required this.id,
    required this.name,
    required this.photo,
    required this.insuranceCompany,
    required this.insurancePolicyExpirationDate,
    required this.owner,
    required this.type,
    required this.numberPlate,
    required this.vin,
    required this.make,
    required this.vehicleModel,
    required this.year,
    required this.color,
    required this.status,
    required this.updatedAt,
    required this.createdAt,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      photo: json['photo'] ?? '',
      insuranceCompany: json['insuranceCompany'] ?? '',
      insurancePolicyExpirationDate:
          json['insurancePolicyExpirationDate'] == null
              ? DateTime.now()
              : DateTime.parse(json['insurancePolicyExpirationDate'] as String),
      owner: json['owner'] == null
          ? User.fromJson(<String, dynamic>{})
          : User.fromJson(Map<String, dynamic>.from(json['owner'] as Map)),
      type: json['type'] ?? '',
      numberPlate: json['numberPlate'] ?? '',
      vin: json['vin'] ?? '',
      make: json['make'] ?? '',
      vehicleModel: json['vehicleModel'] ?? '',
      year: json['year'] ?? 0,
      color: json['color'] ?? '',
      status: VehicleStatus.fromJson(json['status'] as String?) ??
          VehicleStatus.values.first,
      updatedAt: json['updatedAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['updatedAt'] as String),
      createdAt: json['createdAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'photo': photo,
      'insuranceCompany': insuranceCompany,
      'insurancePolicyExpirationDate':
          insurancePolicyExpirationDate.toIso8601String(),
      'owner': owner.toJson(),
      'type': type,
      'numberPlate': numberPlate,
      'vin': vin,
      'make': make,
      'vehicleModel': vehicleModel,
      'year': year,
      'color': color,
      'status': status.toJson(),
      'updatedAt': updatedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  Vehicle copyWith({
    String? id,
    String? name,
    String? photo,
    String? insuranceCompany,
    DateTime? insurancePolicyExpirationDate,
    User? owner,
    String? type,
    String? numberPlate,
    String? vin,
    String? make,
    String? vehicleModel,
    int? year,
    String? color,
    VehicleStatus? status,
    DateTime? updatedAt,
    DateTime? createdAt,
  }) {
    return Vehicle(
      id: id ?? this.id,
      name: name ?? this.name,
      photo: photo ?? this.photo,
      insuranceCompany: insuranceCompany ?? this.insuranceCompany,
      insurancePolicyExpirationDate:
          insurancePolicyExpirationDate ?? this.insurancePolicyExpirationDate,
      owner: owner ?? this.owner,
      type: type ?? this.type,
      numberPlate: numberPlate ?? this.numberPlate,
      vin: vin ?? this.vin,
      make: make ?? this.make,
      vehicleModel: vehicleModel ?? this.vehicleModel,
      year: year ?? this.year,
      color: color ?? this.color,
      status: status ?? this.status,
      updatedAt: updatedAt ?? this.updatedAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

enum VehicleType {
  car('car'),
  truck('truck'),
  motorcycle('motorcycle'),
  bus('bus'),
  trailer('trailer'),
  van('van'),
  bike('bike'),
  other('other');

  final String value;

  const VehicleType(this.value);

  static VehicleType? fromJson(String? value) {
    if (value == null) return null;

    return VehicleType.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleType.car,
    );
  }

  String toJson() => value;
}

enum VehicleStatus {
  goodCondition('good_condition'),
  needsMaintenance('needs_maintenance'),
  hidden('hidden');

  final String value;

  const VehicleStatus(this.value);

  static VehicleStatus? fromJson(String? value) {
    if (value == null) return null;

    return VehicleStatus.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleStatus.goodCondition,
    );
  }

  String toJson() => value;
}
