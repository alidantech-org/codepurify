import 'document_category.dart';
import 'document_format.dart';
import 'document_meta.dart';
import 'document_status.dart';
import 'package:collection/collection.dart';

class RequiredDocumentModelDocument {
  final String id;
  final String name;
  final String code;
  final List<String> aliases;
  final String description;
  final String documentType;
  final RequiredDocumentModelDocumentCategory category;
  final RequiredDocumentModelDocumentStatus status;
  final RequiredDocumentModelDocumentFormat format;
  final num? maxSizeMB;
  final List<String>? requiredFields;
  final RequiredDocumentModelDocumentMeta? meta;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;
  final bool isMandatory;
  final num usageCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const RequiredDocumentModelDocument({
    required this.id,
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
    required this.usageCount,
    this.createdAt,
    this.updatedAt,
  });

  RequiredDocumentModelDocument copyWith({
    String? id,
    String? name,
    String? code,
    List<String>? aliases,
    String? description,
    String? documentType,
    RequiredDocumentModelDocumentCategory? category,
    RequiredDocumentModelDocumentStatus? status,
    RequiredDocumentModelDocumentFormat? format,
    num? maxSizeMB,
    List<String>? requiredFields,
    RequiredDocumentModelDocumentMeta? meta,
    bool? isActive,
    bool? isVerified,
    bool? isFeatured,
    bool? isMandatory,
    num? usageCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return RequiredDocumentModelDocument(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      aliases: aliases ?? this.aliases,
      description: description ?? this.description,
      documentType: documentType ?? this.documentType,
      category: category ?? this.category,
      status: status ?? this.status,
      format: format ?? this.format,
      maxSizeMB: maxSizeMB ?? this.maxSizeMB,
      requiredFields: requiredFields ?? this.requiredFields,
      meta: meta ?? this.meta,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      isFeatured: isFeatured ?? this.isFeatured,
      isMandatory: isMandatory ?? this.isMandatory,
      usageCount: usageCount ?? this.usageCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory RequiredDocumentModelDocument.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return RequiredDocumentModelDocument(
      id: map['id']?.toString() ?? "",
      name: map['name']?.toString() ?? "",
      code: map['code']?.toString() ?? "",
      aliases: ((map['aliases'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      description: map['description']?.toString() ?? "",
      documentType: map['documentType']?.toString() ?? "",
      category: RequiredDocumentModelDocumentCategory.fromValue(
          map['category']?.toString() ?? ""),
      status: RequiredDocumentModelDocumentStatus.fromValue(
          map['status']?.toString() ?? ""),
      format: RequiredDocumentModelDocumentFormat.fromValue(
          map['format']?.toString() ?? ""),
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
          : RequiredDocumentModelDocumentMeta.fromJson(map['meta']),
      isActive: map['isActive'] == true,
      isVerified: map['isVerified'] == true,
      isFeatured: map['isFeatured'] == true,
      isMandatory: map['isMandatory'] == true,
      usageCount: num.tryParse(map['usageCount']?.toString() ?? "") ?? 0,
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
      'name': name,
      'code': code,
      'aliases': aliases,
      'description': description,
      'documentType': documentType,
      'category': category.value,
      'status': status.value,
      'format': format.value,
      if (maxSizeMB != null) 'maxSizeMB': maxSizeMB,
      if (requiredFields != null) 'requiredFields': requiredFields,
      if (meta != null) 'meta': meta?.toJson(),
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
      'isMandatory': isMandatory,
      'usageCount': usageCount,
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'RequiredDocumentModelDocument('
        'id: $id, '
        'name: $name, '
        'code: $code, '
        'aliases: $aliases, '
        'description: $description, '
        'documentType: $documentType, '
        'category: $category, '
        'status: $status, '
        'format: $format, '
        'maxSizeMB: $maxSizeMB, '
        'requiredFields: $requiredFields, '
        'meta: $meta, '
        'isActive: $isActive, '
        'isVerified: $isVerified, '
        'isFeatured: $isFeatured, '
        'isMandatory: $isMandatory, '
        'usageCount: $usageCount, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is RequiredDocumentModelDocument &&
        other.id == id &&
        other.name == name &&
        other.code == code &&
        equality.equals(other.aliases, aliases) &&
        other.description == description &&
        other.documentType == documentType &&
        other.category == category &&
        other.status == status &&
        other.format == format &&
        other.maxSizeMB == maxSizeMB &&
        equality.equals(other.requiredFields, requiredFields) &&
        equality.equals(other.meta, meta) &&
        other.isActive == isActive &&
        other.isVerified == isVerified &&
        other.isFeatured == isFeatured &&
        other.isMandatory == isMandatory &&
        other.usageCount == usageCount &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      id,
      name,
      code,
      equality.hash(aliases),
      description,
      documentType,
      category,
      status,
      format,
      maxSizeMB,
      equality.hash(requiredFields),
      equality.hash(meta),
      isActive,
      isVerified,
      isFeatured,
      isMandatory,
      usageCount,
      createdAt,
      updatedAt,
    ]);
  }
}
