import React, { useState } from 'react';
import { X, Zap, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

export default function AuthModal({ mode, onSwitchMode, onLogin, onRegister, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(name, email, password, phone);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-ink-850 border border-line-800 slide-up">
        <div className="flex items-center justify-between px-5 h-12 border-b border-line-800 bg-ink-900">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border border-neon-500 flex items-center justify-center">
              <Zap size={11} strokeWidth={2.5} className="text-neon-500" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-500">
              {mode === 'login' ? 'authenticate' : 'register'} · flashcart
            </span>
          </div>
          <button onClick={onClose} className="text-mute-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="border border-red-900/40 bg-red-950/30 px-3 py-2 font-mono text-[11px] text-red-400">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-1.5">
                <User size={11} className="inline mr-1" />
                name
              </label>
              <input
                type="text" required
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-ink-800 border border-line-800 focus:border-neon-500 outline-none px-3 h-10 text-[13px] text-white transition-colors"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-1.5">
              <Mail size={11} className="inline mr-1" />
              email
            </label>
            <input
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink-800 border border-line-800 focus:border-neon-500 outline-none px-3 h-10 text-[13px] text-white transition-colors"
              placeholder="user@flashcart.io"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-1.5">
              <Lock size={11} className="inline mr-1" />
              password
            </label>
            <input
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink-800 border border-line-800 focus:border-neon-500 outline-none px-3 h-10 text-[13px] text-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-mute-500 mb-1.5">
                <Phone size={11} className="inline mr-1" />
                phone
              </label>
              <input
                type="tel" required
                value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-ink-800 border border-line-800 focus:border-neon-500 outline-none px-3 h-10 text-[13px] text-white transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>
          )}

          <button
            type="submit" disabled={busy}
            className="w-full h-11 bg-neon-500 hover:bg-neon-400 text-ink-950 font-mono text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="w-3 h-3 border-2 border-ink-950 border-t-transparent animate-spin rounded-full" />
                processing…
              </>
            ) : (
              <>
                {mode === 'login' ? 'authenticate' : 'create identity'} <ArrowRight size={14} strokeWidth={2.5} />
              </>
            )}
          </button>

          <p className="text-center font-mono text-[11px] text-mute-400">
            {mode === 'login' ? (
              <>No account?{' '}<button type="button" onClick={onSwitchMode} className="text-neon-500 hover:text-neon-400 underline">register</button></>
            ) : (
              <>Already registered?{' '}<button type="button" onClick={onSwitchMode} className="text-neon-500 hover:text-neon-400 underline">login</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
