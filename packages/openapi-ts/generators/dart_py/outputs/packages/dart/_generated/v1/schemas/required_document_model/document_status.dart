enum RequiredDocumentModelDocumentStatus {
  ACTIVE('active'),
  INACTIVE('inactive'),
  DEPRECATED('deprecated'),
  ;

  final String value;

  const RequiredDocumentModelDocumentStatus(this.value);

  static RequiredDocumentModelDocumentStatus fromValue(String value) {
    return RequiredDocumentModelDocumentStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
