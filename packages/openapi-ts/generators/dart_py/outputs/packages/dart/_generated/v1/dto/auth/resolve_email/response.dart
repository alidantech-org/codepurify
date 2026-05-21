class ResolveEmailResponse {
  final bool success;
  final String message;
  final String email;
  final String nextStep;

  const ResolveEmailResponse({
    required this.success,
    required this.message,
    required this.email,
    required this.nextStep,
  });

  factory ResolveEmailResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ResolveEmailResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      email: map['email']?.toString() ?? "",
      nextStep: map['nextStep']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'email': email,
      'nextStep': nextStep,
    };
  }
}
