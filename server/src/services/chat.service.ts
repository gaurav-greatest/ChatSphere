import mongoose from 'mongoose';
import Chat from '../models/chat.model.js';
import type { IChatDocument } from '../models/chat.model.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';
import { ChatType } from '@chatsphere/shared';

// ─── Create or Get Direct Chat ──────────────────────────────
export const getOrCreateDirectChat = async (
  userId: string,
  recipientId: string,
): Promise<IChatDocument> => {
  if (userId === recipientId) {
    throw ApiError.badRequest(ERROR_MESSAGES.CANNOT_CHAT_SELF);
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw ApiError.notFound('Recipient user not found');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

  // Check if direct chat already exists
  let chat = await Chat.findOne({
    type: ChatType.DIRECT,
    members: { $all: [userObjectId, recipientObjectId], $size: 2 },
  });

  if (!chat) {
    chat = await Chat.create({
      type: ChatType.DIRECT,
      members: [userObjectId, recipientObjectId],
      admins: [userObjectId, recipientObjectId], // In direct chat, both are admins
      createdBy: userObjectId,
    });
  }

  return chat;
};

// ─── Get User's Chats (Paginated) ───────────────────────────
export const getUserChats = async (
  userId: string,
  page: number,
  limit: number,
): Promise<{ chats: any[]; total: number }> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const filter = { members: userObjectId };

  const [chats, total] = await Promise.all([
    Chat.find(filter)
      .populate('members', 'username displayName avatar isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'displayName username avatar',
        },
      })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Chat.countDocuments(filter),
  ]);

  // Map settings like unreadCount, isMuted, isArchived (caching will be plugged in Phase 7)
  const mappedChats = chats.map((chat: any) => {
    const archivedBy = chat.archivedBy || [];
    const mutedBy = chat.mutedBy || [];
    
    return {
      ...chat,
      isArchived: archivedBy.some((id: any) => id.toString() === userId),
      isMuted: mutedBy.some((id: any) => id.toString() === userId),
    };
  });

  return { chats: mappedChats, total };
};

