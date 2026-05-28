export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
  SERVICE_PROVIDER = 'service_provider',
  DRIVER = 'driver',
}

export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number] | null;
}

export interface IUser {
  readonly id: string;

  name: string;
  email: string;
  password: string;

  status: UserStatus;
  roles: UserRoles[];

  phone: string | null;
  avatar: string | null;
  address: string | null;

  location: IGeoLocation | null;

  isOnline: boolean;

  emailVerified: boolean;

  emailVerificationOtp: string | null;
  emailVerificationOtpExpires: Date | null;

  resetPasswordOtp: string | null;
  resetPasswordOtpExpires: Date | null;

  passwordChangedAt: Date | null;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  isModified(arg0: string): unknown;
}
