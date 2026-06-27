import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMessages, sendNewMessage } from '@/features/messages/messageSlice';
import Avatar from '../ui/Avatar';
import { formatMessageTime } from '@/utils/formatDate';
import { Send, Smile, MoreVertical, Reply, Undo2, Check } from 'lucide-react';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { cn } from '@/utils/cn';

interface ChatWindowProps {
  onBack?: () => void;
  onShowDetails?: () => void;
}

export default function ChatWindow({ onBack, onShowDetails }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const activeChatId = useAppSelector((state) => state.chat.activeChatId);
  const chats = useAppSelector((state) => state.chat.chats);
  const messages = useAppSelector((state) => state.messages.messagesByChat[activeChatId || ''] || []);
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyMessage, setReplyMessage] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c._id === activeChatId);

  useEffect(() => {
    if (activeChatId) {
      dispatch(fetchMessages({ chatId: activeChatId, page: 1 }));
    }
  }, [activeChatId, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!activeChatId || !activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-950 text-surface-300 p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-surface-900 border border-surface-800 flex items-center justify-center mx-auto shadow-glow">
            <MessageSquareIcon className="w-10 h-10 text-primary-500 stroke-1" />
          </div>
          <h2 className="text-xl font-bold text-surface-100">Welcome to ChatSphere</h2>
          <p className="text-sm">Select a conversation from the sidebar list or find contacts to start messaging in real-time.</p>
        </div>
      </div>
    );
  }

  // Get recipient profile details
  const getChatDetails = () => {
    if (activeChat.type === 'direct') {
      const otherMember = activeChat.members.find((m: any) => m._id !== currentUser?._id);
      return {
        name: otherMember?.displayName || otherMember?.username || 'Unknown User',
        avatar: otherMember?.avatar,
        status: otherMember?.isOnline ? 'Online' : 'Offline',
        isOnline: otherMember?.isOnline,
      };
    }
    return {
      name: activeChat.groupName || 'Group Chat',
      avatar: activeChat.groupAvatar,
      status: `${activeChat.members.length} members`,
      isOnline: undefined,
    };
  };

  const chatMeta = getChatDetails();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    dispatch(
      sendNewMessage({
        chatId: activeChatId,
        content: content.trim(),
        replyTo: replyMessage?._id,
      }),
    );

    setContent('');
    setReplyMessage(null);
    setShowEmoji(false);
  };

  const handleEmojiClick = (emojiData: any) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-950 relative overflow-hidden">
      {/* ─── Chat Window Header ─────────────────────────────────── */}
      <header className="h-16 flex items-center justify-between px-4 bg-surface-900 border-b border-surface-800 select-none z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-800 text-surface-200 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          
          <Avatar src={chatMeta.avatar} name={chatMeta.name} isOnline={chatMeta.isOnline} size="md" />
          
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{chatMeta.name}</h3>
            <p className={cn('text-xxs truncate', chatMeta.isOnline ? 'text-accent-500' : 'text-surface-300')}>
              {chatMeta.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-surface-200">
          <button className="p-2 rounded-lg hover:bg-surface-800 transition-colors" onClick={onShowDetails}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── Messages Feed scroll container ────────────────────── */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-950 relative"
      >
        {messages.length === 0 ? (
          <div className="text-center py-20 text-surface-300">
            <p className="text-sm">No messages yet. Send a greeting to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.sender?._id === currentUser?._id;
            
            return (
              <div
                key={msg._id}
                className={cn('flex flex-col max-w-[75%]', isMe ? 'ml-auto items-end' : 'mr-auto items-start')}
              >
                {/* Sender Name if group chat */}
                {activeChat.type === 'group' && !isMe && (
                  <span className="text-[10px] font-semibold text-accent-400 mb-1 ml-2">
                    {msg.sender?.displayName || msg.sender?.username}
                  </span>
                )}

                <div
                  className={cn(
                    'px-4 py-2.5 rounded-2xl relative group',
                    isMe
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-surface-900 text-surface-100 rounded-tl-none border border-surface-800',
                  )}
                >
                  {/* Reply preview label inside message bubble */}
                  {msg.replyToMessage && (
                    <div className="bg-black/10 px-2 py-1 border-l-2 border-primary-300 rounded mb-1 text-xs">
                      <p className="font-semibold text-[10px] text-white">Replying to msg</p>
                      <p className="truncate opacity-75">{msg.replyToMessage.content}</p>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className="text-[9px] opacity-60 text-right">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                    {isMe && <Check className="w-3 h-3 opacity-60" />}
                  </div>

                  {/* Reply actions overlay on hover */}
                  <button
                    onClick={() => setReplyMessage(msg)}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 p-1.5 bg-surface-800 hover:bg-surface-700 text-white rounded-lg shadow border border-surface-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                      isMe ? '-left-10' : '-right-10',
                    )}
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Reply message preview bar ─────────────────────────── */}
      {replyMessage && (
        <div className="flex items-center justify-between px-4 py-2 bg-surface-900 border-t border-surface-800 animate-slide-up">
          <div className="flex items-center gap-2 min-w-0 border-l-2 border-primary-500 pl-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary-400">Replying to message</p>
              <p className="text-xs text-surface-300 truncate">{replyMessage.content}</p>
            </div>
          </div>
          <button
            onClick={() => setReplyMessage(null)}
            className="p-1 rounded hover:bg-surface-800 text-surface-300 hover:text-white"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Emoji Picker panel overlay ─────────────────────────── */}
      {showEmoji && (
        <div className="absolute bottom-18 left-4 z-50 animate-scale-in">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={EmojiTheme.DARK}
            skinTonesDisabled
            lazyLoadEmojis
          />
        </div>
      )}

      {/* ─── Rich Messaging input block ───────────────────────── */}
      <form
        onSubmit={handleSend}
        className="h-16 flex items-center gap-3 px-4 bg-surface-900 border-t border-surface-800 shrink-0"
      >
        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className={cn(
            'p-2 rounded-xl hover:bg-surface-800 transition-colors',
            showEmoji ? 'text-primary-400' : 'text-surface-300 hover:text-white',
          )}
        >
          <Smile className="w-5.5 h-5.5" />
        </button>

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-surface-850 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-300/40 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />

        <button
          type="submit"
          className="p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-glow active:scale-95 transition-all"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}

// Inline fallback icons for routing
function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-2.561 3.019 4.5 4.5 0 0 0 3.636-.51c.647-.38 1.302-.19 1.895.12C9.478 20.074 10.709 20.25 12 20.25Z" />
    </svg>
  );
}
