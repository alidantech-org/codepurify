enum VehicleModelStatus {
  GOODCONDITION('good_condition'),
  NEEDSMAINTENANCE('needs_maintenance'),
  HIDDEN('hidden'),
  ;

  final String value;

  const VehicleModelStatus(this.value);

  static VehicleModelStatus fromValue(String value) {
    return VehicleModelStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
