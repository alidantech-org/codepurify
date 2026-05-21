class RequiredDocumentModelDocumentMeta {
  final bool? expiryRequired;
  final num? maxExpiryDays;
  final num? renewalReminderDays;
  final String? issuingAuthority;
  final String? templateUrl;

  const RequiredDocumentModelDocumentMeta({
    this.expiryRequired,
    this.maxExpiryDays,
    this.renewalReminderDays,
    this.issuingAuthority,
    this.templateUrl,
  });

  RequiredDocumentModelDocumentMeta copyWith({
    bool? expiryRequired,
    num? maxExpiryDays,
    num? renewalReminderDays,
    String? issuingAuthority,
    String? templateUrl,
  }) {
    return RequiredDocumentModelDocumentMeta(
      expiryRequired: expiryRequired ?? this.expiryRequired,
      maxExpiryDays: maxExpiryDays ?? this.maxExpiryDays,
      renewalReminderDays: renewalReminderDays ?? this.renewalReminderDays,
      issuingAuthority: issuingAuthority ?? this.issuingAuthority,
      templateUrl: templateUrl ?? this.templateUrl,
    );
  }

  factory RequiredDocumentModelDocumentMeta.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return RequiredDocumentModelDocumentMeta(
      expiryRequired:
          map['expiryRequired'] == null ? null : map['expiryRequired'] == true,
      maxExpiryDays: map['maxExpiryDays'] == null
          ? null
          : num.tryParse(map['maxExpiryDays'].toString()),
      renewalReminderDays: map['renewalReminderDays'] == null
          ? null
          : num.tryParse(map['renewalReminderDays'].toString()),
      issuingAuthority: map['issuingAuthority']?.toString(),
      templateUrl: map['templateUrl']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (expiryRequired != null) 'expiryRequired': expiryRequired,
      if (maxExpiryDays != null) 'maxExpiryDays': maxExpiryDays,
      if (renewalReminderDays != null)
        'renewalReminderDays': renewalReminderDays,
      if (issuingAuthority != null) 'issuingAuthority': issuingAuthority,
      if (templateUrl != null) 'templateUrl': templateUrl,
    };
  }

  @override
  String toString() {
    return 'RequiredDocumentModelDocumentMeta('
        'expiryRequired: $expiryRequired, '
        'maxExpiryDays: $maxExpiryDays, '
        'renewalReminderDays: $renewalReminderDays, '
        'issuingAuthority: $issuingAuthority, '
        'templateUrl: $templateUrl'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is RequiredDocumentModelDocumentMeta &&
        other.expiryRequired == expiryRequired &&
        other.maxExpiryDays == maxExpiryDays &&
        other.renewalReminderDays == renewalReminderDays &&
        other.issuingAuthority == issuingAuthority &&
        other.templateUrl == templateUrl;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      expiryRequired,
      maxExpiryDays,
      renewalReminderDays,
      issuingAuthority,
      templateUrl,
    ]);
  }
}
