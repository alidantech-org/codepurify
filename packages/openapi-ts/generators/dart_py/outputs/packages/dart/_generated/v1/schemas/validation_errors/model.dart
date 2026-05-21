import 'package:collection/collection.dart';

class ValidationErrors {
  final List<String> form;
  final Map<String, List<String>> fields;

  const ValidationErrors({
    required this.form,
    required this.fields,
  });

  ValidationErrors copyWith({
    List<String>? form,
    Map<String, List<String>>? fields,
  }) {
    return ValidationErrors(
      form: form ?? this.form,
      fields: fields ?? this.fields,
    );
  }

  factory ValidationErrors.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return ValidationErrors(
      form: ((map['form'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      fields: Map<String, List<String>>.from((map['fields'] as Map?) ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'form': form,
      'fields': fields,
    };
  }

  @override
  String toString() {
    return 'ValidationErrors('
        'form: $form, '
        'fields: $fields'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is ValidationErrors &&
        equality.equals(other.form, form) &&
        equality.equals(other.fields, fields);
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      equality.hash(form),
      equality.hash(fields),
    ]);
  }
}
