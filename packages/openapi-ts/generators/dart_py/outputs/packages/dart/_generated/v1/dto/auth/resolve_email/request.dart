class ResolveEmailRequest {
  final String email;

  const ResolveEmailRequest({
    required this.email,
  });

  factory ResolveEmailRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ResolveEmailRequest(
      email: map['email']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'email': email,
    };
  }
}
