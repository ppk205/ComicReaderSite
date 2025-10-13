'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({ 
  href = '/dashboard', 
  label = 'Back to Dashboard',
  className = ''
}: BackButtonProps) {
  const router = useRouter();

  return (
    <div className={`mb-4 ${className}`}>
      <button
        onClick={() => router.push(href)}
        className="flex items-center text-sm font-medium text-purple-200 hover:text-white transition-colors group"
      >
        <svg 
          className="w-4 h-4 mr-2 text-purple-300 group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
        {label}
      </button>
    </div>
  );
}