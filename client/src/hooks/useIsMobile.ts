import { useState, useEffect } from 'react';
import { isMobileDevice } from '../stores/virtualInput';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileDevice());

  useEffect(() => {
    const handleUpdate = () => {
      setIsMobile(isMobileDevice());
    };
    handleUpdate();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('orientationchange', handleUpdate);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
    };
  }, []);

  return isMobile;
}
