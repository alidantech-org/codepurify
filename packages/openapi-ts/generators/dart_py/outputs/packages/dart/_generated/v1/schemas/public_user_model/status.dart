enum PublicUserModelStatus {
  ACTIVE('active'),
  SUSPENDED('suspended'),
  DELETED('deleted'),
  ;

  final String value;

  const PublicUserModelStatus(this.value);

  static PublicUserModelStatus fromValue(String value) {
    return PublicUserModelStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
