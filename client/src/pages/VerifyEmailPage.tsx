import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/axios';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Email verification failed. The link may have expired or is invalid.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-6">
      <div className="w-full max-w-md bg-surface-900 border border-surface-800 rounded-2xl p-8 shadow-elevated text-center animate-fade-in">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-surface-100">Verifying your email</h2>
            <p className="text-surface-300 text-sm">Please wait while we verify your activation link.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-scale-in">
            <div className="w-16 h-16 bg-accent-500/10 border border-accent-500/20 text-accent-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-surface-100">Email Verified!</h2>
              <p className="text-surface-300 text-sm leading-relaxed">
                Thank you. Your email address has been verified. You can now access all ChatSphere features.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              Continue to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-scale-in">
            <div className="w-16 h-16 bg-danger-500/10 border border-danger-500/20 text-danger-500 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-surface-100">Verification Failed</h2>
              <p className="text-surface-300 text-sm leading-relaxed">{message}</p>
            </div>
            <Link
              to="/login"
              className="w-full inline-block py-3 bg-surface-800 hover:bg-surface-700 text-surface-100 font-semibold rounded-xl transition-all duration-200"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
