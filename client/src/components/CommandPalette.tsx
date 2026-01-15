import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { SiShopify } from 'react-icons/si';
import odooLogoPath from '@assets/Odoo_idrS-IC4Vn_0_1768250561474.jpeg';
import { useAppUsage } from '@/hooks/useAppUsage';
import { useAuth } from '@/hooks/useAuth';
import { queryClient } from '@/lib/queryClient';
import { resetAppData } from '@/lib/cache';
import {
  DashboardIcon,
  QuickQuotesIcon,
  ClientsIcon,
  ReportsIcon,
  CalendarIcon,
  PriceListIcon,
  SavedQuotesIcon,
  CalculatorIcon,
  MarketPricesIcon,
  ShippingIcon,
  ShippingLabelsIcon,
  ProductLabelsIcon,
  CrmJourneyIcon,
  ObjectionsIcon,
  EmailIcon,
  SparkleIcon,
  IntegrationsIcon,
  ProductMappingIcon,
  UsersIcon,
  ActivityIcon,
  DatabaseIcon,
  PdfIcon,
  ClockIcon,
  RefreshIcon,
  LogoutIcon,
} from '@/components/HandDrawnIcons';

type IconComponent = React.FC<{ className?: string }>;

export const OdooIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img src={odooLogoPath} alt="Odoo" className={className} style={{ objectFit: 'contain' }} />
);

export { QuickQuotesIcon, SavedQuotesIcon, PdfIcon as PdfSettingsIcon };

interface NavItem {
  path: string;
  icon: IconComponent;
  label: string;
  keywords?: string[];
  adminOnly?: boolean;
  iconBg?: string;
  iconColor?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', icon: DashboardIcon, label: 'Dashboard', keywords: ['home', 'main', 'overview'], iconBg: '#DDEBF1', iconColor: '#0C6E99' },
  { path: '/quick-quotes', icon: QuickQuotesIcon, label: 'QuickQuotes', keywords: ['quote', 'estimate', 'pricing'], iconBg: '#FAEBDD', iconColor: '#D9730B' },
  { path: '/clients', icon: ClientsIcon, label: 'Clients', keywords: ['customers', 'contacts', 'database'], iconBg: '#EAE3F2', iconColor: '#693FA5' },
  { path: '/reports', icon: ReportsIcon, label: 'Reports', keywords: ['analytics', 'reports', 'dashboard', 'sales', 'metrics', 'insights'], iconBg: '#DDEDEA', iconColor: '#0E7B6C' },
  { path: '/calendar', icon: CalendarIcon, label: 'Calendar', keywords: ['calendar', 'tasks', 'events', 'schedule', 'google', 'meetings'], iconBg: '#FBE4E3', iconColor: '#E03D3E' },
  { path: '/price-list', icon: PriceListIcon, label: 'Price List', keywords: ['prices', 'costs', 'rates'], iconBg: '#FBF3DA', iconColor: '#DFAB00' },
  { path: '/saved-quotes', icon: SavedQuotesIcon, label: 'Saved Quotes', keywords: ['history', 'saved', 'previous'], iconBg: '#F4DFEB', iconColor: '#AD1972' },
  { path: '/area-pricer', icon: CalculatorIcon, label: 'SqM Calculator', keywords: ['area', 'square meter', 'calculate'], iconBg: '#EBECED', iconColor: '#878682' },
  { path: '/competitor-pricing', icon: MarketPricesIcon, label: 'Market Prices', keywords: ['competitors', 'market', 'comparison'], iconBg: '#DDEDEA', iconColor: '#0E7B6C' },
  { path: '/shipping-calculator', icon: ShippingIcon, label: 'Shipping', keywords: ['delivery', 'freight', 'transport'], iconBg: '#E5E1DF', iconColor: '#64473A' },
  { path: '/shipping-labels', icon: ShippingLabelsIcon, label: 'Shipping Labels', keywords: ['labels', 'packages', 'shipment'], iconBg: '#E5E1DF', iconColor: '#64473A' },
  { path: '/product-labels', icon: ProductLabelsIcon, label: 'Product Labels', keywords: ['tags', 'stickers', 'product'], iconBg: '#FAEBDD', iconColor: '#D9730B' },
  { path: '/crm-journey', icon: CrmJourneyIcon, label: 'CRM Journey', keywords: ['pipeline', 'sales', 'customers', 'conversion', 'samples', 'swatches'], iconBg: '#EAE3F2', iconColor: '#693FA5' },
  { path: '/objections', icon: ObjectionsIcon, label: 'Objections', keywords: ['objections', 'issues', 'blockers', 'concerns', 'problems'], iconBg: '#FBE4E3', iconColor: '#E03D3E' },
  { path: '/email-app', icon: EmailIcon, label: 'Email Studio', keywords: ['email', 'templates', 'mail', 'compose', 'send'], adminOnly: true, iconBg: '#DDEBF1', iconColor: '#0C6E99' },
  { path: '/email-insights', icon: SparkleIcon, label: 'Email Intelligence', keywords: ['ai', 'insights', 'promises', 'followup', 'sales', 'opportunities', 'reminders'], iconBg: '#FBF3DA', iconColor: '#DFAB00' },
  { path: '/integrations', icon: IntegrationsIcon, label: 'Integrations', keywords: ['gmail', 'calendar', 'odoo', 'connect', 'settings', 'google'], adminOnly: true, iconBg: '#EBECED', iconColor: '#878682' },
  { path: '/product-mapping', icon: ProductMappingIcon, label: 'Product Mapping', keywords: ['map', 'category', 'type', 'size', 'sqm', 'fix', 'unmapped'], adminOnly: true, iconBg: '#F4DFEB', iconColor: '#AD1972' },
  { path: '/shopify-settings', icon: SiShopify, label: 'Shopify', keywords: ['shopify', 'orders', 'ecommerce', 'integration'], adminOnly: true, iconBg: '#DDEDEA', iconColor: '#0E7B6C' },
  { path: '/odoo-settings', icon: OdooIcon, label: 'Odoo', keywords: ['odoo', 'erp', 'sync', 'partners', 'integration'], adminOnly: true, iconBg: '#EAE3F2', iconColor: '#693FA5' },
  { path: '/admin', icon: UsersIcon, label: 'Users', keywords: ['admin', 'management', 'roles'], adminOnly: true, iconBg: '#DDEBF1', iconColor: '#0C6E99' },
  { path: '/activity-logs', icon: ActivityIcon, label: 'Activity', keywords: ['logs', 'history', 'audit'], adminOnly: true, iconBg: '#EBECED', iconColor: '#878682' },
  { path: '/product-pricing-management', icon: DatabaseIcon, label: 'Products', keywords: ['inventory', 'catalog', 'items'], adminOnly: true, iconBg: '#FAEBDD', iconColor: '#D9730B' },
  { path: '/pdf-settings', icon: PdfIcon, label: 'PDF Settings', keywords: ['pdf', 'export', 'documents'], adminOnly: true, iconBg: '#FBE4E3', iconColor: '#E03D3E' },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { trackUsage, getRecentApps } = useAppUsage();
  
