import { useState } from 'react';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import { useSocket } from '@/hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, MessageSquare, Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { UserButton } from '@clerk/clerk-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Wire up socket list listeners globally inside Dashboard on load
  useSocket();

  const activeChatId = useAppSelector((state) => state.chat.activeChatId);
  
  const [viewMode, setViewMode] = useState<'list' | 'window'>('list');

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

  return (
    <div className="h-screen w-screen flex bg-surface-950 text-surface-100 overflow-hidden font-sans">
      {/* ─── Sidebar Navigation Drawer (desktop layout) ─────────── */}
      <nav className="w-16 bg-surface-950 border-r border-surface-850 flex flex-col items-center py-4 justify-between shrink-0 select-none">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">CS</span>
          </div>

          <button
            onClick={() => setViewMode('list')}
            className="p-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-900 transition-colors"
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={() => toast.success('Notifications panel coming soon')}
            className="p-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-900 transition-colors"
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

          <div className="flex items-center justify-center w-10 h-10">
            <UserButton />
          </div>
        </div>
      </nav>

      {/* ─── Mobile-First Dual/Triple Panel Layout ────────────────── */}
      <div className="flex-1 flex min-w-0">
        {/* Left Side: Chats Sidebar */}
        <div
          className={`w-full md:w-80 flex-shrink-0 ${
            activeChatId && viewMode === 'window' ? 'hidden md:block' : 'block'
          }`}
        >
          <ChatList onSelectChat={() => setViewMode('window')} />
        </div>

        {/* Right Side: Chat Window Feed */}
        <div
          className={`flex-1 min-w-0 ${
            !activeChatId || (activeChatId && viewMode === 'list') ? 'hidden md:block' : 'block'
          }`}
        >
          <ChatWindow
            onBack={() => setViewMode('list')}
            onShowDetails={() => toast.success('Profile details drawer coming soon')}
          />
        </div>
      </div>
    </div>
  );
}
