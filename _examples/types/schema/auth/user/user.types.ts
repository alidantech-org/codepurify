/**
 * @file user.types.ts
 * @description Types for the User entity
 */

// shared types
import * as B from '../../../shared/base';
import * as C from '../../../shared/config';

// enums
import * as PlatformEnums from '../../../enums/platform';
import { IApp } from '../../platform/app';
import { EUserRole, EUserStatus } from '../../../enums/auth';

// //////////////////////////////////////////////////////////////////////////////
//  CORE INTERFACE
// //////////////////////////////////////////////////////////////////////////////

export interface IUser extends B.IBase {
  /*-------- Basic Info -------------*/
  email: string;
  username: string;
  firstName: string;
  lastName: string;

  /*-------- Flags ------------------*/
  isActive: boolean;
  isVerified: boolean;

  /*-------- Enums ------------------*/
  status: EUserStatus;
  role: EUserRole;

  /*-------- Dates -----------------*/
  lastLoginAt?: Date;
  passwordChangedAt?: Date;

  /*-------- Relations -------------*/
  readonly apps?: IApp[];
}

// //////////////////////////////////////////////////////////////////////////////
//  ROOT KEYS
// //////////////////////////////////////////////////////////////////////////////

export type UserKey = keyof IUser;
