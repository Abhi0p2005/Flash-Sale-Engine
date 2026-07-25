import React from 'react';
import { X, LogOut, User, Zap } from 'lucide-react';

export default function LogoutModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onCancel} />

      <div className="relative w-full max-w-sm bg-ink-900/95 backdrop-blur-xl border border-neon-500/30 shadow-[0_0_30px_-8px_rgba(0,255,170,0.12)] rounded-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-500/60 to-transparent" />

        <div className="flex items-center justify-between px-5 h-13 border-b border-line-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-neon-500/60 flex items-center justify-center rounded-sm">
              <Zap size={11} strokeWidth={2.5} className="text-neon-500" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-400">
              session · terminate
            </span>
          </div>
          <button onClick={onCancel} className="text-mute-400 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full border-2 border-neon-500/30 bg-ink-800 flex items-center justify-center mb-4">
            <User size={22} className="text-neon-400" strokeWidth={1.5} />
          </div>

          <p className="text-white font-mono text-[13px] mb-1">
            {user?.name || user?.email}
          </p>
          <p className="text-mute-400 font-mono text-[11px] uppercase tracking-[0.14em]">
            Are you sure you want to log out?
          </p>

          <div className="flex gap-3 mt-6 w-full">
            <button
              onClick={onCancel}
              className="flex-1 h-10 border border-line-700 hover:border-line-500 text-mute-400 hover:text-white font-mono text-[10px] uppercase tracking-[0.2em] transition-colors rounded"
            >
              cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-10 bg-neon-500 hover:bg-neon-400 text-ink-950 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 rounded"
            >
              <LogOut size={11} strokeWidth={2.5} />
              confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
