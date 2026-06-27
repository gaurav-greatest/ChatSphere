import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { addIncomingMessage, updateEditedMessage, updateDeletedMessage, updateReactions } from '@/features/messages/messageSlice';
import { updateChatLastMessage, incrementUnreadCount } from '@/features/chat/chatSlice';
import { SOCKET_EVENTS } from '@chatsphere/shared';

export function useSocket() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    // ─── Socket Event Listeners ──────────────────────────────
    
    // New incoming message
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, (message: any) => {
      dispatch(addIncomingMessage(message));
      dispatch(updateChatLastMessage({ chatId: message.chatId, message }));
      dispatch(incrementUnreadCount(message.chatId));
    });

    // Message edited
    socket.on(SOCKET_EVENTS.MESSAGE_EDITED, (message: any) => {
      dispatch(updateEditedMessage(message));
    });

    // Message deleted
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, (data: { messageId: string; chatId: string }) => {
      dispatch(updateDeletedMessage(data));
    });

    // Reaction added/updated
    socket.on(SOCKET_EVENTS.REACTION_ADDED, (data: { messageId: string; chatId: string; reactions: any[] }) => {
      dispatch(updateReactions(data));
    });

    // Reaction removed
    socket.on(SOCKET_EVENTS.REACTION_REMOVED, (data: { messageId: string; chatId: string; reactions: any[] }) => {
      dispatch(updateReactions(data));
    });

    return () => {
      // Off listeners on unmount to avoid duplicate listeners when hook re-renders
      socket.off(SOCKET_EVENTS.MESSAGE_NEW);
      socket.off(SOCKET_EVENTS.MESSAGE_EDITED);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED);
      socket.off(SOCKET_EVENTS.REACTION_ADDED);
      socket.off(SOCKET_EVENTS.REACTION_REMOVED);
    };
  }, [isAuthenticated, accessToken, dispatch]);

  return getSocket();
}
