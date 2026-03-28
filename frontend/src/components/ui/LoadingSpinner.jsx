import React from 'react';

export default function LoadingSpinner({ fullScreen, size = 40 }) {
  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className="border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
