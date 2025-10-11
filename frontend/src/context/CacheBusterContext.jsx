import React, { createContext } from 'react';

export const CacheBusterContext = createContext();

export const CacheBusterProvider = ({ children }) => {
  // A non-functional provider to satisfy the build.
  // In a real application, this would have logic to check for new versions.
  const value = {
      isLatestVersion: true,
      loading: false,
      refreshCacheAndReload: () => window.location.reload(true),
  };

  return (
    <CacheBusterContext.Provider value={value}>
      {children}
    </CacheBusterContext.Provider>
  );
};
