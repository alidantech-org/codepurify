enum PartialPublicUserModelStatus {
  ACTIVE('active'),
  SUSPENDED('suspended'),
  DELETED('deleted'),
  ;

  final String value;

  const PartialPublicUserModelStatus(this.value);

  static PartialPublicUserModelStatus fromValue(String value) {
    return PartialPublicUserModelStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
