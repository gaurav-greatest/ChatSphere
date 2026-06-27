import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import type { IMessageDocument } from '../models/message.model.js';
import Chat from '../models/chat.model.js';
import { ApiError } from '../utils/api-error.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';
import { MessageType } from '@chatsphere/shared';

// ─── Send Message ───────────────────────────────────────────
export const sendMessage = async (
  senderId: string,
  chatId: string,
  payload: {
    content?: string;
    type?: MessageType;
    attachments?: any[];
    replyTo?: string;
  },
): Promise<IMessageDocument> => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw ApiError.notFound(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  // Verify sender is member of the chat
  const senderObjectId = new mongoose.Types.ObjectId(senderId);
  if (!chat.members.includes(senderObjectId)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
  }

  // Create message
  const message = await Message.create({
    chatId: new mongoose.Types.ObjectId(chatId),
    sender: senderObjectId,
    content: payload.content || '',
    type: payload.type || MessageType.TEXT,
    attachments: payload.attachments || [],
    replyTo: payload.replyTo ? new mongoose.Types.ObjectId(payload.replyTo) : undefined,
    deliveredTo: [senderObjectId], // Delivered to sender initially
  });

  // Update chat's lastMessage reference
  chat.lastMessage = message._id;
  await chat.save();

  // Populate sender info for the client
  await message.populate('sender', 'displayName username avatar');
  if (message.replyTo) {
    await message.populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'displayName username' },
    });
  }

  return message;
};

// ─── Get Chat Messages (Paginated) ──────────────────────────
export const getChatMessages = async (
  chatId: string,
  userId: string,
  page: number,
  limit: number,
): Promise<{ messages: IMessageDocument[]; total: number }> => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw ApiError.notFound(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  if (!chat.members.includes(userIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
  }

  const filter = { chatId: new mongoose.Types.ObjectId(chatId) };

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .populate('sender', 'displayName username avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'displayName username' },
      })
      .sort({ createdAt: -1 }) // Get newest first, client will reverse for display
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    Message.countDocuments(filter),
  ]);

  return { messages, total };
};

// ─── Edit Message ───────────────────────────────────────────
export const editMessage = async (
  messageId: string,
  userId: string,
  newContent: string,
): Promise<IMessageDocument> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw ApiError.notFound(ERROR_MESSAGES.MESSAGE_NOT_FOUND);
  }

  if (message.sender.toString() !== userId) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_MESSAGE_SENDER);
  }

  if (message.isDeleted) {
    throw ApiError.badRequest('Cannot edit a deleted message');
  }

  // Check if message is editable (e.g. within 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (message.createdAt < twentyFourHoursAgo) {
    throw ApiError.badRequest(ERROR_MESSAGES.MESSAGE_TOO_OLD);
  }

  message.content = newContent;
  message.editedAt = new Date();
  await message.save();

  await message.populate('sender', 'displayName username avatar');
  return message;
};

// ─── Delete Message (Soft Delete) ───────────────────────────
export const deleteMessage = async (messageId: string, userId: string): Promise<IMessageDocument> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw ApiError.notFound(ERROR_MESSAGES.MESSAGE_NOT_FOUND);
  }

  if (message.sender.toString() !== userId) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_MESSAGE_SENDER);
  }

  message.content = 'This message was deleted';
  message.isDeleted = true;
  message.deletedAt = new Date();
  message.attachments = [];
  await message.save();

  await message.populate('sender', 'displayName username avatar');
  return message;
};

// ─── React to Message ───────────────────────────────────────
export const reactToMessage = async (
  messageId: string,
  userId: string,
  emoji: string,
): Promise<IMessageDocument> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw ApiError.notFound(ERROR_MESSAGES.MESSAGE_NOT_FOUND);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);

  // Check if chat exists and user is member of chat
  const chat = await Chat.findById(message.chatId);
  if (!chat || !chat.members.includes(userIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
  }

  // Remove existing reaction by same user if any
  message.reactions = message.reactions.filter((r) => r.userId.toString() !== userId);

  // Add new reaction
  message.reactions.push({
    emoji,
    userId: userIdObj,
    createdAt: new Date(),
  });

  await message.save();
  await message.populate('sender', 'displayName username avatar');
  return message;
};

