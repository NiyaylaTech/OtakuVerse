import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface SignInViewProps {
  onNavigate: (path: string) => void;
  redirectPath?: string;
}

export const SignInView: React.FC<SignInViewProps> = ({ onNavigate, redirectPath = '/profile' }) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotNotice(false);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await login({
        identifier: identifier.trim(),
        password,
      });

      // Successful login - navigate to intended or default destination
      onNavigate(redirectPath || '/profile');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#060807]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md space-y-8 bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#25663E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#25663E] to-[#0E1410] border-2 border-[#C5A059] p-1 shadow-[0_0_20px_rgba(56,155,95,0.4)] mb-2">
            <img
              src="/logo.jpg"
              alt="OtakuVerse Emblem"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-wide">
            Sign In to <span className="text-[#389B5F]">Otaku</span><span className="text-[#C5A059]">Verse</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A3C2AE]">
            Welcome back! Access your anime lists, reviews, and community.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-start gap-3"
          >
            <span className="text-lg leading-none">⚠️</span>
            <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}

        {/* Forgot Password Notice */}
        {forgotNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-[#25663E]/20 border border-[#389B5F]/40 text-[#A3C2AE] text-xs flex items-center justify-between"
          >
            <span>🔐 Password reset is coming soon! Please contact support if you need assistance.</span>
            <button
              type="button"
              onClick={() => setForgotNotice(false)}
              className="text-[#C5A059] hover:underline font-bold ml-2 cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Username / Email */}
          <div>
            <label className="block text-xs font-bold text-[#A3C2AE] uppercase tracking-wider mb-2">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username or email"
                className="w-full px-4 py-3 bg-[#060807] border border-[#23382C] focus:border-[#389B5F] focus:ring-1 focus:ring-[#389B5F] rounded-xl text-white text-sm placeholder-[#A3C2AE]/50 transition-colors outline-none"
              />
              <span className="absolute right-3.5 top-3.5 text-base text-[#A3C2AE]/60 pointer-events-none">
                👤
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#A3C2AE] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotNotice(true)}
                className="text-xs text-[#C5A059] hover:text-[#d4af67] font-medium transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-4 pr-12 py-3 bg-[#060807] border border-[#23382C] focus:border-[#389B5F] focus:ring-1 focus:ring-[#389B5F] rounded-xl text-white text-sm placeholder-[#A3C2AE]/50 transition-colors outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#A3C2AE] hover:text-white text-xs font-semibold px-1 py-1 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#A3C2AE] select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#23382C] bg-[#060807] text-[#25663E] focus:ring-[#389B5F] accent-[#25663E] cursor-pointer"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#25663E] to-[#389B5F] hover:from-[#2e7d4d] hover:to-[#41b06c] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-50 transition-all border border-[#389B5F]/50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span>➔</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Link to Sign Up */}
        <div className="text-center pt-4 border-t border-[#23382C] text-xs sm:text-sm text-[#A3C2AE] relative z-10">
          <span>Don’t have an account? </span>
          <button
            type="button"
            onClick={() => onNavigate('/sign-up')}
            className="text-[#C5A059] hover:text-[#d4af67] font-bold underline transition-colors cursor-pointer ml-1"
          >
            Create Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};
