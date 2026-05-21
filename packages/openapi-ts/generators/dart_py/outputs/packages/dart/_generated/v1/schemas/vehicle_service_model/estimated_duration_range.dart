class VehicleServiceModelEstimatedDurationRange {
  final num min;
  final num max;

  const VehicleServiceModelEstimatedDurationRange({
    required this.min,
    required this.max,
  });

  VehicleServiceModelEstimatedDurationRange copyWith({
    num? min,
    num? max,
  }) {
    return VehicleServiceModelEstimatedDurationRange(
      min: min ?? this.min,
      max: max ?? this.max,
    );
  }

  factory VehicleServiceModelEstimatedDurationRange.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return VehicleServiceModelEstimatedDurationRange(
      min: num.tryParse(map['min']?.toString() ?? "") ?? 0,
      max: num.tryParse(map['max']?.toString() ?? "") ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'min': min,
      'max': max,
    };
  }

  @override
  String toString() {
    return 'VehicleServiceModelEstimatedDurationRange('
        'min: $min, '
        'max: $max'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is VehicleServiceModelEstimatedDurationRange &&
        other.min == min &&
        other.max == max;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      min,
      max,
    ]);
  }
}
