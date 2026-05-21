class ReferenceDocumentsEndpoints {
  const ReferenceDocumentsEndpoints();

  /// Get a paginated list of all documents.
  String get getAllDocuments => '/references/documents/';

  /// Create a new document (admin only).
  String get createDocument => '/references/documents/';

  /// Get a specific document by ID.
  String getDocumentById(String id) => '/references/documents/by-id/$id';

  /// Get documents filtered by document type.
  String getDocumentsByType(String documentType) =>
      '/references/documents/type/$documentType';

  /// Update a specific document by ID (admin only).
  String updateDocument(String id) => '/references/documents/$id';

  /// Delete a specific document by ID (admin only).
  String deleteDocument(String id) => '/references/documents/$id';
}
