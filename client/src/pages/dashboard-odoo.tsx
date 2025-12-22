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
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--contra-orange)' }}>
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--contra-teal)' }}>
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+{stats.quotesThisMonth}</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--contra-black)' }}>{stats.totalQuotes}</div>
            <div className="text-sm" style={{ color: 'var(--contra-gray)' }}>Total Quotes</div>
          </div>

          <div className="contra-card group" data-testid="stat-revenue">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--contra-teal)' }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--contra-black)' }}>
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: 'var(--contra-gray)' }}>Monthly Revenue</div>
          </div>

          <div className="contra-card group" data-testid="stat-customers">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--contra-yellow)' }}>
                <Users className="h-5 w-5" style={{ color: 'var(--contra-black)' }} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--contra-black)' }}>
              {Number(stats.totalCustomers).toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: 'var(--contra-gray)' }}>Customers</div>
          </div>

          <div className="contra-card group" data-testid="stat-products">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--contra-red)' }}>
                <Package className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--contra-black)' }}>{stats.totalProducts}</div>
            <div className="text-sm" style={{ color: 'var(--contra-gray)' }}>Products</div>
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
          {mainApps.map((app, index) => {
            const Icon = app.icon;
            const colors = ['var(--contra-orange)', 'var(--contra-teal)', 'var(--contra-yellow)', 'var(--contra-red)'];
            const color = colors[index % colors.length];
            const isYellow = index % colors.length === 2;
            return (
              <Link 
                key={app.path} 
                href={app.path}
                className="contra-card group block transition-all hover:scale-[1.02]"
                data-testid={`link-${app.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color }}>
                    <Icon className={`h-6 w-6 ${isYellow ? 'text-[#1A1819]' : 'text-white'}`} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#B7AEA3] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold mb-1 text-[#1A1819] dark:text-white">{app.title}</h3>
                <p className="text-sm line-clamp-2 text-[#B7AEA3]">{app.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--contra-teal)' }}>
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--contra-black)' }}>Admin Tools</h2>
              <p className="text-sm" style={{ color: 'var(--contra-gray)' }}>Manage system settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {adminApps.map((app) => {
              const Icon = app.icon;
              return (
                <Link 
                  key={app.path} 
                  href={app.path}
                  className="contra-card-teal group block transition-all hover:scale-[1.02]"
                  data-testid={`link-admin-${app.title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--contra-teal)' }}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: 'var(--contra-teal)' }}>Admin</span>
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--contra-black)' }}>{app.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--contra-gray)' }}>{app.description}</p>
                  <div className="mt-4 pt-4 border-t flex items-center gap-1 text-sm font-medium" style={{ borderColor: 'var(--contra-teal)', color: 'var(--contra-teal)' }}>
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
        <div className="contra-card-orange" style={{ backgroundColor: 'var(--contra-orange)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">You're doing great!</h3>
              <p className="text-white/80 text-sm">
                {stats.activityCount} actions logged. Keep up the momentum!
              </p>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.quotesThisMonth}</div>
                <div className="text-xs text-white/70">This Month</div>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalCustomers}</div>
                <div className="text-xs text-white/70">Customers</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
