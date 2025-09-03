import React, { useEffect, useState } from 'react';
import { swManager } from '@/lib/serviceWorker';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ServiceWorkerUpdater: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Check service worker version on mount
    const checkVersion = async () => {
      const currentVersion = await swManager.getVersion();
      setVersion(currentVersion);
    };
    
    checkVersion();
    
    // Check for updates periodically
    const interval = setInterval(() => {
      setHasUpdate(swManager.isUpdateAvailable());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      await swManager.checkForUpdates();
      // Give it a moment to detect updates
      setTimeout(() => {
        setHasUpdate(swManager.isUpdateAvailable());
        setChecking(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to check for updates:', error);
      setChecking(false);
    }
  };

  const handleUpdate = async () => {
    await swManager.activateUpdate();
    // Page will reload automatically
  };

  const handleClearCache = async () => {
    await swManager.clearCache();
    window.location.reload();
  };

  // Only show in production or if explicitly enabled
  if (import.meta.env.DEV && !import.meta.env.VITE_SHOW_SW_UI) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Version info badge */}
      {version && (
        <div className="mb-2 text-xs text-gray-500 bg-white rounded px-2 py-1 shadow-sm">
          Version: {version}
        </div>
      )}
      
      {/* Update available notification */}
      {hasUpdate && (
        <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-3 mb-2">
          <div className="flex-1">
            <div className="font-semibold text-sm">Update Available</div>
            <div className="text-xs opacity-90">A new version is ready to install</div>
          </div>
          <Button
            onClick={handleUpdate}
            size="sm"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Update Now
          </Button>
        </div>
      )}
      
      {/* Development controls */}
      {import.meta.env.DEV && (
        <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg space-y-2">
          <div className="text-xs font-medium mb-1">Service Worker Dev Tools</div>
          <div className="flex gap-2">
            <Button
              onClick={handleCheckUpdate}
              size="sm"
              variant="ghost"
              className="text-xs text-white hover:bg-gray-700"
              disabled={checking}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${checking ? 'animate-spin' : ''}`} />
              Check Update
            </Button>
            <Button
              onClick={handleClearCache}
              size="sm"
              variant="ghost"
              className="text-xs text-white hover:bg-gray-700"
            >
              Clear Cache
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};