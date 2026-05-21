// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

import 'global.dart';

class DocumentMeta {
  final bool? expiryRequired;
  final int? maxExpiryDays;
  final int? renewalReminderDays;
  final String? issuingAuthority;
  final String? templateUrl;

  const DocumentMeta({
    this.expiryRequired,
    this.maxExpiryDays,
    this.renewalReminderDays,
    this.issuingAuthority,
    this.templateUrl,
  });

  factory DocumentMeta.fromJson(Map<String, dynamic> json) {
    return DocumentMeta(
      expiryRequired: json['expiryRequired'],
      maxExpiryDays: json['maxExpiryDays'],
      renewalReminderDays: json['renewalReminderDays'],
      issuingAuthority: json['issuingAuthority'],
      templateUrl: json['templateUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'expiryRequired': expiryRequired,
      'maxExpiryDays': maxExpiryDays,
      'renewalReminderDays': renewalReminderDays,
      'issuingAuthority': issuingAuthority,
      'templateUrl': templateUrl,
    };
  }

  DocumentMeta copyWith({
    bool? expiryRequired,
    int? maxExpiryDays,
    int? renewalReminderDays,
    String? issuingAuthority,
    String? templateUrl,
  }) {
    return DocumentMeta(
      expiryRequired: expiryRequired ?? this.expiryRequired,
      maxExpiryDays: maxExpiryDays ?? this.maxExpiryDays,
      renewalReminderDays: renewalReminderDays ?? this.renewalReminderDays,
      issuingAuthority: issuingAuthority ?? this.issuingAuthority,
      templateUrl: templateUrl ?? this.templateUrl,
    );
  }
}

class Document {
  final String id;
  final String name;
  final String code;
  final List<String> aliases;
  final String description;
  final DocumentType documentType;
  final DocumentCategory category;
  final DocumentStatus status;
  final DocumentFormat format;
  final double? maxSizeMB;
  final List<String>? requiredFields;
  final DocumentMeta meta;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;
  final bool isMandatory;
  final int usageCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Document({
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
    required this.meta,
    required this.isActive,
    required this.isVerified,
    required this.isFeatured,
    required this.isMandatory,
    required this.usageCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      aliases:
          json['aliases'] == null ? [] : List.from(json['aliases'] as List),
      description: json['description'] ?? '',
      documentType: DocumentType.fromJson(json['documentType'] as String?) ??
          DocumentType.values.first,
      category: DocumentCategory.fromJson(json['category'] as String?) ??
          DocumentCategory.values.first,
      status: DocumentStatus.fromJson(json['status'] as String?) ??
          DocumentStatus.values.first,
      format: DocumentFormat.fromJson(json['format'] as String?) ??
          DocumentFormat.values.first,
      maxSizeMB: json['maxSizeMB'],
      requiredFields: json['requiredFields'] == null
          ? null
          : List.from(json['requiredFields'] as List),
      meta: json['meta'] == null
          ? DocumentMeta.fromJson(<String, dynamic>{})
          : DocumentMeta.fromJson(
              Map<String, dynamic>.from(json['meta'] as Map)),
      isActive: json['isActive'] ?? false,
      isVerified: json['isVerified'] ?? false,
      isFeatured: json['isFeatured'] ?? false,
      isMandatory: json['isMandatory'] ?? false,
      usageCount: json['usageCount'] ?? 0,
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
      'name': name,
      'code': code,
      'aliases': aliases,
      'description': description,
      'documentType': documentType.toJson(),
      'category': category.toJson(),
      'status': status.toJson(),
      'format': format.toJson(),
      'maxSizeMB': maxSizeMB,
      'requiredFields': requiredFields,
      'meta': meta.toJson(),
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
      'isMandatory': isMandatory,
      'usageCount': usageCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Document copyWith({
    String? id,
    String? name,
    String? code,
    List<String>? aliases,
    String? description,
    DocumentType? documentType,
    DocumentCategory? category,
    DocumentStatus? status,
    DocumentFormat? format,
    double? maxSizeMB,
    List<String>? requiredFields,
    DocumentMeta? meta,
    bool? isActive,
    bool? isVerified,
    bool? isFeatured,
    bool? isMandatory,
    int? usageCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Document(
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
}

enum DocumentCategory {
  legal('legal'),
  identification('identification'),
  vehicle('vehicle'),
  insurance('insurance'),
  maintenance('maintenance'),
  certification('certification'),
  other('other');

  final String value;

  const DocumentCategory(this.value);

  static DocumentCategory? fromJson(String? value) {
    if (value == null) return null;

    return DocumentCategory.values.firstWhere(
      (item) => item.value == value,
      orElse: () => DocumentCategory.legal,
    );
  }

  String toJson() => value;
}

enum DocumentStatus {
  active('active'),
  inactive('inactive'),
  deprecated('deprecated');

  final String value;

  const DocumentStatus(this.value);

  static DocumentStatus? fromJson(String? value) {
    if (value == null) return null;

    return DocumentStatus.values.firstWhere(
      (item) => item.value == value,
      orElse: () => DocumentStatus.active,
    );
  }

  String toJson() => value;
}

enum DocumentFormat {
  pdf('pdf'),
  jpg('jpg'),
  png('png'),
  docx('docx'),
  other('other');

  final String value;

  const DocumentFormat(this.value);

  static DocumentFormat? fromJson(String? value) {
    if (value == null) return null;

    return DocumentFormat.values.firstWhere(
      (item) => item.value == value,
      orElse: () => DocumentFormat.pdf,
    );
  }

  String toJson() => value;
}
