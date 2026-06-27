import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setError, setLoading, clearError } from '@/features/auth/authSlice';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Loader2, MessageCircle } from 'lucide-react';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      const msg = 'Passwords do not match';
      dispatch(setError(msg));
      toast.error(msg);
      return;
    }

    dispatch(setLoading(true));

    try {
      const payload = {
        username: form.username,
        email: form.email,
        displayName: form.displayName,
        password: form.password,
      };

      await api.post('/auth/register', payload);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please try again.';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* ─── Left Panel — Branding (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-surface-950" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-8 shadow-glow">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Chat<span className="text-primary-400">Sphere</span>
          </h1>
          <p className="text-xl text-surface-300 max-w-md mx-auto leading-relaxed">
            Create an account to join ChatSphere and start messaging in real-time.
          </p>
        </div>
      </div>

      {/* ─── Right Panel — Register Form ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Chat<span className="text-primary-400">Sphere</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-surface-100 mb-2">Create account</h2>
            <p className="text-surface-300">Join our modern messaging platform today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <div>
              <label htmlFor="reg-username" className="block text-sm font-medium text-surface-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 pointer-events-none" />
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Display Name field */}
            <div>
              <label htmlFor="reg-displayname" className="block text-sm font-medium text-surface-200 mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 pointer-events-none" />
                <input
                  id="reg-displayname"
                  name="displayName"
                  type="text"
                  required
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-surface-200 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 pointer-events-none" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-surface-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 pointer-events-none" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-100 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="reg-confirmpassword" className="block text-sm font-medium text-surface-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 pointer-events-none" />
                <input
                  id="reg-confirmpassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-2.5 bg-surface-850 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-300/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-100 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm animate-scale-in">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold rounded-xl shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-surface-300 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
