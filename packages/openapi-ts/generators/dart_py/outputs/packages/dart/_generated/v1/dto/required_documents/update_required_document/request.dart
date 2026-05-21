class UpdateRequiredDocumentRequest {
  final String? documentId;
  final String? serviceType;
  final bool? isMandatory;
  final num? expiryDays;
  final num? renewalReminderDays;
  final String? notes;

  const UpdateRequiredDocumentRequest({
    this.documentId,
    this.serviceType,
    this.isMandatory,
    this.expiryDays,
    this.renewalReminderDays,
    this.notes,
  });

  factory UpdateRequiredDocumentRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateRequiredDocumentRequest(
      documentId: map['documentId']?.toString(),
      serviceType: map['serviceType']?.toString(),
      isMandatory:
          map['isMandatory'] == null ? null : map['isMandatory'] == true,
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
      if (documentId != null) 'documentId': documentId,
      if (serviceType != null) 'serviceType': serviceType,
      if (isMandatory != null) 'isMandatory': isMandatory,
      if (expiryDays != null) 'expiryDays': expiryDays,
      if (renewalReminderDays != null)
        'renewalReminderDays': renewalReminderDays,
      if (notes != null) 'notes': notes,
    };
  }
}
