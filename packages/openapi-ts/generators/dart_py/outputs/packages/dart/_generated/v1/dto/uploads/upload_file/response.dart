class UploadFileResponse {
  final bool success;
  final String message;
  final String uploadId;
  final String url;
  final String secureUrl;
  final String? optimizedUrl;
  final String? thumbnailUrl;
  final String publicId;
  final String resourceType;

  const UploadFileResponse({
    required this.success,
    required this.message,
    required this.uploadId,
    required this.url,
    required this.secureUrl,
    this.optimizedUrl,
    this.thumbnailUrl,
    required this.publicId,
    required this.resourceType,
  });

  factory UploadFileResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UploadFileResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      uploadId: map['uploadId']?.toString() ?? "",
      url: map['url']?.toString() ?? "",
      secureUrl: map['secureUrl']?.toString() ?? "",
      optimizedUrl: map['optimizedUrl']?.toString(),
      thumbnailUrl: map['thumbnailUrl']?.toString(),
      publicId: map['publicId']?.toString() ?? "",
      resourceType: map['resourceType']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'uploadId': uploadId,
      'url': url,
      'secureUrl': secureUrl,
      if (optimizedUrl != null) 'optimizedUrl': optimizedUrl,
      if (thumbnailUrl != null) 'thumbnailUrl': thumbnailUrl,
      'publicId': publicId,
      'resourceType': resourceType,
    };
  }
}
