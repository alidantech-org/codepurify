import 'user.dart';
import 'package:collection/collection.dart';

class UploadModel {
  final String id;
  final String userId;
  final UploadModelUser? user;
  final String originalName;
  final String fileName;
  final String publicId;
  final String assetId;
  final String version;
  final String signature;
  final String resourceType;
  final String mimeType;
  final String format;
  final num size;
  final num bytes;
  final num? width;
  final num? height;
  final num? duration;
  final String url;
  final String secureUrl;
  final String? optimizedUrl;
  final String? thumbnailUrl;
  final String? folder;
  final List<String> tags;
  final bool isClaimed;
  final String? claimedByTable;
  final String? claimedById;
  final DateTime? expiresAt;
  final bool isDeleted;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const UploadModel({
    required this.id,
    required this.userId,
    this.user,
    required this.originalName,
    required this.fileName,
    required this.publicId,
    required this.assetId,
    required this.version,
    required this.signature,
    required this.resourceType,
    required this.mimeType,
    required this.format,
    required this.size,
    required this.bytes,
    this.width,
    this.height,
    this.duration,
    required this.url,
    required this.secureUrl,
    this.optimizedUrl,
    this.thumbnailUrl,
    this.folder,
    required this.tags,
    required this.isClaimed,
    this.claimedByTable,
    this.claimedById,
    this.expiresAt,
    required this.isDeleted,
    this.createdAt,
    this.updatedAt,
  });

