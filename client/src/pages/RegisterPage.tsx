import { MessageCircle } from 'lucide-react';
import { SignUp } from '@clerk/clerk-react';

export default function RegisterPage() {
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

      {/* ─── Right Panel — Clerk SignUp Component ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md flex flex-col items-center animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Chat<span className="text-primary-400">Sphere</span>
            </h1>
          </div>

          <SignUp 
            fallbackRedirectUrl="/" 
            signInUrl="/login"
          />
        </div>
      </div>
    </div>
  );
}
