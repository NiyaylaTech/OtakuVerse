import React from 'react';

interface RetryButtonProps {
  onRetry: () => void;
  label?: string;
  className?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  label = 'Retry API Request',
  className = '',
}) => {
  return (
    <button
      onClick={onRetry}
      className={`px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-sm rounded-xl border border-[#389B5F] transition-all duration-200 shadow-md hover:shadow-[0_0_15px_rgba(56,155,95,0.4)] cursor-pointer inline-flex items-center gap-2 ${className}`}
    >
      <span>🔄</span>
      <span>{label}</span>
    </button>
  );
};
