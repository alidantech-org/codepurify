class CreateDocumentRequest {
  final String name;
  final String code;
  final List<String> aliases;
  final String description;
  final String documentType;
  final String category;
  final String status;
  final String format;
  final num? maxSizeMB;
  final List<String>? requiredFields;
  final Map<String, Object?>? meta;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;
  final bool isMandatory;

  const CreateDocumentRequest({
    required this.name,
    required this.code,
    required this.aliases,
    required this.description,
    required this.documentType,
    required this.category,
    required this.status,
    required this.format,
    this.maxSizeMB,
    this.requiredFields,
    this.meta,
    required this.isActive,
    required this.isVerified,
    required this.isFeatured,
    required this.isMandatory,
  });

  factory CreateDocumentRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateDocumentRequest(
      name: map['name']?.toString() ?? "",
      code: map['code']?.toString() ?? "",
      aliases: ((map['aliases'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      description: map['description']?.toString() ?? "",
      documentType: map['documentType']?.toString() ?? "",
      category: map['category']?.toString() ?? "",
      status: map['status']?.toString() ?? "",
      format: map['format']?.toString() ?? "",
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
      isActive: map['isActive'] == true,
      isVerified: map['isVerified'] == true,
      isFeatured: map['isFeatured'] == true,
      isMandatory: map['isMandatory'] == true,
    );
  }

  Map<String, Object?> toJson() {
    return {
      'name': name,
      'code': code,
      'aliases': aliases,
      'description': description,
      'documentType': documentType,
      'category': category,
      'status': status,
      'format': format,
      if (maxSizeMB != null) 'maxSizeMB': maxSizeMB,
      if (requiredFields != null) 'requiredFields': requiredFields,
      if (meta != null) 'meta': meta,
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
      'isMandatory': isMandatory,
    };
  }
}