  const isAdmin = (user as any)?.role === 'admin';
  const recentPaths = getRecentApps(5);

  const handleSelect = useCallback((path: string) => {
    trackUsage(path);
    navigate(path);
    onOpenChange(false);
  }, [navigate, onOpenChange, trackUsage]);

  const handleLogout = useCallback(() => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/api/logout';
  }, []);

  const handleResetCache = useCallback(() => {
    resetAppData({ whitelistKeys: ['theme', '4s-app-usage-data'] });
    onOpenChange(false);
  }, [onOpenChange]);

  const filteredItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);
  const recentItems = filteredItems.filter(item => recentPaths.includes(item.path));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border-0 shadow-2xl">
        <CommandInput placeholder="Search apps, commands..." className="h-12" data-testid="command-input" />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          {recentItems.length > 0 && (
            <CommandGroup heading="Recent">
              {recentItems.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={`recent-${item.path}`}
                    onSelect={() => handleSelect(item.path)}
                    className="flex items-center gap-3 py-3 cursor-pointer"
                    data-testid={`cmd-recent-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                    </div>
                    <ClockIcon className="ml-auto h-3 w-3 text-gray-400" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          <CommandGroup heading="Apps">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.path}
                  onSelect={() => handleSelect(item.path)}
                  className="flex items-center gap-3 py-3 cursor-pointer"
                  data-testid={`cmd-app-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                  </div>
                  {item.adminOnly && (
                    <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={handleResetCache}
              className="flex items-center gap-3 py-3 cursor-pointer"
              data-testid="cmd-reset-cache"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <RefreshIcon className="h-4 w-4 text-blue-600" />
              </div>
              <p className="font-medium">Reset App Cache</p>
            </CommandItem>
            <CommandItem
              onSelect={handleLogout}
              className="flex items-center gap-3 py-3 cursor-pointer"
              data-testid="cmd-logout"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <LogoutIcon className="h-4 w-4 text-red-600" />
              </div>
              <p className="font-medium">Log Out</p>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        setOpen(true);
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { open, setOpen };
}
