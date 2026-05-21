class RequiredDocumentsEndpoints {
  const RequiredDocumentsEndpoints();

  /// Get a paginated list of all required documents.
  String get getAllRequiredDocuments => '/references/documents/required/';

  /// Create a new required document (admin only).
  String get createRequiredDocument => '/references/documents/required/';

  /// Get a specific required document by ID.
  String getRequiredDocumentById(String id) =>
      '/references/documents/required/$id';

  /// Update a specific required document by ID (admin only).
  String updateRequiredDocument(String id) =>
      '/references/documents/required/$id';

  /// Delete a specific required document by ID (admin only).
  String deleteRequiredDocument(String id) =>
      '/references/documents/required/$id';

  /// Get required documents filtered by service type.
  String getRequiredDocumentsByServiceType(String serviceType) =>
      '/references/documents/required/service/$serviceType';
}
