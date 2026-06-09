import { z } from 'zod';
import { sharedContract } from '../_global/shared.contract.js';
import { userContract } from '../users/user.resource.js';
import { v1 } from '../_global/version.contract.js';

const AuthNextStep = ['signup', 'login', 'verify-email', 'reset-password'] as const;

const auth = v1.defineResource({
  name: 'auth',
  route: 'v1/auth',
  folders: ['platform'],
  ui: {
    enabled: true,
    infer: false,
  },
});

const authFields = auth.defineProperties('AuthFields', {
  nextStep: z.enum(AuthNextStep),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  currentPassword: z.string().min(1),
  otp: z.string().length(6),
  idToken: z.string().min(1),
  token: z.string().min(1),
});

const authBodies = auth.defineSchemas({
  ResolveEmailBody: {
    email: userContract.userProps.ref.email,
  },

  SignupBody: {
    email: userContract.userProps.ref.email,
    password: authFields.ref.password,
    confirmPassword: authFields.ref.confirmPassword,
    name: userContract.userProps.ref.name,
    phone: userContract.userProps.ref.phone.optional().nullable(),
    avatar: userContract.userProps.ref.avatar.optional().nullable(),
  },

  LoginBody: {
    email: userContract.userProps.ref.email,
    password: authFields.ref.password,
  },

  AdminLoginBody: {
    email: userContract.userProps.ref.email,
    password: authFields.ref.password,
  },

  GoogleSignInBody: {
    idToken: authFields.ref.idToken,
  },

  VerifyEmailBody: {
    email: userContract.userProps.ref.email,
    otp: authFields.ref.otp,
  },

  ResendVerificationEmailBody: {
    email: userContract.userProps.ref.email,
  },

  ForgotPasswordBody: {
    email: userContract.userProps.ref.email,
  },

  ResetPasswordBody: {
    email: userContract.userProps.ref.email,
    otp: authFields.ref.otp,
    newPassword: authFields.ref.newPassword,
    confirmPassword: authFields.ref.confirmPassword,
  },

  ChangePasswordBody: {
    currentPassword: authFields.ref.currentPassword,
    newPassword: authFields.ref.newPassword,
    confirmPassword: authFields.ref.confirmPassword,
  },
});

const authResponses = auth.defineSchemas({
  ResolveEmailOk: sharedContract.sharedSchemas.ref.ApiMessage.extendWith({
    email: userContract.userProps.ref.email,
    nextStep: authFields.ref.nextStep,
  }),

  SignupOk: sharedContract.sharedSchemas.ref.ApiMessage.extendWith({
    user: userContract.userPublicSchemas.ref.UserPublic,
    token: authFields.ref.token,
  }),

  AuthSessionOk: sharedContract.sharedSchemas.ref.ApiMessage.extendWith({
    user: userContract.userPublicSchemas.ref.UserPublic,
    token: authFields.ref.token,
  }),

  Conflict: sharedContract.sharedSchemas.ref.ApiMessage,
});

auth.defineRoutes((r) =>
  r
    .post('/resolve-email', 'resolveEmail')
    .summary('Resolve email')
    .body(authBodies.ref.ResolveEmailBody)
    .response(authResponses.ref.ResolveEmailOk)
    .ui('auth')
    .done()

    .post('/signup', 'signup')
    .summary('Sign up')
    .body(authBodies.ref.SignupBody)
    .on(201, authResponses.ref.SignupOk)
    .on(409, authResponses.ref.Conflict)
    .ui('auth')
    .done()

    .post('/login', 'login')
    .summary('Login')
    .body(authBodies.ref.LoginBody)
    .on(200, authResponses.ref.AuthSessionOk)
    .on(401, sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('auth')
    .done()

    .post('/admin/login', 'adminLogin')
    .summary('Admin login')
    .body(authBodies.ref.AdminLoginBody)
    .on(200, authResponses.ref.AuthSessionOk)
    .on(401, sharedContract.sharedSchemas.ref.ApiMessage)
    .on(403, sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('auth')
    .done()

    .post('/google', 'googleSignIn')
    .summary('Google sign-in')
    .body(authBodies.ref.GoogleSignInBody)
    .on(200, authResponses.ref.AuthSessionOk)
    .on(401, sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('auth')
    .done()

    .post('/verify-email', 'verifyEmail')
    .summary('Verify email')
    .body(authBodies.ref.VerifyEmailBody)
    .response(sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('auth')
    .done()

    .post('/resend-verification-email', 'resendVerificationEmail')
    .summary('Resend verification email')
    .body(authBodies.ref.ResendVerificationEmailBody)
    .response(sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('auth')
    .done()

    .post('/forgot-password', 'forgotPassword')
    .summary('Forgot password')
    .body(authBodies.ref.ForgotPasswordBody)
    .response(sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('auth')
    .done()

    .post('/reset-password', 'resetPassword')
    .summary('Reset password')
    .body(authBodies.ref.ResetPasswordBody)
    .response(sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('auth')
    .done()

    .put('/change-password', 'changePassword')
    .summary('Change password')
    .body(authBodies.ref.ChangePasswordBody)
    .response(sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('update')
    .done(),
);

export const authContract = {
  auth,
  authFields,
  authBodies,
  authResponses,
};
