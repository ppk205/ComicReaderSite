"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface ActionTileProps {
  title: string;
  description: string;
  href?: string;
  tone: 'purple' | 'sky' | 'amber' | 'indigo' | 'fuchsia' | 'red' | 'orange' | 'teal';
  disabled?: boolean;
  onClick?: () => void;
}

const toneStyles: Record<ActionTileProps['tone'], { border: string; bg: string; text: string; arrow: string }> = {
  purple: {
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/10',
    text: 'text-purple-100',
    arrow: 'text-purple-200/70',
  },
  sky: {
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/10',
    text: 'text-sky-100',
    arrow: 'text-sky-200/70',
  },
  amber: {
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    text: 'text-amber-100',
    arrow: 'text-amber-200/70',
  },
  indigo: {
    border: 'border-indigo-500/20',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-100',
    arrow: 'text-indigo-200/70',
  },
  fuchsia: {
    border: 'border-fuchsia-500/20',
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-100',
    arrow: 'text-fuchsia-200/70',
  },
  red: {
    border: 'border-red-500/20',
    bg: 'bg-red-500/10',
    text: 'text-red-100',
    arrow: 'text-red-200/70',
  },
  orange: {
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/10',
    text: 'text-orange-100',
    arrow: 'text-orange-200/70',
  },
  teal: {
    border: 'border-teal-500/20',
    bg: 'bg-teal-500/10',
    text: 'text-teal-100',
    arrow: 'text-teal-200/70',
  },
};

export function ActionTile({ title, description, href, tone, disabled, onClick }: ActionTileProps) {
  const router = useRouter();
  const styles = toneStyles[tone];

  const handleClick = () => {
    if (disabled) {
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    if (href) {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full rounded-xl border ${styles.border} ${styles.bg} px-4 py-3 text-left text-sm font-medium ${
        styles.text
      } transition hover:border-purple-400/40 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p>{title}</p>
          <p className="mt-1 text-xs text-gray-200/70">{description}</p>
        </div>
        <span className={`text-lg leading-none ${styles.arrow}`} aria-hidden="true">
          →
        </span>
      </div>
    </button>
  );
}
