export interface IUser {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  statusMessage?: string;
  isOnline: boolean;
  lastSeen?: Date;
  isEmailVerified: boolean;
  provider: AuthProvider;
  privacySettings: IPrivacySettings;
  blockedUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrivacySettings {
  showLastSeen: 'everyone' | 'contacts' | 'nobody';
  showAvatar: 'everyone' | 'contacts' | 'nobody';
  showStatus: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
}

export interface IUserProfile {
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  statusMessage?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export type AuthProvider = 'local' | 'google';

export interface IUserSearchResult {
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isOnline: boolean;
}
