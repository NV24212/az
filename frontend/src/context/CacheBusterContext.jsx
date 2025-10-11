import React, { createContext, useCallback, useState } from 'react';

const CacheBusterContext = createContext();

const CacheBusterProvider = ({ children }) => {
  const [cacheKey, setCacheKey] = useState(Date.now());

  const bustCache = useCallback(() => {
    setCacheKey(Date.now());
  }, []);

  return (
    <CacheBusterContext.Provider value={{ cacheKey, bustCache }}>
      {children}
    </CacheBusterContext.Provider>
  );
};

export { CacheBusterContext, CacheBusterProvider };
