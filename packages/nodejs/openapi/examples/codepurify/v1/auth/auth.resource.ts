import { HttpMethod } from 'codepot-openapi';
import { z } from 'zod';
import { sharedContract } from '../_global/shared.contract.js';
import { userContract } from '../users/user.resource.js';
import { v1 } from '../_global/version.contract.js';

const AuthNextStep = ['signup', 'login', 'verify-email', 'reset-password'] as const;

const auth = v1.defineResource({
  name: 'Auth',
  route: '/auth',
  folders: ['platform', 'auth'],
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

auth.defineRoutes({
  routes: {
    resolveEmail: {
      method: HttpMethod.post,
      path: '/resolve-email',
      summary: 'Resolve email',
      body: authBodies.ref.ResolveEmailBody,
      response: authResponses.ref.ResolveEmailOk,
    },

    signup: {
      method: HttpMethod.post,
      path: '/signup',
      summary: 'Sign up',
      body: authBodies.ref.SignupBody,
      responses: {
        201: authResponses.ref.SignupOk,
        409: authResponses.ref.Conflict,
      },
    },

    login: {
      method: HttpMethod.post,
      path: '/login',
      summary: 'Login',
      body: authBodies.ref.LoginBody,
      responses: {
        200: authResponses.ref.AuthSessionOk,
        401: sharedContract.sharedSchemas.ref.ApiMessage,
      },
    },

    adminLogin: {
      method: HttpMethod.post,
      path: '/admin/login',
      summary: 'Admin login',
      body: authBodies.ref.AdminLoginBody,
      responses: {
        200: authResponses.ref.AuthSessionOk,
        401: sharedContract.sharedSchemas.ref.ApiMessage,
        403: sharedContract.sharedSchemas.ref.ApiMessage,
      },
    },

    googleSignIn: {
      method: HttpMethod.post,
      path: '/google',
      summary: 'Google sign-in',
      body: authBodies.ref.GoogleSignInBody,
      responses: {
        200: authResponses.ref.AuthSessionOk,
        401: sharedContract.sharedSchemas.ref.ApiMessage,
      },
    },

    verifyEmail: {
      method: HttpMethod.post,
      path: '/verify-email',
      summary: 'Verify email',
      body: authBodies.ref.VerifyEmailBody,
      response: sharedContract.sharedSchemas.ref.ApiMessage,
    },

    resendVerificationEmail: {
      method: HttpMethod.post,
      path: '/resend-verification-email',
      summary: 'Resend verification email',
      body: authBodies.ref.ResendVerificationEmailBody,
      response: sharedContract.sharedSchemas.ref.ApiMessage,
    },

    forgotPassword: {
      method: HttpMethod.post,
      path: '/forgot-password',
      summary: 'Forgot password',
      body: authBodies.ref.ForgotPasswordBody,
      response: sharedContract.sharedSchemas.ref.ApiMessage,
    },

    resetPassword: {
      method: HttpMethod.post,
      path: '/reset-password',
      summary: 'Reset password',
      body: authBodies.ref.ResetPasswordBody,
      response: sharedContract.sharedSchemas.ref.ApiMessage,
    },

    changePassword: {
      method: HttpMethod.put,
      path: '/change-password',
      summary: 'Change password',
      body: authBodies.ref.ChangePasswordBody,
      response: sharedContract.sharedSchemas.ref.ApiMessage,
    },
  },
});

export const authContract = {
  auth,
  authFields,
  authBodies,
  authResponses,
};
