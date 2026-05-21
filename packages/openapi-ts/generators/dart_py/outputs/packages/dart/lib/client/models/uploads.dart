// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

import 'user.dart';

class Upload {
  final String id;
  final String userId;
  final String originalName;
  final String fileName;
  final String publicId;
  final String? assetId;
  final int? version;
  final String? signature;
  final UploadResourceType resourceType;
  final String mimeType;
  final String? format;
  final int size;
  final int? bytes;
  final int? width;
  final int? height;
  final double? duration;
  final String url;
  final String secureUrl;
  final String? thumbnailUrl;
  final String? optimizedUrl;
  final String? folder;
  final List<String>? tags;
  final bool isClaimed;
  final String? claimedByTable;
  final String? claimedById;
  final DateTime? expiresAt;
  final bool isDeleted;
  final User? user;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Upload({
    required this.id,
    required this.userId,
    required this.originalName,
    required this.fileName,
    required this.publicId,
    this.assetId,
    this.version,
    this.signature,
    required this.resourceType,
    required this.mimeType,
    this.format,
    required this.size,
    this.bytes,
    this.width,
    this.height,
    this.duration,
    required this.url,
    required this.secureUrl,
    this.thumbnailUrl,
    this.optimizedUrl,
    this.folder,
    this.tags,
    required this.isClaimed,
    this.claimedByTable,
    this.claimedById,
    this.expiresAt,
    required this.isDeleted,
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Upload.fromJson(Map<String, dynamic> json) {
    return Upload(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      originalName: json['originalName'] ?? '',
      fileName: json['fileName'] ?? '',
      publicId: json['publicId'] ?? '',
      assetId: json['assetId'],
      version: json['version'],
      signature: json['signature'],
      resourceType:
          UploadResourceType.fromJson(json['resourceType'] as String?) ??
              UploadResourceType.values.first,
      mimeType: json['mimeType'] ?? '',
      format: json['format'],
      size: json['size'] ?? 0,
      bytes: json['bytes'],
      width: json['width'],
      height: json['height'],
      duration: json['duration'],
      url: json['url'] ?? '',
      secureUrl: json['secureUrl'] ?? '',
      thumbnailUrl: json['thumbnailUrl'],
      optimizedUrl: json['optimizedUrl'],
      folder: json['folder'],
      tags: json['tags'] == null ? null : List.from(json['tags'] as List),
      isClaimed: json['isClaimed'] ?? false,
      claimedByTable: json['claimedByTable'],
      claimedById: json['claimedById'],
      expiresAt: json['expiresAt'] == null
          ? null
          : DateTime.parse(json['expiresAt'] as String),
      isDeleted: json['isDeleted'] ?? false,
      user: json['user'] == null
          ? null
          : User.fromJson(Map<String, dynamic>.from(json['user'] as Map)),
      createdAt: json['createdAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'originalName': originalName,
      'fileName': fileName,
      'publicId': publicId,
      'assetId': assetId,
      'version': version,
      'signature': signature,
      'resourceType': resourceType.toJson(),
      'mimeType': mimeType,
      'format': format,
      'size': size,
      'bytes': bytes,
      'width': width,
      'height': height,
      'duration': duration,
      'url': url,
      'secureUrl': secureUrl,
      'thumbnailUrl': thumbnailUrl,
      'optimizedUrl': optimizedUrl,
      'folder': folder,
      'tags': tags,
      'isClaimed': isClaimed,
      'claimedByTable': claimedByTable,
      'claimedById': claimedById,
      'expiresAt': expiresAt?.toIso8601String(),
      'isDeleted': isDeleted,
      'user': user?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Upload copyWith({
    String? id,
    String? userId,
    String? originalName,
    String? fileName,
    String? publicId,
    String? assetId,
    int? version,
    String? signature,
    UploadResourceType? resourceType,
    String? mimeType,
    String? format,
    int? size,
    int? bytes,
    int? width,
    int? height,
    double? duration,
    String? url,
    String? secureUrl,
    String? thumbnailUrl,
    String? optimizedUrl,
    String? folder,
    List<String>? tags,
    bool? isClaimed,
    String? claimedByTable,
    String? claimedById,
    DateTime? expiresAt,
    bool? isDeleted,
    User? user,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Upload(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      originalName: originalName ?? this.originalName,
      fileName: fileName ?? this.fileName,
      publicId: publicId ?? this.publicId,
      assetId: assetId ?? this.assetId,
      version: version ?? this.version,
      signature: signature ?? this.signature,
      resourceType: resourceType ?? this.resourceType,
      mimeType: mimeType ?? this.mimeType,
      format: format ?? this.format,
      size: size ?? this.size,
      bytes: bytes ?? this.bytes,
      width: width ?? this.width,
      height: height ?? this.height,
      duration: duration ?? this.duration,
      url: url ?? this.url,
      secureUrl: secureUrl ?? this.secureUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      optimizedUrl: optimizedUrl ?? this.optimizedUrl,
      folder: folder ?? this.folder,
      tags: tags ?? this.tags,
      isClaimed: isClaimed ?? this.isClaimed,
      claimedByTable: claimedByTable ?? this.claimedByTable,
      claimedById: claimedById ?? this.claimedById,
      expiresAt: expiresAt ?? this.expiresAt,
      isDeleted: isDeleted ?? this.isDeleted,
      user: user ?? this.user,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class UploadResult {
  final String uploadId;
  final String url;
  final String secureUrl;
  final String? thumbnailUrl;
  final String? optimizedUrl;
  final String publicId;
  final UploadResourceType resourceType;

  const UploadResult({
    required this.uploadId,
    required this.url,
    required this.secureUrl,
    this.thumbnailUrl,
    this.optimizedUrl,
    required this.publicId,
    required this.resourceType,
  });

  factory UploadResult.fromJson(Map<String, dynamic> json) {
    return UploadResult(
      uploadId: json['uploadId'] ?? '',
      url: json['url'] ?? '',
      secureUrl: json['secureUrl'] ?? '',
      thumbnailUrl: json['thumbnailUrl'],
      optimizedUrl: json['optimizedUrl'],
      publicId: json['publicId'] ?? '',
      resourceType:
          UploadResourceType.fromJson(json['resourceType'] as String?) ??
              UploadResourceType.values.first,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uploadId': uploadId,
      'url': url,
      'secureUrl': secureUrl,
      'thumbnailUrl': thumbnailUrl,
      'optimizedUrl': optimizedUrl,
      'publicId': publicId,
      'resourceType': resourceType.toJson(),
    };
  }

  UploadResult copyWith({
    String? uploadId,
    String? url,
    String? secureUrl,
    String? thumbnailUrl,
    String? optimizedUrl,
    String? publicId,
    UploadResourceType? resourceType,
  }) {
    return UploadResult(
      uploadId: uploadId ?? this.uploadId,
      url: url ?? this.url,
      secureUrl: secureUrl ?? this.secureUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      optimizedUrl: optimizedUrl ?? this.optimizedUrl,
      publicId: publicId ?? this.publicId,
      resourceType: resourceType ?? this.resourceType,
    );
  }
}

enum UploadResourceType {
  image('image'),
  video('video'),
  raw('raw'),
  auto('auto');

  final String value;

  const UploadResourceType(this.value);

  static UploadResourceType? fromJson(String? value) {
    if (value == null) return null;

    return UploadResourceType.values.firstWhere(
      (item) => item.value == value,
      orElse: () => UploadResourceType.image,
    );
  }

  String toJson() => value;
}
