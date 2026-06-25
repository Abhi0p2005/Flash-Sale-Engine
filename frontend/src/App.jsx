import React, { useState, useEffect } from 'react';
import { Zap, ShoppingCart, ShieldAlert, BarChart3, Clock } from 'lucide-react';

export default function App() {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-400 fill-amber-400" />
          <span className="font-extrabold text-xl tracking-wider text-white">FLASH ENGINE</span>
        </div>
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-mono font-bold text-amber-400">{formatTime(timeLeft)}</span>
        </div>
      </nav>

      {/* Main Panel Grid */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchasing Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider border border-red-500/20">
                  Live Sale Event
                </span>
                <h2 className="text-2xl font-bold text-white mt-2">Premium High-Performance SSD</h2>
                <p className="text-sm text-slate-400 mt-1">Ultra-low latency NVMe Storage Node</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 line-through">₹4,999</p>
                <p className="text-3xl font-black text-amber-400">₹999</p>
              </div>
            </div>

            {/* Inventory Progress */}
            <div className="my-6">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-400">Available Stock Remaining</span>
                <span className="text-amber-400">42 / 1000 Units</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500" style={{ width: '4.2%' }}></div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.99]">
              <ShoppingCart className="h-5 w-5 fill-slate-950" />
              Flash Buy Now
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Side Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" /> System Telemetry
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-sm text-slate-400">Pipeline Latency</span>
                <span className="font-mono text-emerald-400 font-bold">1.2ms</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-sm text-slate-400">Concurrent Requests</span>
                <span className="font-mono text-amber-400 font-bold">14,205 req/s</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}