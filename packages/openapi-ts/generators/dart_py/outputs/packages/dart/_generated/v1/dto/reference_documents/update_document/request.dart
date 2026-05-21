class UpdateDocumentRequest {
  final String? name;
  final String? code;
  final List<String>? aliases;
  final String? description;
  final String? documentType;
  final String? category;
  final String? status;
  final String? format;
  final num? maxSizeMB;
  final List<String>? requiredFields;
  final Map<String, Object?>? meta;
  final bool? isActive;
  final bool? isVerified;
  final bool? isFeatured;
  final bool? isMandatory;

  const UpdateDocumentRequest({
    this.name,
    this.code,
    this.aliases,
    this.description,
    this.documentType,
    this.category,
    this.status,
    this.format,
    this.maxSizeMB,
    this.requiredFields,
    this.meta,
    this.isActive,
    this.isVerified,
    this.isFeatured,
    this.isMandatory,
  });

  factory UpdateDocumentRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateDocumentRequest(
      name: map['name']?.toString(),
      code: map['code']?.toString(),
      aliases: map['aliases'] == null
          ? null
          : ((map['aliases'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      description: map['description']?.toString(),
      documentType: map['documentType']?.toString(),
      category: map['category']?.toString(),
      status: map['status']?.toString(),
      format: map['format']?.toString(),
      maxSizeMB: map['maxSizeMB'] == null
          ? null
          : num.tryParse(map['maxSizeMB'].toString()),
      requiredFields: map['requiredFields'] == null
          ? null
          : ((map['requiredFields'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      meta: map['meta'] == null
          ? null
          : Map<String, Object?>.from(map['meta'] as Map),
      isActive: map['isActive'] == null ? null : map['isActive'] == true,
      isVerified: map['isVerified'] == null ? null : map['isVerified'] == true,
      isFeatured: map['isFeatured'] == null ? null : map['isFeatured'] == true,
      isMandatory:
          map['isMandatory'] == null ? null : map['isMandatory'] == true,
    );
  }

  Map<String, Object?> toJson() {
    return {
      if (name != null) 'name': name,
      if (code != null) 'code': code,
      if (aliases != null) 'aliases': aliases,
      if (description != null) 'description': description,
      if (documentType != null) 'documentType': documentType,
      if (category != null) 'category': category,
      if (status != null) 'status': status,
      if (format != null) 'format': format,
      if (maxSizeMB != null) 'maxSizeMB': maxSizeMB,
      if (requiredFields != null) 'requiredFields': requiredFields,
      if (meta != null) 'meta': meta,
      if (isActive != null) 'isActive': isActive,
      if (isVerified != null) 'isVerified': isVerified,
      if (isFeatured != null) 'isFeatured': isFeatured,
      if (isMandatory != null) 'isMandatory': isMandatory,
    };
  }
}
