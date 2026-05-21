class VehicleServiceModelEstimatedCostRange {
  final num min;
  final num max;

  const VehicleServiceModelEstimatedCostRange({
    required this.min,
    required this.max,
  });

  VehicleServiceModelEstimatedCostRange copyWith({
    num? min,
    num? max,
  }) {
    return VehicleServiceModelEstimatedCostRange(
      min: min ?? this.min,
      max: max ?? this.max,
    );
  }

  factory VehicleServiceModelEstimatedCostRange.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return VehicleServiceModelEstimatedCostRange(
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
    return 'VehicleServiceModelEstimatedCostRange('
        'min: $min, '
        'max: $max'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is VehicleServiceModelEstimatedCostRange &&
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
