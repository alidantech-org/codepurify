import 'document.dart';
import 'package:collection/collection.dart';

class RequiredDocumentModel {
  final String id;
  final String documentId;
  final RequiredDocumentModelDocument? document;
  final String serviceType;
  final bool isMandatory;
  final num? expiryDays;
  final num? renewalReminderDays;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const RequiredDocumentModel({
    required this.id,
    required this.documentId,
    this.document,
    required this.serviceType,
    required this.isMandatory,
    this.expiryDays,
    this.renewalReminderDays,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  RequiredDocumentModel copyWith({
    String? id,
    String? documentId,
    RequiredDocumentModelDocument? document,
    String? serviceType,
    bool? isMandatory,
    num? expiryDays,
    num? renewalReminderDays,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return RequiredDocumentModel(
      id: id ?? this.id,
      documentId: documentId ?? this.documentId,
      document: document ?? this.document,
      serviceType: serviceType ?? this.serviceType,
      isMandatory: isMandatory ?? this.isMandatory,
      expiryDays: expiryDays ?? this.expiryDays,
      renewalReminderDays: renewalReminderDays ?? this.renewalReminderDays,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory RequiredDocumentModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return RequiredDocumentModel(
      id: map['id']?.toString() ?? "",
      documentId: map['documentId']?.toString() ?? "",
      document: map['document'] == null
          ? null
          : RequiredDocumentModelDocument.fromJson(map['document']),
      serviceType: map['serviceType']?.toString() ?? "",
      isMandatory: map['isMandatory'] == true,
      expiryDays: map['expiryDays'] == null
          ? null
          : num.tryParse(map['expiryDays'].toString()),
      renewalReminderDays: map['renewalReminderDays'] == null
          ? null
          : num.tryParse(map['renewalReminderDays'].toString()),
      notes: map['notes']?.toString(),
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
      'documentId': documentId,
      if (document != null) 'document': document?.toJson(),
      'serviceType': serviceType,
      'isMandatory': isMandatory,
      if (expiryDays != null) 'expiryDays': expiryDays,
      if (renewalReminderDays != null)
        'renewalReminderDays': renewalReminderDays,
      if (notes != null) 'notes': notes,
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'RequiredDocumentModel('
        'id: $id, '
        'documentId: $documentId, '
        'document: $document, '
        'serviceType: $serviceType, '
        'isMandatory: $isMandatory, '
        'expiryDays: $expiryDays, '
        'renewalReminderDays: $renewalReminderDays, '
        'notes: $notes, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is RequiredDocumentModel &&
        other.id == id &&
        other.documentId == documentId &&
        equality.equals(other.document, document) &&
        other.serviceType == serviceType &&
        other.isMandatory == isMandatory &&
        other.expiryDays == expiryDays &&
        other.renewalReminderDays == renewalReminderDays &&
        other.notes == notes &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      id,
      documentId,
      equality.hash(document),
      serviceType,
      isMandatory,
      expiryDays,
      renewalReminderDays,
      notes,
      createdAt,
      updatedAt,
    ]);
  }
}
