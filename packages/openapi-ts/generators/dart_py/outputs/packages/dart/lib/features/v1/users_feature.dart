import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riderescue_api/client/api/api_request.dart';
import 'package:riderescue_api/client/api/api_result.dart';
import 'package:riderescue_api/riderescue_api.dart';

class UsersFeature {
  UsersFeature(this.ref);

  final Ref ref;
  Future<ApiResult<ListUsersResponse>> listUsers({
    ListUsersQuery? query,
    ApiGetRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          GetRequest<ListUsersResponse>(
            endpoint: V1.users.listUsers,
            version: ApiVersion.v1,
            options: options,
            query: query?.toJson(),
            fromJson: (json) => ListUsersResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<CreateUserResponse>> createUser({
    required CreateUserBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PostRequest<CreateUserResponse>(
            endpoint: V1.users.createUser,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => CreateUserResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<GetCurrentUserResponse>> getCurrentUser({
    GetCurrentUserQuery? query,
    ApiGetRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          GetRequest<GetCurrentUserResponse>(
            endpoint: V1.users.getCurrentUser,
            version: ApiVersion.v1,
            options: options,
            query: query?.toJson(),
            fromJson: (json) => GetCurrentUserResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<UpdateCurrentUserResponse>> updateCurrentUser({
    required UpdateUserProfileBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PatchRequest<UpdateCurrentUserResponse>(
            endpoint: V1.users.updateCurrentUser,
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => UpdateCurrentUserResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<GetUserByIdResponse>> getUserById({
    required GetUserByIdParams params,
    GetUserByIdQuery? query,
    ApiGetRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          GetRequest<GetUserByIdResponse>(
            endpoint: V1.users.getUserById(params.userId),
            version: ApiVersion.v1,
            options: options,
            query: query?.toJson(),
            fromJson: (json) => GetUserByIdResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<AdminUpdateUserResponse>> adminUpdateUser({
    required AdminUpdateUserParams params,
    required AdminUpdateUserBody body,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          PatchRequest<AdminUpdateUserResponse>(
            endpoint: V1.users.adminUpdateUser(params.userId),
            version: ApiVersion.v1,
            options: options,
            body: body.toJson(),
            fromJson: (json) => AdminUpdateUserResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<DeleteUserResponse>> deleteUser({
    required DeleteUserParams params,
    ApiRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          DeleteRequest<DeleteUserResponse>(
            endpoint: V1.users.deleteUser(params.userId),
            version: ApiVersion.v1,
            options: options,
            fromJson: (json) => DeleteUserResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }

  Future<ApiResult<AdminGetUserByIdResponse>> adminGetUserById({
    required AdminGetUserByIdParams params,
    AdminGetUserByIdQuery? query,
    ApiGetRequestOptions? options,
  }) {
    return ref.read(apiProvider.notifier).send(
          GetRequest<AdminGetUserByIdResponse>(
            endpoint: V1.users.adminGetUserById(params.userId),
            version: ApiVersion.v1,
            options: options,
            query: query?.toJson(),
            fromJson: (json) => AdminGetUserByIdResponse.fromJson(
              Map<String, dynamic>.from((json as Map?) ?? {}),
            ),
          ),
        );
  }
}

final usersFeatureProvider = Provider<UsersFeature>((ref) {
  return UsersFeature(ref);
});
