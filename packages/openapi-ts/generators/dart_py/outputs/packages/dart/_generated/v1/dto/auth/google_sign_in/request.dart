class GoogleSignInRequest {
  final String idToken;

  const GoogleSignInRequest({
    required this.idToken,
  });

  factory GoogleSignInRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GoogleSignInRequest(
      idToken: map['idToken']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'idToken': idToken,
    };
  }
}
