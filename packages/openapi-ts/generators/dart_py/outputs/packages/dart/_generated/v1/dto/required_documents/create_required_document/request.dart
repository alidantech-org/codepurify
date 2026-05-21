class CreateRequiredDocumentRequest {
  final String documentId;
  final String serviceType;
  final bool isMandatory;
  final num? expiryDays;
  final num? renewalReminderDays;
  final String? notes;

  const CreateRequiredDocumentRequest({
    required this.documentId,
    required this.serviceType,
    required this.isMandatory,
    this.expiryDays,
    this.renewalReminderDays,
    this.notes,
  });

  factory CreateRequiredDocumentRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateRequiredDocumentRequest(
      documentId: map['documentId']?.toString() ?? "",
      serviceType: map['serviceType']?.toString() ?? "",
      isMandatory: map['isMandatory'] == true,
      expiryDays: map['expiryDays'] == null
          ? null
          : num.tryParse(map['expiryDays'].toString()),
      renewalReminderDays: map['renewalReminderDays'] == null
          ? null
          : num.tryParse(map['renewalReminderDays'].toString()),
      notes: map['notes']?.toString(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'documentId': documentId,
      'serviceType': serviceType,
      'isMandatory': isMandatory,
      if (expiryDays != null) 'expiryDays': expiryDays,
      if (renewalReminderDays != null)
        'renewalReminderDays': renewalReminderDays,
      if (notes != null) 'notes': notes,
    };
  }
}
