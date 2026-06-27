import User from '../models/user.model.js';
import type { IUserDocument } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';

export const updateProfile = async (
  userId: string,
  updateData: { displayName?: string; bio?: string; statusMessage?: string },
): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  if (updateData.displayName !== undefined) user.displayName = updateData.displayName;
  if (updateData.bio !== undefined) user.bio = updateData.bio;
  if (updateData.statusMessage !== undefined) user.statusMessage = updateData.statusMessage;

  await user.save();
  return user;
};

export const updatePrivacySettings = async (
  userId: string,
  privacySettings: {
    showLastSeen?: 'everyone' | 'contacts' | 'nobody';
    showAvatar?: 'everyone' | 'contacts' | 'nobody';
    showStatus?: 'everyone' | 'contacts' | 'nobody';
    readReceipts?: boolean;
  },
): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  user.privacySettings = {
    ...user.privacySettings,
    ...privacySettings,
  };

  await user.save();
  return user;
};

export const searchUsers = async (
  userId: string,
  query: string,
  page: number,
  limit: number,
): Promise<{ users: Partial<IUserDocument>[]; total: number }> => {
  const searchRegex = new RegExp(query, 'i');
  
  // Find users matching username/email/displayName excluding self
  const filter = {
    _id: { $ne: userId },
    $or: [
      { username: searchRegex },
      { displayName: searchRegex },
      { email: searchRegex },
    ],
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('username displayName avatar isOnline lastSeen')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { users: users as unknown as Partial<IUserDocument>[], total };
};

export const getUserById = async (userId: string, _requesterId: string): Promise<Record<string, any>> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Check privacy settings
  const isContact = true; // For now simplified, or can check if they share any direct chats
  const privacy = user.privacySettings;

  const showLastSeen =
    privacy.showLastSeen === 'everyone' ||
    (privacy.showLastSeen === 'contacts' && isContact);
  const showAvatar =
    privacy.showAvatar === 'everyone' ||
    (privacy.showAvatar === 'contacts' && isContact);
  const showStatus =
    privacy.showStatus === 'everyone' ||
    (privacy.showStatus === 'contacts' && isContact);

  return {
    _id: user._id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatar: showAvatar ? user.avatar : undefined,
    statusMessage: showStatus ? user.statusMessage : undefined,
    isOnline: user.isOnline,
    lastSeen: showLastSeen ? user.lastSeen : undefined,
  };
};

export const blockUser = async (userId: string, targetId: string): Promise<void> => {
  if (userId === targetId) {
    throw ApiError.badRequest('You cannot block yourself');
  }

  const [user, target] = await Promise.all([
    User.findById(userId),
    User.findById(targetId),
  ]);

  if (!user || !target) {
    throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Check if already blocked
  if (user.blockedUsers.includes(target._id)) {
    return;
  }

  user.blockedUsers.push(target._id);
  await user.save();
};

export const unblockUser = async (userId: string, targetId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  user.blockedUsers = user.blockedUsers.filter(
    (id) => id.toString() !== targetId,
  );
  
  await user.save();
};
