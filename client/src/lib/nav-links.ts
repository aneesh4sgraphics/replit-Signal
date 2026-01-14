import { 
  Calculator, 
  Database, 
  Users, 
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  Tag,
  Target,
  FlaskConical,
  Palette,
  Activity,
  Mail,
  AlertTriangle,
  Calendar,
  FileText,
  Settings,
  Wrench,
  type LucideIcon
} from "lucide-react";
import { QuickQuotesIcon, SavedQuotesIcon } from "@/components/CommandPalette";

export interface NavLink {
  path: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
}

export const primaryApps: NavLink[] = [
  { path: '/quick-quotes', icon: QuickQuotesIcon, label: 'QuickQuotes', description: 'Create quotes' },
  { path: '/price-list', icon: DollarSign, label: 'Price List', description: 'View pricing' },
  { path: '/saved-quotes', icon: SavedQuotesIcon, label: 'Saved Quotes', description: 'Past quotes' },
  { path: '/clients', icon: Users, label: 'Clients', description: 'Customer database' },
  { path: '/sales-analytics', icon: TrendingUp, label: 'Sales Charts', description: 'Analytics' },
  { path: '/area-pricer', icon: Calculator, label: 'SqM Calculator', description: 'Area pricing' },
  { path: '/competitor-pricing', icon: TrendingUp, label: 'Market Prices', description: 'Competition' },
  { path: '/shipping-calculator', icon: Truck, label: 'Shipping', description: 'Calculate shipping' },
  { path: '/shipping-labels', icon: Package, label: 'Shipping Labels', description: 'Print labels' },
  { path: '/product-labels', icon: Tag, label: 'Product Labels', description: 'Barcode labels' },
  { path: '/crm-samples', icon: FlaskConical, label: 'Samples', description: 'Sample requests' },
  { path: '/crm-swatches', icon: Palette, label: 'Swatches', description: 'Swatchbook tracking' },
  { path: '/email-app', icon: Mail, label: 'Email Studio', description: 'Email campaigns' },
  { path: '/crm-journey', icon: Target, label: 'CRM Journey', description: 'Customer stages' },
  { path: '/calendar', icon: Calendar, label: 'Calendar', description: 'Schedule' },
  { path: '/objections', icon: AlertTriangle, label: 'Objections', description: 'Handle objections' },
];

export const adminApps: NavLink[] = [
  { path: '/admin', icon: Users, label: 'Users', description: 'User management' },
  { path: '/admin/config', icon: Settings, label: 'Config', description: 'System configuration' },
  { path: '/admin/setup', icon: Wrench, label: 'Setup Wizard', description: 'Guided setup' },
  { path: '/activity-logs', icon: Activity, label: 'Activity', description: 'Activity logs' },
  { path: '/product-pricing-management', icon: Database, label: 'Products', description: 'Product database' },
  { path: '/pdf-settings', icon: FileText, label: 'PDF Settings', description: 'PDF customization' },
  { path: '/now-mode-admin', icon: Target, label: 'NOW Mode Admin', description: 'NOW Mode analytics' },
];
