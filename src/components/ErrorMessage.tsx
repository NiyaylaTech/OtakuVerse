import React from 'react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Unable to connect to AniList GraphQL API. Please check your network connection.',
  onRetry,
}) => {
  return (
    <div className="my-8 p-6 bg-[#141C17] border-2 border-[#D92626] rounded-xl text-center space-y-4 max-w-xl mx-auto shadow-lg shadow-red-950/20">
      <div className="w-12 h-12 mx-auto rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 text-2xl font-bold">
        ⚠️
      </div>
      <div>
        <h4 className="text-lg font-bold text-white font-serif mb-1">AniList Connection Notice</h4>
        <p className="text-sm text-[#A3C2AE] leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-sm rounded-lg border border-[#389B5F] transition-all duration-200 shadow-md hover:shadow-emerald-900/50 cursor-pointer inline-flex items-center gap-2"
        >
          <span>🔄 Retry API Request</span>
        </button>
      )}
    </div>
  );
};
