class UploadsEndpoints {
  const UploadsEndpoints();

  /// Upload a file to the server.
  String get uploadFile => '/uploads/';

  /// Claim an upload for the authenticated user.
  String claimUpload(String uploadId) => '/uploads/$uploadId/claim';

  /// Delete an upload by ID.
  String deleteUpload(String uploadId) => '/uploads/$uploadId';
}
