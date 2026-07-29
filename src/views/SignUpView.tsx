import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface SignUpViewProps {
  onNavigate: (path: string) => void;
  redirectPath?: string;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onNavigate, redirectPath = '/profile' }) => {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend Validations
    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedDisplayName || !trimmedEmail || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setErrorMessage('Username must be between 3 and 20 characters.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setErrorMessage('Username can only contain letters, numbers, underscores (_), and hyphens (-).');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy to register.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: trimmedUsername,
        displayName: trimmedDisplayName,
        email: trimmedEmail,
        password,
        confirmPassword,
      });

      // Successful registration - navigate to profile or requested page
      onNavigate(redirectPath || '/profile');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
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
        className="w-full max-w-lg space-y-8 bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#25663E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

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
            Create Account in <span className="text-[#389B5F]">Otaku</span><span className="text-[#C5A059]">Verse</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A3C2AE]">
            Join the community, track your watchlists, write reviews & level up!
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Username & Display Name (Grid on sm+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A3C2AE] uppercase tracking-wider mb-1.5">
                Username <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. otaku_hero"
                className="w-full px-3.5 py-2.5 bg-[#060807] border border-[#23382C] focus:border-[#389B5F] focus:ring-1 focus:ring-[#389B5F] rounded-xl text-white text-sm placeholder-[#A3C2AE]/40 transition-colors outline-none"
              />
              <p className="text-[10px] text-[#A3C2AE]/60 mt-1">3–20 characters, A-Z, 0-9, _, -</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A3C2AE] uppercase tracking-wider mb-1.5">
                Display Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Tanjiro Kamado"
                className="w-full px-3.5 py-2.5 bg-[#060807] border border-[#23382C] focus:border-[#389B5F] focus:ring-1 focus:ring-[#389B5F] rounded-xl text-white text-sm placeholder-[#A3C2AE]/40 transition-colors outline-none"
              />
              <p className="text-[10px] text-[#A3C2AE]/60 mt-1">Your public community name</p>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#A3C2AE] uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-[#060807] border border-[#23382C] focus:border-[#389B5F] focus:ring-1 focus:ring-[#389B5F] rounded-xl text-white text-sm placeholder-[#A3C2AE]/40 transition-colors outline-none"
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A3C2AE] uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#060807] border border-[#23382C] focus:border-[#389B5F] focus:ring-1 focus:ring-[#389B5F] rounded-xl text-white text-sm placeholder-[#A3C2AE]/40 transition-colors outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A3C2AE] uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#060807] border border-[#23382C] focus:border-[#389B5F] focus:ring-1 focus:ring-[#389B5F] rounded-xl text-white text-sm placeholder-[#A3C2AE]/40 transition-colors outline-none"
                />
              </div>
            </div>
          </div>

          {/* Show Password Toggle */}
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#A3C2AE] hover:text-white transition-colors cursor-pointer font-medium"
            >
              {showPassword ? '🙈 Hide passwords' : '👁️ Show passwords'}
            </button>
            <span className="text-[11px] text-[#A3C2AE]/70">Password must be ≥ 8 characters</span>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A3C2AE] select-none">
              <input
                type="checkbox"
                required
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#23382C] bg-[#060807] text-[#25663E] focus:ring-[#389B5F] accent-[#25663E] cursor-pointer"
              />
              <span>
                I agree to the OtakuVerse <span className="text-[#C5A059] underline">Terms of Service</span> and <span className="text-[#C5A059] underline">Privacy Policy</span>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#25663E] to-[#389B5F] hover:from-[#2e7d4d] hover:to-[#41b06c] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-50 transition-all border border-[#389B5F]/50 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span>✨</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Link to Sign In */}
        <div className="text-center pt-4 border-t border-[#23382C] text-xs sm:text-sm text-[#A3C2AE] relative z-10">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={() => onNavigate('/sign-in')}
            className="text-[#C5A059] hover:text-[#d4af67] font-bold underline transition-colors cursor-pointer ml-1"
          >
            Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
};
