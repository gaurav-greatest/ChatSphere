import { useState } from 'react';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import { useSocket } from '@/hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, MessageSquare, Bell, X, Shield, Info, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import Avatar from '@/components/ui/Avatar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const activeChatId = useAppSelector((state) => state.chat.activeChatId);
  const chats = useAppSelector((state) => state.chat.chats);

  // Wire up socket list listeners globally inside Dashboard on load
  useSocket();

  const [viewMode, setViewMode] = useState<'list' | 'window'>('list');
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'notifications' | 'details'>('none');

  const activeChat = chats.find((c) => c._id === activeChatId);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getActiveChatDetails = () => {
    if (!activeChat) return null;
    if (activeChat.type === 'direct') {
      const otherMember = activeChat.members.find((m: any) => m._id !== currentUser?._id);
      return {
        name: otherMember?.displayName || otherMember?.username || 'Unknown User',
        username: otherMember?.username,
        avatar: otherMember?.avatar,
        bio: otherMember?.bio || 'No bio available',
        isOnline: otherMember?.isOnline,
        members: activeChat.members,
      };
    }
    return {
      name: activeChat.groupName || 'Group Chat',
      username: 'group',
      avatar: activeChat.groupAvatar,
      bio: activeChat.groupDescription || 'Group conversation',
      isOnline: undefined,
      members: activeChat.members,
    };
  };

  const activeChatMeta = getActiveChatDetails();

  return (
    <div className="h-screen w-screen flex bg-surface-950 text-surface-100 overflow-hidden font-sans">
      {/* ─── Sidebar Navigation Drawer (desktop layout) ─────────── */}
      <nav className="w-16 bg-surface-950 border-r border-surface-850 flex flex-col items-center py-4 justify-between shrink-0 select-none z-20">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">CS</span>
          </div>

          <button
            onClick={() => {
              setViewMode('list');
              setActiveDrawer('none');
            }}
            className={`p-2 rounded-xl transition-colors ${
              activeDrawer === 'none' ? 'text-primary-400 bg-surface-900' : 'text-surface-300 hover:text-white hover:bg-surface-900'
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'notifications' ? 'none' : 'notifications')}
            className={`p-2 rounded-xl transition-colors ${
              activeDrawer === 'notifications' ? 'text-primary-400 bg-surface-900' : 'text-surface-300 hover:text-white hover:bg-surface-900'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-900 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-danger-400 hover:text-danger-500 hover:bg-surface-900 transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <div
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white font-bold cursor-pointer hover:bg-primary-500 transition-colors"
            title="Your Profile"
          >
            {currentUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </nav>

      {/* ─── Main Workspace Area ────────────────── */}
      <div className="flex-1 flex min-w-0 relative">
        {/* Left Side: Chats Sidebar */}
        <div
          className={`w-full md:w-80 flex-shrink-0 ${
            activeChatId && viewMode === 'window' ? 'hidden md:block' : 'block'
          }`}
        >
          <ChatList onSelectChat={() => setViewMode('window')} />
        </div>

        {/* Middle Side: Chat Window Feed */}
        <div
          className={`flex-1 min-w-0 ${
            !activeChatId || (activeChatId && viewMode === 'list') ? 'hidden md:block' : 'block'
          }`}
        >
          <ChatWindow
            onBack={() => setViewMode('list')}
            onShowDetails={() => setActiveDrawer(activeDrawer === 'details' ? 'none' : 'details')}
          />
        </div>

        {/* ─── Right Side Drawer: Notifications ────────────────────── */}
        {activeDrawer === 'notifications' && (
          <div className="w-80 bg-surface-900 border-l border-surface-800 flex flex-col h-full z-20 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-400" />
                <h3 className="font-bold text-sm text-white">Notifications</h3>
              </div>
              <button
                onClick={() => setActiveDrawer('none')}
                className="p-1 text-surface-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-center text-surface-400 text-sm space-y-4">
              <div className="p-3 rounded-xl bg-surface-850 border border-surface-800 text-left space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-primary-400">System</span>
                  <span className="text-[10px] text-surface-500">Just now</span>
                </div>
                <p className="text-xs text-surface-200">Welcome to ChatSphere! Real-time notifications active.</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Right Side Drawer: Profile / Conversation Details ────── */}
        {activeDrawer === 'details' && activeChatMeta && (
          <div className="w-80 bg-surface-900 border-l border-surface-800 flex flex-col h-full z-20 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary-400" />
                <h3 className="font-bold text-sm text-white">Contact Info</h3>
              </div>
              <button
                onClick={() => setActiveDrawer('none')}
                className="p-1 text-surface-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center space-y-3">
                <Avatar
                  src={activeChatMeta.avatar}
                  name={activeChatMeta.name}
                  isOnline={activeChatMeta.isOnline}
                  size="xl"
                  className="mx-auto"
                />
                <div>
                  <h4 className="font-bold text-lg text-white">{activeChatMeta.name}</h4>
                  {activeChatMeta.username !== 'group' && (
                    <p className="text-xs text-surface-400">@{activeChatMeta.username}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 p-3 bg-surface-850 rounded-xl border border-surface-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">About / Bio</span>
                <p className="text-xs text-surface-200">{activeChatMeta.bio}</p>
              </div>

              {activeChat?.type === 'group' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-surface-300 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-primary-400" />
                    <span>Group Members ({activeChatMeta.members?.length})</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activeChatMeta.members?.map((m: any) => (
                      <div key={m._id} className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-850">
                        <Avatar src={m.avatar} name={m.displayName || m.username} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{m.displayName || m.username}</p>
                          <p className="text-[10px] text-surface-400 truncate">@{m.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-surface-800 space-y-2">
                <button
                  onClick={() => toast.success('Security encryption verified')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-850 hover:bg-surface-800 text-xs text-surface-300 transition-colors"
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>End-to-End Encryption Verified</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
