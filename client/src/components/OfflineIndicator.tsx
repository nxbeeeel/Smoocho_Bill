import React from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { WifiIcon, CloudIcon } from '@heroicons/react/24/solid';

const OfflineIndicator: React.FC = () => {
  const { isOnline, syncInProgress, pendingOperations } = useOfflineStore();

  if (isOnline && !syncInProgress && pendingOperations === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
        flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white font-medium
        ${
          isOnline
            ? 'bg-blue-500 animate-pulse'
            : 'bg-red-500 offline-indicator'
        }
      `}
      >
        {isOnline ? (
          <>
            <CloudIcon className="w-5 h-5" />
            {syncInProgress ? 'Syncing...' : `${pendingOperations} pending`}
          </>
        ) : (
          <>
            <WifiIcon className="w-5 h-5 opacity-50" />
            Offline Mode
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
