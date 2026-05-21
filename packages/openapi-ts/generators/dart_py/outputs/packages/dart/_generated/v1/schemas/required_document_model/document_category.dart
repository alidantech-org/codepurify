enum RequiredDocumentModelDocumentCategory {
  LEGAL('legal'),
  IDENTIFICATION('identification'),
  VEHICLE('vehicle'),
  INSURANCE('insurance'),
  MAINTENANCE('maintenance'),
  CERTIFICATION('certification'),
  OTHER('other'),
  ;

  final String value;

  const RequiredDocumentModelDocumentCategory(this.value);

  static RequiredDocumentModelDocumentCategory fromValue(String value) {
    return RequiredDocumentModelDocumentCategory.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
