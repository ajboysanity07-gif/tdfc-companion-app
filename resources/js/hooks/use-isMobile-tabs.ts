import { useState, useEffect } from 'react';

export function useIsMobileTabs() {
  const [isMobileTabs, setIsMobileTabs] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1200 : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobileTabs(window.innerWidth < 1200);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobileTabs;
}
