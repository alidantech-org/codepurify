// // ============================================================================
// // SECURITY
// // ============================================================================

// import { defineCodepotConfig } from '@/contract';
// import { v1, user, enums, dtos, post, tag, params, profile } from './demo.contract';

// const security = v1.defineSecurity();

// const schemes = security.defineSchemes({
//   bearer: security.scheme.bearerJwt(),
// });

// const auth = security.defineAuth({
//   jwt: security.auth.any([security.auth.scheme(schemes.ref.bearer)]),
// });

// const roleSources = security.defineRoleSources({
//   userRole: security.roleSource.entityField(user.ref.fields.role, enums.ref.UserRole),
// });

// const roleSets = security.defineRoleSets({
//   admins: security.roleSet.values(roleSources.ref.userRole, ['admin']),
//   members: security.roleSet.values(roleSources.ref.userRole, ['member']),
// });

// // ============================================================================
// // TRANSPORT
// // ============================================================================

// const transport = v1.defineTransport();

// const contentTypes = transport.defineContentTypes({
//   json: transport.contentType.json(),
// });

// const requests = transport.defineRequests({
//   UpdateProfileRequest: transport.request.json(dtos.ref.UpdateProfileBody),
// });

// const responses = transport.defineResponses({
//   BadRequest: transport.response.json(400, dtos.ref.ErrorResponse),
//   Unauthorized: transport.response.json(401, dtos.ref.ErrorResponse),
//   Forbidden: transport.response.json(403, dtos.ref.ErrorResponse),
//   NotFound: transport.response.json(404, dtos.ref.ErrorResponse),
//   UserResponse: transport.response.json(200, user.ref.models.read),
//   UserListResponse: transport.response.json(200, user.ref.models.read.array()),
//   ProfileResponse: transport.response.json(200, profile.ref.models.public),
//   PostResponse: transport.response.json(200, post.ref.models.read),
//   PostListResponse: transport.response.json(200, post.ref.models.summary.array()),
//   TagListResponse: transport.response.json(200, tag.ref.models.option.array()),
// });

// transport.setDefaults({
//   requestContentType: contentTypes.ref.json,
//   responseContentType: contentTypes.ref.json,
//   responses: {
//     400: responses.ref.BadRequest,
//     401: responses.ref.Unauthorized,
//     403: responses.ref.Forbidden,
//     404: responses.ref.NotFound,
//   },
// });

// // ============================================================================
// // RESOURCES
// // ============================================================================

// const users = v1.defineResource({
//   key: 'users',
//   folders: ['platform', 'auth'],
//   security: security.route.protected({
//     auth: auth.ref.jwt,
//   }),
// });

// users.defineRoutes().define((route) => ({
//   listUsers: route
//     .get('/')
//     .query(user.ref.models.query)
//     .security(
//       security.route.roles([roleSets.ref.admins], {
//         auth: auth.ref.jwt,
//       }),
//     )
//     .responses({
//       200: responses.ref.UserListResponse,
//       401: responses.ref.Unauthorized,
//       403: responses.ref.Forbidden,
//     }),

//   getUser: route.get('/:id').params(params).responses({
//     200: responses.ref.UserResponse,
//     401: responses.ref.Unauthorized,
//     404: responses.ref.NotFound,
//   }),

//   updateProfile: route
//     .patch('/me')
//     .body(requests.ref.UpdateProfileRequest)
//     .security(
//       security.route.roles([roleSets.ref.members], {
//         auth: auth.ref.jwt,
//       }),
//     )
//     .responses({
//       200: responses.ref.UserResponse,
//       400: responses.ref.BadRequest,
//       401: responses.ref.Unauthorized,
//     }),

//   publicProfile: route
//     .get('/public/:id')
//     .security(security.route.public())
//     .params(params)
//     .responses({
//       200: route.response.json(user.ref.models.public),
//       404: responses.ref.NotFound,
//     }),
// }));

// const posts = v1.defineResource({
//   key: 'posts',
//   folders: ['platform', 'content'],
//   security: security.route.protected({
//     auth: auth.ref.jwt,
//   }),
// });

// posts.defineRoutes().define((route) => ({
//   listPosts: route.get('/').query(post.ref.models.query).responses({
//     200: responses.ref.PostListResponse,
//     401: responses.ref.Unauthorized,
//   }),

//   getPost: route.get('/:id').params(params).responses({
//     200: responses.ref.PostResponse,
//     404: responses.ref.NotFound,
//   }),

//   listTags: route.get('/tags').security(security.route.public()).responses({
//     200: responses.ref.TagListResponse,
//   }),
// }));

// // ============================================================================
// // EXPORT
// // ============================================================================

// export const demoVersion = v1;

// export const demoConfig = defineCodepotConfig({
//   contracts: [v1],
//   output: { folder: 'tests/generated/debug', baseName: 'demo', formats: ['json', 'yaml'] },
// });

// export default demoConfig;
