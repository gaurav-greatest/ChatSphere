import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchChats, setActiveChatId, clearUnreadCount } from '@/features/chat/chatSlice';
import Avatar from '../ui/Avatar';
import { formatChatListTime } from '@/utils/formatDate';
import { Search, VolumeX, Archive, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChatListProps {
  onSelectChat?: () => void;
}

export default function ChatList({ onSelectChat }: ChatListProps) {
  const dispatch = useAppDispatch();
  const { chats, activeChatId, isLoading } = useAppSelector((state) => state.chat);
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'direct' | 'group' | 'archived'>('all');

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleChatSelect = (chatId: string) => {
    dispatch(setActiveChatId(chatId));
    dispatch(clearUnreadCount(chatId));
    if (onSelectChat) onSelectChat();
  };

  const getChatMetadata = (chat: any) => {
    if (chat.type === 'direct') {
      const otherMember = chat.members.find((m: any) => m._id !== currentUser?._id);
      return {
        name: otherMember?.displayName || otherMember?.username || 'Unknown User',
        avatar: otherMember?.avatar,
        isOnline: otherMember?.isOnline,
      };
    }
    return {
      name: chat.groupName || 'Unnamed Group',
      avatar: chat.groupAvatar,
      isOnline: undefined,
    };
  };

  const filteredChats = chats.filter((chat) => {
    const meta = getChatMetadata(chat);
    const matchesSearch = meta.name.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'archived') return chat.isArchived;
    if (chat.isArchived) return false; // Hide archived in regular filters

    if (filter === 'direct') return chat.type === 'direct';
    if (filter === 'group') return chat.type === 'group';
    
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-surface-900 border-r border-surface-800">
      {/* ─── Search bar ────────────────────────────────────────── */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* ─── Filters tabs ──────────────────────────────────────── */}
      <div className="flex px-4 gap-2 mb-3">
        {(['all', 'direct', 'group', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors',
              filter === tab
                ? 'bg-primary-600 text-white'
                : 'bg-surface-850 hover:bg-surface-800 text-surface-300',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Chat Items List ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {isLoading && chats.length === 0 ? (
          // Skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 select-none">
              <div className="w-12 h-12 rounded-full skeleton shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-2/3 skeleton" />
                <div className="h-3 w-5/6 skeleton" />
              </div>
            </div>
          ))
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12 text-surface-300 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-sm">No chats found</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const meta = getChatMetadata(chat);
            const isActive = chat._id === activeChatId;
            const hasUnread = chat.unreadCount && chat.unreadCount > 0;

            return (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat._id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors border-l-3',
                  isActive
                    ? 'bg-surface-800 border-primary-500'
                    : 'hover:bg-surface-850/50 border-transparent',
                )}
              >
                <Avatar src={meta.avatar} name={meta.name} isOnline={meta.isOnline} size="lg" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn('text-sm font-semibold truncate', hasUnread ? 'text-white font-bold' : 'text-surface-100')}>
                      {meta.name}
                    </h3>
                    <span className="text-xxs text-surface-300 whitespace-nowrap">
                      {chat.lastMessage ? formatChatListTime(chat.lastMessage.createdAt) : formatChatListTime(chat.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={cn('text-xs truncate mr-2', hasUnread ? 'text-surface-100 font-medium' : 'text-surface-300')}>
                      {(chat.lastMessage as any) ? (
                        <>
                          {(chat.lastMessage as any).sender?._id === currentUser?._id ? (
                            <span className="text-primary-400">You: </span>
                          ) : (
                            chat.type === 'group' && <span className="text-accent-400">{(chat.lastMessage as any).sender?.displayName || (chat.lastMessage as any).sender?.username}: </span>
                          )}
                          {(chat.lastMessage as any).content}
                        </>
                      ) : (
                        <span className="italic">No messages yet</span>
                      )}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.isMuted && <VolumeX className="w-3.5 h-3.5 text-surface-300" />}
                      {chat.isArchived && <Archive className="w-3.5 h-3.5 text-surface-300" />}
                      {hasUnread && (
                        <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
