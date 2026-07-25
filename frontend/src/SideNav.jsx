import React from 'react';
import {
  X, Layers, ClipboardList, MapPin, ShoppingCart, User,
  Zap, LogOut,
} from 'lucide-react';

export default function SideNav({ activeTab, setActiveTab, isOpen, onClose, onCartOpen, cartItemCount, user, onLogoutClick }) {
  const links = [
    { id: 'catalog', label: 'Catalog', Icon: Layers },
    { id: null, label: 'Cart', Icon: ShoppingCart, action: onCartOpen },
    { id: 'history', label: 'Orders', Icon: ClipboardList },
    { id: 'addresses', label: 'Addresses', Icon: MapPin },
    { id: 'profile', label: 'Profile', Icon: User },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <div className="relative w-72 max-w-[80vw] bg-ink-900/95 backdrop-blur-xl border-r border-line-800 h-full flex flex-col slide-in-from-left">
            <div className="flex items-center justify-between px-5 h-14 border-b border-line-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 border border-neon-500/70 flex items-center justify-center">
                  <Zap size={13} strokeWidth={2.5} className="text-neon-500" />
                </div>
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-white">
                  flash<span className="text-neon-500">cart</span>
                </span>
              </div>
              <button onClick={onClose} className="text-mute-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {links.map(({ id, label, Icon, action }) => (
                <button
                  key={label}
                  onClick={() => { if (action) { action(); onClose(); } else { setActiveTab(id); onClose(); } }}
                  className={`w-full flex items-center gap-3 px-5 py-3 border-l-[2px] transition-all duration-150
                    ${activeTab === id && !action
                      ? 'border-neon-500 bg-neon-500/8 text-white'
                      : 'border-transparent text-mute-400 hover:text-white hover:bg-ink-800/60 hover:border-line-600'
                    }`}
                >
                  <Icon size={15} strokeWidth={1.8} className={id && activeTab === id && !action ? 'text-neon-400' : 'text-mute-500'} />
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em]">{label}</span>
                  {(id === 'catalog' || label === 'Cart') && (
                    <span className="ml-auto font-mono text-[9px] text-neon-500/70">[{cartItemCount}]</span>
                  )}
                </button>
              ))}
            </div>

            {user && (
              <div className="border-t border-line-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full border border-neon-500/40 bg-ink-800 flex items-center justify-center">
                    <User size={13} className="text-neon-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-[12px] font-mono truncate">{user.name || user.email}</div>
                    <div className="text-mute-500 text-[9px] font-mono uppercase tracking-[0.18em]">authenticated</div>
                  </div>
                </div>
                <button
                  onClick={() => { onClose(); onLogoutClick(); }}
                  className="w-full flex items-center justify-center gap-2 h-9 border border-line-700 hover:border-red-500/60 hover:bg-red-950/30 text-mute-400 hover:text-red-400 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors rounded"
                >
                  <LogOut size={11} strokeWidth={2} />
                  logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
