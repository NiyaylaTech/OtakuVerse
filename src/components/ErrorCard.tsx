import React from 'react';
import { RetryButton } from './RetryButton';

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  message = 'Unable to connect to the official AniList GraphQL API. Please check your network connection.',
  onRetry,
  title = 'AniList API Connection Notice',
}) => {
  return (
    <div className="my-8 p-6 bg-[#0E1410] border-2 border-red-900/60 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-xl shadow-red-950/20">
      <div className="w-14 h-14 mx-auto rounded-full bg-red-950/60 border-2 border-red-500/40 flex items-center justify-center text-red-400 text-2xl font-bold shadow-inner">
        ⚠️
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-serif font-bold text-white">{title}</h4>
        <p className="text-xs sm:text-sm text-[#A3C2AE] leading-relaxed max-w-md mx-auto">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <RetryButton onRetry={onRetry} />
        </div>
      )}
    </div>
  );
};
