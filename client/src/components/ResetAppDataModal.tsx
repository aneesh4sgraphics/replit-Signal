import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Shield, Database } from 'lucide-react';
import { cacheManager } from '@/lib/cache';
import { useToast } from '@/hooks/use-toast';

interface ResetAppDataModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetAppDataModal: React.FC<ResetAppDataModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  
  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      // Get summary before reset
      const summary = cacheManager.getClearSummary();
      console.log('Items to clear:', summary.itemsToClear);
      console.log('Items to preserve:', summary.itemsToPreserve);
      
      // Perform reset
      await cacheManager.resetAppData({
        clearServiceWorker: true,
        clearIndexedDB: true,
        clearCookies: false, // Keep auth cookies
        preserveAuth: true,
      });
      
      toast({
        title: "App Data Reset",
        description: "Filters and cache cleared successfully. Your saved quotes are preserved.",
      });
      
      // Close modal
      onOpenChange(false);
      
      // Reload page after a short delay to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to reset app data:', error);
      toast({
        title: "Reset Failed",
        description: "There was an error resetting app data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertDialogTitle>Reset App Data</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <div className="text-sm text-gray-600">
              This will reset the application to a clean state while preserving your important data.
            </div>
            
            <div className="border-l-4 border-amber-500 bg-amber-50 p-3 rounded-r">
              <div className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-amber-900 mb-1">What will be cleared:</div>
                  <ul className="space-y-1 text-amber-800">
                    <li>• All filters and search preferences</li>
                    <li>• Cached pricing data</li>
                    <li>• Service worker cache</li>
                    <li>• Temporary session data</li>
                    <li>• Old authentication tokens</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 bg-green-50 p-3 rounded-r">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-green-900 mb-1">What will be preserved:</div>
                  <ul className="space-y-1 text-green-800">
                    <li>• All saved quotes (stored in database)</li>
                    <li>• Theme preferences</li>
                    <li>• User account settings</li>
                    <li>• Quote history</li>
                    <li>• Customer data</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-2 pt-2">
              <Database className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Note:</span> Your saved quotes are stored securely 
                in the database and will <span className="font-semibold">not</span> be affected 
                by this reset.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={isResetting}
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
          >
            {isResetting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset App Data
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Reset button component that can be placed anywhere
export const ResetAppDataButton: React.FC<{
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}> = ({ variant = 'outline', size = 'default', className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowModal(true)}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset App Data
      </Button>
      
      <ResetAppDataModal
        isOpen={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
};