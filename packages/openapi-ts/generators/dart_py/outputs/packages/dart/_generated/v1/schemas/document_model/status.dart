enum DocumentModelStatus {
  ACTIVE('active'),
  INACTIVE('inactive'),
  DEPRECATED('deprecated'),
  ;

  final String value;

  const DocumentModelStatus(this.value);

  static DocumentModelStatus fromValue(String value) {
    return DocumentModelStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
