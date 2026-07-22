import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'banner' | 'detail';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 6, type = 'card' }) => {
  if (type === 'banner') {
    return (
      <div className="w-full h-80 bg-emerald-950/20 animate-pulse rounded-2xl border border-emerald-900/30 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md w-full">
          <div className="h-8 bg-emerald-900/40 rounded w-3/4 mx-auto animate-pulse"></div>
          <div className="h-4 bg-emerald-900/30 rounded w-1/2 mx-auto animate-pulse"></div>
          <div className="h-12 bg-emerald-900/50 rounded-xl w-40 mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="w-full h-96 bg-emerald-950/30 rounded-2xl border border-emerald-800/20"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-96 bg-emerald-950/30 rounded-xl border border-emerald-800/20"></div>
          <div className="md:col-span-2 space-y-4">
            <div className="h-10 bg-emerald-900/40 rounded w-2/3"></div>
            <div className="h-6 bg-emerald-900/30 rounded w-1/3"></div>
            <div className="h-32 bg-emerald-950/20 rounded-xl border border-emerald-900/20"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-emerald-950/30 rounded-lg"></div>
              <div className="h-16 bg-emerald-950/30 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#0E1410] border border-[#23382C] rounded-xl overflow-hidden animate-pulse flex flex-col h-80"
        >
          <div className="w-full h-56 bg-emerald-950/40 relative">
            <div className="absolute top-2 right-2 w-10 h-5 bg-emerald-900/50 rounded-full"></div>
          </div>
          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div>
              <div className="h-4 bg-emerald-900/40 rounded w-5/6 mb-1.5"></div>
              <div className="h-3 bg-emerald-900/25 rounded w-1/2"></div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#23382C]/50">
              <div className="h-3 bg-emerald-900/30 rounded w-1/3"></div>
              <div className="h-3 bg-emerald-900/30 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
