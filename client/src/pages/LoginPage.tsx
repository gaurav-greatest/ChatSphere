import { MessageCircle } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* ─── Left Panel — Branding (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Animated gradient background */}
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
            Connect, collaborate, and communicate in real-time with a modern messaging experience.
          </p>

          {/* Feature highlights */}
          <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
            {[
              'End-to-end encrypted messaging',
              'Group chats with rich media',
              'Real-time presence & typing indicators',
              'Cross-device synchronization',
            ].map((feature, i) => (
              <div
                key={feature}
                className="flex items-center gap-3 text-surface-300 animate-slide-up"
                style={{ animationDelay: `${0.2 + i * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Clerk SignIn Component ─── */}
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

          <SignIn 
            fallbackRedirectUrl="/" 
            signUpUrl="/register"
          />
        </div>
      </div>
    </div>
  );
}