  UploadModel copyWith({
    String? id,
    String? userId,
    UploadModelUser? user,
    String? originalName,
    String? fileName,
    String? publicId,
    String? assetId,
    String? version,
    String? signature,
    String? resourceType,
    String? mimeType,
    String? format,
    num? size,
    num? bytes,
    num? width,
    num? height,
    num? duration,
    String? url,
    String? secureUrl,
    String? optimizedUrl,
    String? thumbnailUrl,
    String? folder,
    List<String>? tags,
    bool? isClaimed,
    String? claimedByTable,
    String? claimedById,
    DateTime? expiresAt,
    bool? isDeleted,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UploadModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      user: user ?? this.user,
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
      optimizedUrl: optimizedUrl ?? this.optimizedUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      folder: folder ?? this.folder,
      tags: tags ?? this.tags,
      isClaimed: isClaimed ?? this.isClaimed,
      claimedByTable: claimedByTable ?? this.claimedByTable,
      claimedById: claimedById ?? this.claimedById,
      expiresAt: expiresAt ?? this.expiresAt,
      isDeleted: isDeleted ?? this.isDeleted,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory UploadModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return UploadModel(
      id: map['id']?.toString() ?? "",
      userId: map['userId']?.toString() ?? "",
      user: map['user'] == null ? null : UploadModelUser.fromJson(map['user']),
      originalName: map['originalName']?.toString() ?? "",
      fileName: map['fileName']?.toString() ?? "",
      publicId: map['publicId']?.toString() ?? "",
      assetId: map['assetId']?.toString() ?? "",
      version: map['version']?.toString() ?? "",
      signature: map['signature']?.toString() ?? "",
      resourceType: map['resourceType']?.toString() ?? "",
      mimeType: map['mimeType']?.toString() ?? "",
      format: map['format']?.toString() ?? "",
      size: num.tryParse(map['size']?.toString() ?? "") ?? 0,
      bytes: num.tryParse(map['bytes']?.toString() ?? "") ?? 0,
      width:
          map['width'] == null ? null : num.tryParse(map['width'].toString()),
      height:
          map['height'] == null ? null : num.tryParse(map['height'].toString()),
      duration: map['duration'] == null
          ? null
          : num.tryParse(map['duration'].toString()),
      url: map['url']?.toString() ?? "",
      secureUrl: map['secureUrl']?.toString() ?? "",
      optimizedUrl: map['optimizedUrl']?.toString(),
      thumbnailUrl: map['thumbnailUrl']?.toString(),
      folder: map['folder']?.toString(),
      tags: ((map['tags'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      isClaimed: map['isClaimed'] == true,
      claimedByTable: map['claimedByTable']?.toString(),
      claimedById: map['claimedById']?.toString(),
      expiresAt: map['expiresAt'] == null
          ? null
          : DateTime.parse(map['expiresAt'].toString()),
      isDeleted: map['isDeleted'] == true,
      createdAt: map['createdAt'] == null
          ? null
          : DateTime.parse(map['createdAt'].toString()),
      updatedAt: map['updatedAt'] == null
          ? null
          : DateTime.parse(map['updatedAt'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      if (user != null) 'user': user?.toJson(),
      'originalName': originalName,
      'fileName': fileName,
      'publicId': publicId,
      'assetId': assetId,
      'version': version,
      'signature': signature,
      'resourceType': resourceType,
      'mimeType': mimeType,
      'format': format,
      'size': size,
      'bytes': bytes,
      if (width != null) 'width': width,
      if (height != null) 'height': height,
      if (duration != null) 'duration': duration,
      'url': url,
      'secureUrl': secureUrl,
      if (optimizedUrl != null) 'optimizedUrl': optimizedUrl,
      if (thumbnailUrl != null) 'thumbnailUrl': thumbnailUrl,
      if (folder != null) 'folder': folder,
      'tags': tags,
      'isClaimed': isClaimed,
      if (claimedByTable != null) 'claimedByTable': claimedByTable,
      if (claimedById != null) 'claimedById': claimedById,
      if (expiresAt != null) 'expiresAt': expiresAt?.toIso8601String(),
      'isDeleted': isDeleted,
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'UploadModel('
        'id: $id, '
        'userId: $userId, '
        'user: $user, '
        'originalName: $originalName, '
        'fileName: $fileName, '
        'publicId: $publicId, '
        'assetId: $assetId, '
        'version: $version, '
        'signature: $signature, '
        'resourceType: $resourceType, '
        'mimeType: $mimeType, '
        'format: $format, '
        'size: $size, '
        'bytes: $bytes, '
        'width: $width, '
        'height: $height, '
        'duration: $duration, '
        'url: $url, '
        'secureUrl: $secureUrl, '
        'optimizedUrl: $optimizedUrl, '
        'thumbnailUrl: $thumbnailUrl, '
        'folder: $folder, '
        'tags: $tags, '
        'isClaimed: $isClaimed, '
        'claimedByTable: $claimedByTable, '
        'claimedById: $claimedById, '
        'expiresAt: $expiresAt, '
        'isDeleted: $isDeleted, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is UploadModel &&
        other.id == id &&
        other.userId == userId &&
        equality.equals(other.user, user) &&
        other.originalName == originalName &&
        other.fileName == fileName &&
        other.publicId == publicId &&
        other.assetId == assetId &&
        other.version == version &&
        other.signature == signature &&
        other.resourceType == resourceType &&
        other.mimeType == mimeType &&
        other.format == format &&
        other.size == size &&
        other.bytes == bytes &&
        other.width == width &&
        other.height == height &&
        other.duration == duration &&
        other.url == url &&
        other.secureUrl == secureUrl &&
        other.optimizedUrl == optimizedUrl &&
        other.thumbnailUrl == thumbnailUrl &&
        other.folder == folder &&
        equality.equals(other.tags, tags) &&
        other.isClaimed == isClaimed &&
        other.claimedByTable == claimedByTable &&
        other.claimedById == claimedById &&
        other.expiresAt == expiresAt &&
        other.isDeleted == isDeleted &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      id,
      userId,
      equality.hash(user),
      originalName,
      fileName,
      publicId,
      assetId,
      version,
      signature,
      resourceType,
      mimeType,
      format,
      size,
      bytes,
      width,
      height,
      duration,
      url,
      secureUrl,
      optimizedUrl,
      thumbnailUrl,
      folder,
      equality.hash(tags),
      isClaimed,
      claimedByTable,
      claimedById,
      expiresAt,
      isDeleted,
      createdAt,
      updatedAt,
    ]);
  }
}
