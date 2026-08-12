/**
 * AuthView — Premium glassmorphic login / sign-up / forgot password screen.
 * Uses standard email + password authentication and handles password recovery.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthView() {
  const { signIn, signUp, resetPassword, updatePassword, recoveryMode } = useAuth();
  
  // viewState can be 'signIn', 'signUp', or 'forgotPassword'
  // (If recoveryMode is true, we force the "Update Password" view)
  const [viewState, setViewState] = useState('signIn');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleToggleView = (newView) => {
    setViewState(newView);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Handle Recovery Mode (Update Password)
    if (recoveryMode) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setLoading(true);
      try {
        await updatePassword(password);
        setSuccess('Password updated successfully! Redirecting...');
      } catch (err) {
        setError(err.message || 'Failed to update password.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle Forgot Password (Request Reset)
    if (viewState === 'forgotPassword') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setSuccess('Check your email for a password reset link.');
      } catch (err) {
        setError(err.message || 'Failed to send reset link.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle Sign In / Sign Up
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (viewState === 'signUp' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (viewState === 'signUp') {
        await signUp(email.trim(), password);
        setSuccess('Account created! You are now signed in.');
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-electric-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-accent/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue to-emerald-accent flex items-center justify-center shadow-lg shadow-electric-blue/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Synapse
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            {recoveryMode ? 'Secure Password Recovery' : 'Competitive Intelligence Platform'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          
          {/* Toggle Tabs (Only show if not in recovery mode) */}
          {!recoveryMode && (
            <div className="flex mb-8 bg-slate-800/50 rounded-xl p-1 border border-slate-700/30">
              <button
                type="button"
                onClick={() => handleToggleView('signIn')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  viewState === 'signIn'
                    ? 'bg-gradient-to-r from-electric-blue/20 to-emerald-accent/10 text-white shadow-sm border border-electric-blue/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleToggleView('signUp')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  viewState === 'signUp'
                    ? 'bg-gradient-to-r from-electric-blue/20 to-emerald-accent/10 text-white shadow-sm border border-electric-blue/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Recovery Header */}
          {recoveryMode && (
             <div className="mb-6 text-center">
               <h2 className="text-lg font-bold text-white mb-2">Update Password</h2>
               <p className="text-sm text-slate-400">Please enter your new secure password below.</p>
             </div>
          )}
          {viewState === 'forgotPassword' && !recoveryMode && (
             <div className="mb-6 text-center">
               <h2 className="text-lg font-bold text-white mb-2">Reset Password</h2>
               <p className="text-sm text-slate-400">Enter your email and we'll send you a secure reset link.</p>
             </div>
          )}

          {/* Error / Success Alerts */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 animate-fade-in">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 animate-fade-in">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-emerald-300 text-sm">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field (hidden in Recovery Mode) */}
            {!recoveryMode && (
              <div className="animate-fade-in">
                <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-2 focus:ring-electric-blue/20 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Password Field (hidden in Forgot Password mode, shown in Sign In, Sign Up, Recovery) */}
            {(viewState !== 'forgotPassword' || recoveryMode) && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {recoveryMode ? 'New Password' : 'Password'}
                  </label>
                  {/* Forgot Password Link (Only in Sign In view) */}
                  {viewState === 'signIn' && !recoveryMode && (
                    <button 
                      type="button" 
                      onClick={() => handleToggleView('forgotPassword')}
                      className="text-xs text-electric-blue hover:text-emerald-accent transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-12 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-2 focus:ring-electric-blue/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Sign Up or Recovery) */}
            {(viewState === 'signUp' || recoveryMode) && (
              <div className="animate-fade-in">
                <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-2 focus:ring-electric-blue/20 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Back to Sign In Link (Forgot Password mode) */}
            {viewState === 'forgotPassword' && !recoveryMode && (
               <div className="text-center">
                 <button 
                   type="button" 
                   onClick={() => handleToggleView('signIn')}
                   className="text-xs text-slate-500 hover:text-white transition-colors"
                 >
                   &larr; Back to Sign In
                 </button>
               </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-electric-blue to-emerald-accent text-white shadow-lg shadow-electric-blue/20 hover:shadow-electric-blue/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className={`transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
                {recoveryMode ? 'Update Password' : viewState === 'signUp' ? 'Create Account' : viewState === 'forgotPassword' ? 'Send Reset Link' : 'Sign In'}
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Synapse Analytics Engine v2.0 · Secure Authentication powered by Supabase
        </p>
      </div>
    </div>
  );
}