// ─── Remove Reaction ────────────────────────────────────────
export const removeReaction = async (messageId: string, userId: string): Promise<IMessageDocument> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw ApiError.notFound(ERROR_MESSAGES.MESSAGE_NOT_FOUND);
  }

  message.reactions = message.reactions.filter((r) => r.userId.toString() !== userId);
  await message.save();

  await message.populate('sender', 'displayName username avatar');
  return message;
};

// ─── Toggle Pin Message ─────────────────────────────────────
export const togglePinMessage = async (messageId: string, userId: string): Promise<{ isPinned: boolean }> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw ApiError.notFound(ERROR_MESSAGES.MESSAGE_NOT_FOUND);
  }

  const chat = await Chat.findById(message.chatId);
  if (!chat) {
    throw ApiError.notFound(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  if (!chat.members.includes(userIdObj)) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
  }

  // If group chat, only admin can pin/unpin
  if (chat.type === 'group' && !chat.admins.includes(userIdObj)) {
    throw ApiError.forbidden('Only admins can pin messages in groups');
  }

  const messageIdObj = message._id;
  const pinIndex = chat.pinnedMessages.indexOf(messageIdObj);
  let isPinned = false;

  if (pinIndex === -1) {
    chat.pinnedMessages.push(messageIdObj);
    isPinned = true;
  } else {
    chat.pinnedMessages.splice(pinIndex, 1);
  }

  await chat.save();
  return { isPinned };
};

// ─── Forward Messages ───────────────────────────────────────
export const forwardMessages = async (
  senderId: string,
  messageIds: string[],
  targetChatIds: string[],
): Promise<IMessageDocument[]> => {
  const senderObjectId = new mongoose.Types.ObjectId(senderId);

  // Validate all target chats exist and sender is member of all of them
  const chats = await Chat.find({ _id: { $in: targetChatIds } });
  if (chats.length !== targetChatIds.length) {
    throw ApiError.notFound('One or more target chats not found');
  }

  chats.forEach((chat) => {
    if (!chat.members.includes(senderObjectId)) {
      throw ApiError.forbidden(`You are not a member of chat: ${chat._id}`);
    }
  });

  // Fetch original messages to forward
  const originalMessages = await Message.find({ _id: { $in: messageIds }, isDeleted: false });
  if (originalMessages.length === 0) {
    throw ApiError.notFound('No forwardable messages found');
  }

  const newMessages: any[] = [];

  for (const originalMsg of originalMessages) {
    for (const targetChatId of targetChatIds) {
      newMessages.push({
        chatId: new mongoose.Types.ObjectId(targetChatId),
        sender: senderObjectId,
        content: originalMsg.content,
        type: originalMsg.type,
        attachments: originalMsg.attachments,
        forwardedFrom: originalMsg._id,
        deliveredTo: [senderObjectId],
      });
    }
  }

  // Bulk insert new messages
  const createdMessages = (await Message.insertMany(newMessages)) as unknown as IMessageDocument[];

  // Update lastMessage on each target chat
  for (const chat of chats) {
    const chatMsgs = createdMessages.filter((m) => m.chatId.toString() === chat._id.toString());
    if (chatMsgs.length > 0) {
      // Find the last one
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      chat.lastMessage = lastMsg?._id;
      await chat.save();
    }
  }

  return createdMessages;
};

// ─── Search Messages ────────────────────────────────────────
export const searchMessages = async (
  userId: string,
  query: string,
  chatId?: string,
): Promise<IMessageDocument[]> => {
  const userIdObj = new mongoose.Types.ObjectId(userId);
  const searchRegex = new RegExp(query, 'i');

  const filter: any = {
    content: searchRegex,
    isDeleted: false,
  };

  if (chatId) {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.members.includes(userIdObj)) {
      throw ApiError.forbidden(ERROR_MESSAGES.NOT_CHAT_MEMBER);
    }
    filter.chatId = new mongoose.Types.ObjectId(chatId);
  } else {
    // Search across all chats the user is member of
    const userChats = await Chat.find({ members: userIdObj }).select('_id');
    const chatIds = userChats.map((c) => c._id);
    filter.chatId = { $in: chatIds };
  }

  const messages = await Message.find(filter)
    .populate('sender', 'displayName username avatar')
    .sort({ createdAt: -1 })
    .limit(100) // Caps search results at 100 for performance
    .exec();

  return messages;
};