// ─── Get Chat By ID ─────────────────────────────────────────
export const getChatById = async (chatId: string, userId: string): Promise<any> => {
  const chat = await Chat.findById(chatId)
    .populate('members', 'username displayName avatar isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'displayName username avatar',
      },
    })
    .lean();

  if (!chat) {
    throw ApiError.notFound(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  // Verify membership
  const memberIds = chat.members.map((m: any) => m._id.toString());
  if (!memberIds.includes(userId)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
  }

  return {
    ...chat,
    isArchived: (chat.archivedBy || []).some((id: any) => id.toString() === userId),
    isMuted: (chat.mutedBy || []).some((id: any) => id.toString() === userId),
  };
};

// ─── Delete or Leave Chat ───────────────────────────────────
export const deleteOrLeaveChat = async (chatId: string, userId: string): Promise<void> => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw ApiError.notFound(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  if (!chat.members.includes(userIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
  }

  if (chat.type === ChatType.DIRECT) {
    // For direct chats, we just delete the chat record entirely (or could soft archive)
    await chat.deleteOne();
  } else {
    // For group chats, leave the group
    chat.members = chat.members.filter((id) => id.toString() !== userId);
    chat.admins = chat.admins.filter((id) => id.toString() !== userId);

    if (chat.members.length === 0) {
      // Delete empty group
      await chat.deleteOne();
    } else {
      // If leaving user was the only admin, assign admin role to another user
      if (chat.admins.length === 0 && chat.members.length > 0) {
        chat.admins.push(chat.members[0]!);
      }
      await chat.save();
    }
  }
};

// ─── Archive / Unarchive Chat ───────────────────────────────
export const toggleArchiveChat = async (chatId: string, userId: string): Promise<boolean> => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw ApiError.notFound(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  if (!chat.members.includes(userIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
  }

  const index = chat.archivedBy.indexOf(userIdObj);
  let isArchived = false;

  if (index === -1) {
    chat.archivedBy.push(userIdObj);
    isArchived = true;
  } else {
    chat.archivedBy.splice(index, 1);
  }

  await chat.save();
  return isArchived;
};

// ─── Mute / Unmute Chat ─────────────────────────────────────
export const toggleMuteChat = async (chatId: string, userId: string): Promise<boolean> => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw ApiError.notFound(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  if (!chat.members.includes(userIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
  }

  const index = chat.mutedBy.indexOf(userIdObj);
  let isMuted = false;

  if (index === -1) {
    chat.mutedBy.push(userIdObj);
    isMuted = true;
  } else {
    chat.mutedBy.splice(index, 1);
  }

  await chat.save();
  return isMuted;
};

// ─── Create Group Chat ──────────────────────────────────────
export const createGroupChat = async (
  creatorId: string,
  groupName: string,
  memberIds: string[],
  groupDescription?: string,
): Promise<IChatDocument> => {
  const creatorObjectId = new mongoose.Types.ObjectId(creatorId);

  // Check unique member list including creator
  const uniqueMemberIds = Array.from(new Set([...memberIds, creatorId])).map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  if (uniqueMemberIds.length < 3) {
    throw ApiError.badRequest(ERROR_MESSAGES.MIN_GROUP_MEMBERS);
  }

  // Create group
  const group = await Chat.create({
    type: ChatType.GROUP,
    groupName,
    groupDescription,
    members: uniqueMemberIds,
    admins: [creatorObjectId],
    createdBy: creatorObjectId,
  });

  return group;
};

// ─── Update Group Details ───────────────────────────────────
export const updateGroupDetails = async (
  chatId: string,
  userId: string,
  updateData: { groupName?: string; groupDescription?: string; groupAvatar?: string },
): Promise<IChatDocument> => {
  const chat = await Chat.findById(chatId);
  if (!chat || chat.type !== ChatType.GROUP) {
    throw ApiError.notFound(ERROR_MESSAGES.GROUP_NOT_FOUND);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  if (!chat.admins.includes(userIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_GROUP_ADMIN);
  }

  if (updateData.groupName !== undefined) chat.groupName = updateData.groupName;
  if (updateData.groupDescription !== undefined) chat.groupDescription = updateData.groupDescription;
  if (updateData.groupAvatar !== undefined) chat.groupAvatar = updateData.groupAvatar;

  await chat.save();
  return chat;
};

// ─── Add Member to Group ────────────────────────────────────
export const addGroupMember = async (
  chatId: string,
  adminId: string,
  userIdToAdd: string,
): Promise<IChatDocument> => {
  const chat = await Chat.findById(chatId);
  if (!chat || chat.type !== ChatType.GROUP) {
    throw ApiError.notFound(ERROR_MESSAGES.GROUP_NOT_FOUND);
  }

  const adminIdObj = new mongoose.Types.ObjectId(adminId);
  if (!chat.admins.includes(adminIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_GROUP_ADMIN);
  }

  const memberIdObj = new mongoose.Types.ObjectId(userIdToAdd);
  if (chat.members.includes(memberIdObj)) {
    throw ApiError.badRequest(ERROR_MESSAGES.ALREADY_GROUP_MEMBER);
  }

  chat.members.push(memberIdObj);
  await chat.save();

  return chat;
};

// ─── Remove Member from Group ────────────────────────────────
export const removeGroupMember = async (
  chatId: string,
  adminId: string,
  userIdToRemove: string,
): Promise<IChatDocument> => {
  const chat = await Chat.findById(chatId);
  if (!chat || chat.type !== ChatType.GROUP) {
    throw ApiError.notFound(ERROR_MESSAGES.GROUP_NOT_FOUND);
  }

  const adminIdObj = new mongoose.Types.ObjectId(adminId);
  if (!chat.admins.includes(adminIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_GROUP_ADMIN);
  }

  const memberIdObj = new mongoose.Types.ObjectId(userIdToRemove);
  if (!chat.members.includes(memberIdObj)) {
    throw ApiError.badRequest(ERROR_MESSAGES.NOT_GROUP_MEMBER);
  }

  if (chat.createdBy.toString() === userIdToRemove) {
    throw ApiError.badRequest(ERROR_MESSAGES.CANNOT_REMOVE_CREATOR);
  }

  chat.members = chat.members.filter((id) => id.toString() !== userIdToRemove);
  chat.admins = chat.admins.filter((id) => id.toString() !== userIdToRemove);

  await chat.save();
  return chat;
};

// ─── Promote/Demote Group Admin ──────────────────────────────
export const updateGroupAdminRole = async (
  chatId: string,
  adminId: string,
  targetUserId: string,
  promote: boolean,
): Promise<IChatDocument> => {
  const chat = await Chat.findById(chatId);
  if (!chat || chat.type !== ChatType.GROUP) {
    throw ApiError.notFound(ERROR_MESSAGES.GROUP_NOT_FOUND);
  }

  const adminIdObj = new mongoose.Types.ObjectId(adminId);
  if (!chat.admins.includes(adminIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_GROUP_ADMIN);
  }

  const targetIdObj = new mongoose.Types.ObjectId(targetUserId);
  if (!chat.members.includes(targetIdObj)) {
    throw ApiError.badRequest(ERROR_MESSAGES.NOT_GROUP_MEMBER);
  }

  const index = chat.admins.indexOf(targetIdObj);

  if (promote && index === -1) {
    chat.admins.push(targetIdObj);
  } else if (!promote && index !== -1) {
    if (chat.createdBy.toString() === targetUserId) {
      throw ApiError.badRequest('Cannot demote the group creator');
    }
    chat.admins.splice(index, 1);
  }

  await chat.save();
  return chat;
};
