import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ExternalLink, Mail, Calendar, Database, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatus {
  odoo: { connected: boolean; error: string | null };
  gmail: { connected: boolean; error: string | null };
  calendar: { connected: boolean; error: string | null };
}

interface ConnectionPromptProps {
  onDismiss?: () => void;
}

export function ConnectionPrompt({ onDismiss }: ConnectionPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const { data: status, isLoading, refetch } = useQuery<ConnectionStatus>({
    queryKey: ['/api/integrations/status'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && status) {
      const hasDisconnected = !status.odoo.connected || !status.gmail.connected || !status.calendar.connected;
      if (hasDisconnected && !dismissed) {
        const lastDismissed = localStorage.getItem('connectionPromptDismissed');
        const lastDismissedTime = lastDismissed ? parseInt(lastDismissed, 10) : 0;
        const hoursSinceDismissed = (Date.now() - lastDismissedTime) / (1000 * 60 * 60);
        
        if (hoursSinceDismissed > 24) {
          setShowDialog(true);
        }
      }
    }
  }, [status, isLoading, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowDialog(false);
    localStorage.setItem('connectionPromptDismissed', Date.now().toString());
    onDismiss?.();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading || !status) return null;

  const disconnectedServices = [];
  if (!status.odoo.connected) disconnectedServices.push('Odoo');
  if (!status.gmail.connected) disconnectedServices.push('Gmail');
  if (!status.calendar.connected) disconnectedServices.push('Google Calendar');

  if (disconnectedServices.length === 0) return null;

  const services = [
    {
      name: 'Odoo ERP',
      key: 'odoo' as const,
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Sync customers, products, and orders',
      connectUrl: null,
      isEnvVar: true,
    },
    {
      name: 'Gmail',
      key: 'gmail' as const,
      icon: Mail,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Send emails and track engagement',
      connectUrl: null,
      isIntegration: true,
    },
    {
      name: 'Google Calendar',
      key: 'calendar' as const,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Schedule follow-ups and meetings',
      connectUrl: null,
      isIntegration: true,
    },
  ];

  return (
    <Dialog open={showDialog} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-lg" data-testid="dialog-connection-prompt">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Connect Your Services
          </DialogTitle>
          <DialogDescription>
            Connect these services to unlock all coaching features. You use the same email for all services.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {services.map((service) => {
            const isConnected = status[service.key].connected;
            const error = status[service.key].error;
            const Icon = service.icon;

            return (
              <div
                key={service.key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  isConnected ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                )}
                data-testid={`connection-status-${service.key}`}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", isConnected ? "bg-green-100" : service.bgColor)}>
                    <Icon className={cn("h-5 w-5", isConnected ? "text-green-600" : service.color)} />
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {service.name}
                      {isConnected ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-amber-600 font-normal">Not connected</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isConnected ? 'Connected and ready' : service.description}
                    </div>
                  </div>
                </div>

                {!isConnected && (
                  <div className="text-xs text-muted-foreground">
                    {service.isEnvVar ? (
                      <span className="text-amber-600">Check settings</span>
                    ) : (
                      <span className="text-blue-600">Use Integrations panel</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <div className="font-medium text-blue-800 mb-1">How to connect:</div>
          <ul className="text-blue-700 space-y-1 text-xs">
            <li>• <strong>Gmail & Calendar:</strong> Click the Integrations panel in the sidebar</li>
            <li>• <strong>Odoo:</strong> Add your credentials in Settings → Odoo Connection</li>
          </ul>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-muted-foreground"
            data-testid="button-refresh-connections"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              data-testid="button-dismiss-connection-prompt"
            >
              Remind me later
            </Button>
            <Button
              onClick={handleDismiss}
              data-testid="button-got-it"
            >
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ConnectionStatusBanner() {
  const { data: status, isLoading } = useQuery<ConnectionStatus>({
    queryKey: ['/api/integrations/status'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !status) return null;

  const disconnectedCount = [
    !status.odoo.connected,
    !status.gmail.connected,
    !status.calendar.connected,
  ].filter(Boolean).length;

  if (disconnectedCount === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center justify-between mb-4" data-testid="banner-connection-status">
      <div className="flex items-center gap-2 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4" />
        <span>
          {disconnectedCount} service{disconnectedCount > 1 ? 's' : ''} not connected. 
          Some features may be limited.
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
        onClick={() => {
          localStorage.removeItem('connectionPromptDismissed');
          window.location.reload();
        }}
        data-testid="button-view-connections"
      >
        View
      </Button>
    </div>
  );
}

export function useConnectionStatus() {
  return useQuery<ConnectionStatus>({
    queryKey: ['/api/integrations/status'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}
