import React from 'react';
import { logoUrl } from '../data/site';

const LoadingScreen = ({ fullScreen = true }) => {
  const wrapperClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-brand-background z-50'
    : 'flex items-center justify-center py-20';

  return (
    <div className={wrapperClasses}>
      <div className="flex flex-col items-center gap-4">
        <img
          src={logoUrl}
          alt="Loading..."
          className="h-16 w-16 rounded-full object-cover animate-pulse-subtle"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
