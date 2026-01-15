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
import { QuickQuotesIcon, SavedQuotesIcon, PriceListIcon, SalesChartsIcon } from "@/components/HandDrawnIcons";

export interface NavLink {
  path: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  iconBg?: string;
  iconColor?: string;
}

export const primaryApps: NavLink[] = [
  { path: '/quick-quotes', icon: QuickQuotesIcon, label: 'QuickQuotes', description: 'Create quotes', iconBg: '#D9730B', iconColor: '#FFFFFF' },
  { path: '/price-list', icon: PriceListIcon, label: 'Price List', description: 'View pricing', iconBg: '#DFAB00', iconColor: '#37352F' },
  { path: '/saved-quotes', icon: SavedQuotesIcon, label: 'Saved Quotes', description: 'Past quotes', iconBg: '#AD1972', iconColor: '#FFFFFF' },
  { path: '/clients', icon: Users, label: 'Clients', description: 'Customer database', iconBg: '#693FA5', iconColor: '#FFFFFF' },
  { path: '/sales-analytics', icon: SalesChartsIcon, label: 'Sales Charts', description: 'Analytics', iconBg: '#0E7B6C', iconColor: '#FFFFFF' },
  { path: '/area-pricer', icon: Calculator, label: 'SqM Calculator', description: 'Area pricing', iconBg: '#0C6E99', iconColor: '#FFFFFF' },
  { path: '/competitor-pricing', icon: TrendingUp, label: 'Market Prices', description: 'Competition', iconBg: '#E03D3E', iconColor: '#FFFFFF' },
  { path: '/shipping-calculator', icon: Truck, label: 'Shipping', description: 'Calculate shipping', iconBg: '#64473A', iconColor: '#FFFFFF' },
  { path: '/shipping-labels', icon: Package, label: 'Shipping Labels', description: 'Print labels', iconBg: '#D9730B', iconColor: '#FFFFFF' },
  { path: '/product-labels', icon: Tag, label: 'Product Labels', description: 'Barcode labels', iconBg: '#DFAB00', iconColor: '#37352F' },
  { path: '/crm-samples', icon: FlaskConical, label: 'Samples', description: 'Sample requests', iconBg: '#AD1972', iconColor: '#FFFFFF' },
  { path: '/crm-swatches', icon: Palette, label: 'Swatches', description: 'Swatchbook tracking', iconBg: '#693FA5', iconColor: '#FFFFFF' },
  { path: '/email-app', icon: Mail, label: 'Email Studio', description: 'Email campaigns', iconBg: '#0E7B6C', iconColor: '#FFFFFF' },
  { path: '/crm-journey', icon: Target, label: 'CRM Journey', description: 'Customer stages', iconBg: '#0C6E99', iconColor: '#FFFFFF' },
  { path: '/calendar', icon: Calendar, label: 'Calendar', description: 'Schedule', iconBg: '#E03D3E', iconColor: '#FFFFFF' },
  { path: '/objections', icon: AlertTriangle, label: 'Objections', description: 'Handle objections', iconBg: '#64473A', iconColor: '#FFFFFF' },
];

export const adminApps: NavLink[] = [
  { path: '/admin', icon: Users, label: 'Users', description: 'User management' },
  { path: '/admin/config', icon: Settings, label: 'Config', description: 'System configuration' },
  { path: '/admin/setup', icon: Wrench, label: 'Setup Wizard', description: 'Guided setup' },
  { path: '/activity-logs', icon: Activity, label: 'Activity', description: 'Activity logs' },
  { path: '/product-pricing-management', icon: Database, label: 'Products', description: 'Product database' },
  { path: '/pdf-settings', icon: FileText, label: 'PDF Settings', description: 'PDF customization' },
];
