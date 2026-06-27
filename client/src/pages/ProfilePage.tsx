import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setUser } from '@/features/auth/authSlice';
import Avatar from '@/components/ui/Avatar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, User as UserIcon, FileText, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    displayName: currentUser?.displayName || '',
    bio: '', // Bio & status message defaults to string
    statusMessage: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.patch('/users/profile', form);
      dispatch(setUser(data.data.user));
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-lg font-bold">My Profile</h1>
      </header>

      {/* ─── Main Content Form ──────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto flex justify-center p-6 md:p-12">
        <div className="w-full max-w-xl bg-surface-900 border border-surface-800 rounded-2xl p-6 md:p-8 space-y-8 animate-fade-in shadow-elevated">
          {/* Avatar center section */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar src={currentUser?.avatar} name={currentUser?.displayName || 'User'} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {currentUser?.displayName}
              </h2>
              <p className="text-xs text-surface-300">@{currentUser?.username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="prof-name" className="text-sm font-semibold text-surface-200">
                Display Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-300 pointer-events-none" />
                <input
                  id="prof-name"
                  name="displayName"
                  type="text"
                  required
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="DisplayName"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="prof-bio" className="text-sm font-semibold text-surface-200">
                Bio
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4.5 h-4.5 text-surface-300 pointer-events-none" />
                <textarea
                  id="prof-bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Hey there, I am using ChatSphere."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Status message */}
            <div className="space-y-2">
              <label htmlFor="prof-status" className="text-sm font-semibold text-surface-200">
                Status Message
              </label>
              <div className="relative">
                <Smile className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-300 pointer-events-none" />
                <input
                  id="prof-status"
                  name="statusMessage"
                  type="text"
                  value={form.statusMessage}
                  onChange={handleChange}
                  placeholder="At work"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Save details button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold rounded-xl shadow-glow transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
