import React from 'react';

interface LoadingScreenProps {
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullScreen = true }) => {
  const wrapperClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-brand-background z-50'
    : 'flex items-center justify-center py-20';

  return (
    <div className={wrapperClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
