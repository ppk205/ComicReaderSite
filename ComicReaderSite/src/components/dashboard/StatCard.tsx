import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  accent: string;
  monogram: string;
}

export function StatCard({ label, value, accent, monogram }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-900/60 p-5 shadow-lg transition hover:border-purple-400/40 hover:shadow-purple-900/40">
      <div className={`absolute inset-0 opacity-60 bg-gradient-to-br ${accent}`}></div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-sm font-bold text-white/80">
          {monogram}
        </div>
      </div>
    </div>
  );
}
