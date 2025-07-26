import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  FileText, 
  Database, 
  Users, 
  BarChart3, 
  Package,
  Truck,
  Settings,
  Download,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import OdooCard from "@/components/OdooCard";

interface AppItem {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  adminOnly?: boolean;
}

const mainApps: AppItem[] = [
  {
    title: "QuickQuotes",
    description: "Generate instant quotes with pricing calculations",
    path: "/quick-quotes",
    icon: Calculator,
    color: "bg-blue-500"
  },
  {
    title: "Price List",
    description: "View and export comprehensive pricing tables",
    path: "/price-list",
    icon: FileText,
    color: "bg-green-500"
  },
  {
    title: "Saved Quotes",
    description: "Manage and track all generated quotes",
    path: "/saved-quotes",
    icon: BarChart3,
    color: "bg-purple-500"
  }
];

const adminApps: AppItem[] = [
  {
    title: "Product Pricing",
    description: "Manage product catalog and pricing data",
    path: "/product-pricing-management",
    icon: Database,
    color: "bg-orange-500",
    adminOnly: true
  },
  {
    title: "Customers",
    description: "Customer database management",
    path: "/customers",
    icon: Users,
    color: "bg-indigo-500",
    adminOnly: true
  },
  {
    title: "Administration",
    description: "System settings and user management",
    path: "/admin",
    icon: Settings,
    color: "bg-gray-500",
    adminOnly: true
  }
];

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <OdooCard title="Authentication Required">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please log in to access your dashboard</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Login with Replit
          </Button>
        </div>
      </OdooCard>
    );
  }

  const firstName = ((user as any)?.firstName || (user as any)?.email?.split('@')[0] || "User")
    .charAt(0).toUpperCase() + ((user as any)?.firstName || (user as any)?.email?.split('@')[0] || "User").slice(1);
  
  const isAdmin = (user as any)?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <OdooCard>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back, {firstName}!
            </h1>
            <p className="text-gray-600">
              Today is {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-purple-700 border-purple-200">
              {(user as any)?.role === 'admin' ? 'Administrator' : 'Employee'}
            </Badge>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </OdooCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OdooCard>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Quotes</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </OdooCard>

        <OdooCard>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">$45.2K</p>
            </div>
          </div>
        </OdooCard>

        <OdooCard>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">94%</p>
            </div>
          </div>
        </OdooCard>
      </div>

      {/* Main Applications */}
      <OdooCard title="Applications" description="Core business tools and calculators">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainApps.map((app) => {
            const Icon = app.icon;
            return (
              <Link key={app.path} href={app.path}>
                <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center mb-3">
                    <div className={`p-2 ${app.color} rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="ml-3 font-medium text-gray-900 group-hover:text-purple-700">
                      {app.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{app.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </OdooCard>

      {/* Admin Tools */}
      {isAdmin && (
        <OdooCard title="Administration Tools" description="System management and configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminApps.map((app) => {
              const Icon = app.icon;
              return (
                <Link key={app.path} href={app.path}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center mb-3">
                      <div className={`p-2 ${app.color} rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="ml-3 font-medium text-gray-900 group-hover:text-purple-700">
                        {app.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{app.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </OdooCard>
      )}

      {/* Recent Activity */}
      <OdooCard title="Recent Activity" description="Latest system updates and changes">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-1 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Quote #A1B2C3 sent to ABC Corp</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-200">Completed</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-1 bg-blue-100 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Price list updated for Graffiti products</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-700 border-blue-200">Updated</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-1 bg-purple-100 rounded-full">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">New customer added: XYZ Industries</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <Badge variant="outline" className="text-purple-700 border-purple-200">New</Badge>
          </div>
        </div>
      </OdooCard>
    </div>
  );
}