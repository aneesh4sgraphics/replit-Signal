import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  FileText, 
  Database, 
  Users, 
  BarChart3, 
  TrendingUp,
  Settings,
  AlertCircle,
  ArrowRight,
  DollarSign,
  Package,
  ClipboardList,
  Mail,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalQuotes: number;
  quotesThisMonth: number;
  monthlyRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  activityCount: number;
}

interface AppItem {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const mainApps: AppItem[] = [
  {
    title: "QuickQuotes",
    description: "Generate instant quotes with pricing calculations",
    path: "/quick-quotes",
    icon: Calculator
  },
  {
    title: "Price List",
    description: "View and export comprehensive pricing tables",
    path: "/price-list",
    icon: FileText
  },
  {
    title: "Saved Quotes",
    description: "Manage and track all generated quotes",
    path: "/saved-quotes",
    icon: BarChart3
  },
  {
    title: "Email",
    description: "Send and receive emails via Gmail",
    path: "/email",
    icon: Mail
  }
];

const adminApps: AppItem[] = [
  {
    title: "Product Pricing",
    description: "Manage product catalog and pricing data",
    path: "/product-pricing-management",
    icon: Database,
    adminOnly: true
  },
  {
    title: "Customers",
    description: "Customer database management",
    path: "/customers",
    icon: Users,
    adminOnly: true
  },
  {
    title: "Administration",
    description: "System settings and user management",
    path: "/admin",
    icon: Settings,
    adminOnly: true
  }
];

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="contra-card max-w-md text-center">
          <div className="contra-avatar-lg mx-auto mb-4 bg-gray-100">
            <AlertCircle className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Sign in required</h3>
          <p className="text-gray-500 mb-6">Please sign in to access your dashboard</p>
          <Button onClick={() => window.location.href = "/api/login"} className="contra-btn-primary">
            Sign in with Replit
          </Button>
        </div>
      </div>
    );
  }

  const firstName = ((user as any)?.firstName || (user as any)?.email?.split('@')[0] || "User")
    .charAt(0).toUpperCase() + ((user as any)?.firstName || (user as any)?.email?.split('@')[0] || "User").slice(1);
  
  const isAdmin = (user as any)?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back, {firstName}
          </h1>
          <p className="text-gray-500">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/quick-quotes">
            <Button className="contra-btn-primary" data-testid="button-new-quote">
              <Sparkles className="h-4 w-4" />
              New Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="contra-card group" data-testid="stat-quotes">
            <div className="flex items-center justify-between mb-4">
              <div className="stat-icon-box">
                <ClipboardList className="h-5 w-5 stat-icon" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+{stats.quotesThisMonth}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalQuotes}</div>
            <div className="text-sm text-gray-500">Total Quotes</div>
          </div>

          <div className="contra-card group" data-testid="stat-revenue">
            <div className="flex items-center justify-between mb-4">
              <div className="stat-icon-box">
                <DollarSign className="h-5 w-5 stat-icon" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Monthly Revenue</div>
          </div>

          <div className="contra-card group" data-testid="stat-customers">
            <div className="flex items-center justify-between mb-4">
              <div className="stat-icon-box">
                <Users className="h-5 w-5 stat-icon" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {Number(stats.totalCustomers).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Customers</div>
          </div>

          <div className="contra-card group" data-testid="stat-products">
            <div className="flex items-center justify-between mb-4">
              <div className="stat-icon-box">
                <Package className="h-5 w-5 stat-icon" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
            <div className="text-sm text-gray-500">Products</div>
          </div>
        </div>
      )}

      {/* Loading skeleton for stats */}
      {statsLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="contra-card">
              <div className="contra-skeleton h-10 w-10 rounded-xl mb-4" />
              <div className="contra-skeleton h-8 w-24 mb-2" />
              <div className="contra-skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Your most-used tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainApps.map((app) => {
            const Icon = app.icon;
            return (
              <Link 
                key={app.path} 
                href={app.path}
                className="contra-card-hover group block"
                data-testid={`link-${app.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="stat-icon-box">
                    <Icon className="h-5 w-5 stat-icon" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{app.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{app.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Tools</h2>
              <p className="text-sm text-gray-500">Manage system settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {adminApps.map((app) => {
              const Icon = app.icon;
              return (
                <Link 
                  key={app.path} 
                  href={app.path}
                  className="contra-card-hover group block border-2 border-transparent hover:border-gray-200"
                  data-testid={`link-admin-${app.title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="stat-icon-box">
                      <Icon className="h-5 w-5 stat-icon" />
                    </div>
                    <span className="contra-badge-dark">Admin</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{app.title}</h3>
                  <p className="text-sm text-gray-500">{app.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1 text-sm font-medium text-gray-900">
                    <span>Open</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Banner */}
      {stats && (
        <div className="contra-card bg-gray-900 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">You're doing great!</h3>
              <p className="text-gray-400 text-sm">
                {stats.activityCount} actions logged. Keep up the momentum!
              </p>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.quotesThisMonth}</div>
                <div className="text-xs text-gray-400">This Month</div>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalCustomers}</div>
                <div className="text-xs text-gray-400">Customers</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
