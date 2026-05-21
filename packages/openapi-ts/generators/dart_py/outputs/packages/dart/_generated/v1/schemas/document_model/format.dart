enum DocumentModelFormat {
  PDF('pdf'),
  JPG('jpg'),
  PNG('png'),
  DOCX('docx'),
  OTHER('other'),
  ;

  final String value;

  const DocumentModelFormat(this.value);

  static DocumentModelFormat fromValue(String value) {
    return DocumentModelFormat.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
