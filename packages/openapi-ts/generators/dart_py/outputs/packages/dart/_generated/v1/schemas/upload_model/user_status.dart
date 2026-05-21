enum UploadModelUserStatus {
  ACTIVE('active'),
  SUSPENDED('suspended'),
  DELETED('deleted'),
  ;

  final String value;

  const UploadModelUserStatus(this.value);

  static UploadModelUserStatus fromValue(String value) {
    return UploadModelUserStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
