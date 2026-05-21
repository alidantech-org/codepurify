enum RequiredDocumentModelDocumentFormat {
  PDF('pdf'),
  JPG('jpg'),
  PNG('png'),
  DOCX('docx'),
  OTHER('other'),
  ;

  final String value;

  const RequiredDocumentModelDocumentFormat(this.value);

  static RequiredDocumentModelDocumentFormat fromValue(String value) {
    return RequiredDocumentModelDocumentFormat.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
