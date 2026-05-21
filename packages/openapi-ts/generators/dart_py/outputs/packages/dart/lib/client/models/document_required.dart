// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

import 'document.dart';
import 'global.dart';

class RequiredDocumentMeta {
  final String? notes;
  final List<String>? conditions;
  final List<String>? exceptions;

  const RequiredDocumentMeta({
    this.notes,
    this.conditions,
    this.exceptions,
  });

  factory RequiredDocumentMeta.fromJson(Map<String, dynamic> json) {
    return RequiredDocumentMeta(
      notes: json['notes'],
      conditions: json['conditions'] == null
          ? null
          : List.from(json['conditions'] as List),
      exceptions: json['exceptions'] == null
          ? null
          : List.from(json['exceptions'] as List),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notes': notes,
      'conditions': conditions,
      'exceptions': exceptions,
    };
  }

  RequiredDocumentMeta copyWith({
    String? notes,
    List<String>? conditions,
    List<String>? exceptions,
  }) {
    return RequiredDocumentMeta(
      notes: notes ?? this.notes,
      conditions: conditions ?? this.conditions,
      exceptions: exceptions ?? this.exceptions,
    );
  }
}

class RequiredDocument {
  final String id;
  final String documentId;
  final ServiceType serviceType;
  final bool required;
  final int priority;
  final RequiredDocumentMeta meta;
  final bool isActive;
  final bool isVerified;
  final Document? document;
  final DateTime createdAt;
  final DateTime updatedAt;

  const RequiredDocument({
    required this.id,
    required this.documentId,
    required this.serviceType,
    required this.required,
    required this.priority,
    required this.meta,
    required this.isActive,
    required this.isVerified,
    this.document,
    required this.createdAt,
    required this.updatedAt,
  });

  factory RequiredDocument.fromJson(Map<String, dynamic> json) {
    return RequiredDocument(
      id: json['id'] ?? '',
      documentId: json['documentId'] ?? '',
      serviceType: ServiceType.fromJson(json['serviceType'] as String?) ??
          ServiceType.values.first,
      required: json['required'] ?? false,
      priority: json['priority'] ?? 0,
      meta: json['meta'] == null
          ? RequiredDocumentMeta.fromJson(<String, dynamic>{})
          : RequiredDocumentMeta.fromJson(
              Map<String, dynamic>.from(json['meta'] as Map)),
      isActive: json['isActive'] ?? false,
      isVerified: json['isVerified'] ?? false,
      document: json['document'] == null
          ? null
          : Document.fromJson(
              Map<String, dynamic>.from(json['document'] as Map)),
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
      'documentId': documentId,
      'serviceType': serviceType.toJson(),
      'required': required,
      'priority': priority,
      'meta': meta.toJson(),
      'isActive': isActive,
      'isVerified': isVerified,
      'document': document?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  RequiredDocument copyWith({
    String? id,
    String? documentId,
    ServiceType? serviceType,
    bool? required,
    int? priority,
    RequiredDocumentMeta? meta,
    bool? isActive,
    bool? isVerified,
    Document? document,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return RequiredDocument(
      id: id ?? this.id,
      documentId: documentId ?? this.documentId,
      serviceType: serviceType ?? this.serviceType,
      required: required ?? this.required,
      priority: priority ?? this.priority,
      meta: meta ?? this.meta,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      document: document ?? this.document,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
