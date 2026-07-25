import React from 'react';
import {
  Smartphone, Monitor, Laptop, Wind, Snowflake,
  Headphones, CookingPot, Scissors, Layers, X
} from 'lucide-react';
import { cromaCategories } from './cromaData';

const iconMap = {
  mobiles: Smartphone,
  tvs: Monitor,
  laptops: Laptop,
  ac: Wind,
  refrigerators: Snowflake,
  audio: Headphones,
  kitchen: CookingPot,
  grooming: Scissors,
};

export default function CategoryBar({ selectedCategory, setSelectedCategory, selectedBrand, setSelectedBrand }) {
  return (
    <section className="mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-mute-500">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-500/70" />
          departments · taxonomy
        </div>
        {(selectedCategory || selectedBrand) && (
          <button
            onClick={() => { setSelectedCategory(null); setSelectedBrand(null); }}
            className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-400 hover:text-neon-300 transition-colors"
          >
            <X size={10} strokeWidth={2} />
            clear
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <CategoryPill
          active={selectedCategory === null}
          icon={Layers}
          label="all"
          onClick={() => { setSelectedCategory(null); setSelectedBrand(null); }}
        />
        {cromaCategories.map((cat) => {
          const Icon = iconMap[cat.id];
          return (
            <CategoryPill
              key={cat.id}
              active={selectedCategory === cat.id}
              icon={Icon}
              label={cat.name}
              onClick={() => { setSelectedCategory(cat.id); setSelectedBrand(null); }}
            />
          );
        })}
      </div>
    </section>
  );
}

function CategoryPill({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-1.5 px-3 py-1.5 rounded-md
        font-mono text-[9.5px] uppercase tracking-[0.16em] whitespace-nowrap
        transition-all duration-200 shrink-0
        ${active
          ? 'bg-neon-500/15 text-neon-300 border border-neon-500/40 shadow-[0_0_10px_-2px_rgba(0,255,170,0.15)]'
          : 'bg-ink-850/60 backdrop-blur-sm border border-line-800/60 text-mute-400 hover:text-white hover:border-line-600 hover:bg-ink-800/80 hover:-translate-y-0.5 hover:shadow-[0_0_12px_-4px_rgba(0,255,170,0.08)]'
        }
      `}
    >
      {Icon && <Icon size={11} strokeWidth={1.8} className={active ? 'text-neon-400' : 'text-mute-500 group-hover:text-neon-400'} />}
      <span>{label}</span>
      {active && <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-4/5 h-[1.5px] bg-neon-500/60 rounded-full" />}
    </button>
  );
}
