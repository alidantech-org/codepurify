enum DocumentModelCategory {
  LEGAL('legal'),
  IDENTIFICATION('identification'),
  VEHICLE('vehicle'),
  INSURANCE('insurance'),
  MAINTENANCE('maintenance'),
  CERTIFICATION('certification'),
  OTHER('other'),
  ;

  final String value;

  const DocumentModelCategory(this.value);

  static DocumentModelCategory fromValue(String value) {
    return DocumentModelCategory.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
