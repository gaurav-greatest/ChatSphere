import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleTheme } from '@/features/theme/themeSlice';
import { ArrowLeft, Moon, Sun, Shield, BellRing, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.theme);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    toast.success(`Theme changed to ${theme.resolved === 'dark' ? 'light' : 'dark'} mode`);
  };

  return (
    <div className="min-h-screen bg-surface-955 text-surface-100 flex flex-col">
      {/* ─── Header ────────────────────────────────────────────── */}
      <header className="h-16 bg-surface-900 border-b border-surface-800 flex items-center px-6 gap-4 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-surface-800 text-surface-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Settings</h1>
      </header>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto flex justify-center p-6 md:p-12">
        <div className="w-full max-w-xl bg-surface-900 border border-surface-800 rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in shadow-elevated">
          
          <h2 className="text-base font-bold text-white mb-4 border-b border-surface-800 pb-2">Preferences</h2>

          {/* Theme Option Toggle */}
          <div className="flex items-center justify-between p-4 bg-surface-850 border border-surface-700 rounded-2xl">
            <div className="flex items-center gap-3">
              {theme.resolved === 'dark' ? (
                <Moon className="w-5 h-5 text-primary-400" />
              ) : (
                <Sun className="w-5 h-5 text-warning-500" />
              )}
              <div>
                <p className="text-sm font-semibold text-white">Appearance</p>
                <p className="text-xs text-surface-300">Toggle dark or light theme interface</p>
              </div>
            </div>
            <button
              onClick={handleToggleTheme}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-xs font-semibold rounded-xl border border-surface-700 transition-colors"
            >
              {theme.resolved === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>

          <h2 className="text-base font-bold text-white mb-4 border-b border-surface-800 pb-2 pt-4">Security & Privacy</h2>

          {/* Blocking Section */}
          <div className="flex items-center justify-between p-4 bg-surface-850 border border-surface-700 rounded-2xl cursor-pointer hover:bg-surface-800/80 transition-colors" onClick={() => toast.success('Blocked contacts management panel coming soon')}>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-danger-400" />
              <div>
                <p className="text-sm font-semibold text-white">Blocked Contacts</p>
                <p className="text-xs text-surface-300">Manage user block list restrictions</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-surface-300" />
          </div>

          {/* Alert Toggles */}
          <div className="flex items-center justify-between p-4 bg-surface-850 border border-surface-700 rounded-2xl cursor-pointer hover:bg-surface-800/80 transition-colors" onClick={() => toast.success('Notifications details settings coming soon')}>
            <div className="flex items-center gap-3">
              <BellRing className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="text-xs text-surface-300">Customize sound alerts and visual notification cards</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-surface-300" />
          </div>

        </div>
      </main>
    </div>
  );
}
