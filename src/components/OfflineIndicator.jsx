import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
          className="fixed left-0 right-0 z-[100] px-4 py-2 text-center text-xs font-medium"
          style={{ top: 'calc(48px + env(safe-area-inset-top, 0px))', background: '#EF4444', color: 'white' }}
        >
          <WifiOff size={12} className="inline mr-1" />
          Sem ligacao a internet - alteracoes locais serao sincronizadas
        </motion.div>
      )}
    </AnimatePresence>
  );
}
