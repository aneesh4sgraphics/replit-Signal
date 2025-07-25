import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calculator, FileText, Database, LogOut, Users, Package, Truck, BarChart3, Activity, Shield, Settings, Download } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  // Automatic logout at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const timeUntilMidnight = midnight.getTime() - now.getTime();
      
      setTimeout(() => {
        window.location.href = '/api/logout';
      }, timeUntilMidnight);
    };

    if (user) {
      checkMidnight();
    }
  }, [user]);

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/download-data');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `4sgraphics-data-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Authentication Required</h1>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Login with Replit
          </Button>
        </div>
      </div>
    );
  }

  // Extract first name
  const firstName = ((user as any)?.firstName || (user as any)?.email?.split('@')[0] || "User")
    .charAt(0).toUpperCase() + ((user as any)?.firstName || (user as any)?.email?.split('@')[0] || "User").slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notion-style Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">4S</span>
            </div>
            <span className="text-sm font-medium text-gray-800">4S Graphics Employee Portal</span>
          </div>
          <Button
            onClick={() => window.location.href = '/api/logout'}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-medium bg-transparent border-none shadow-none"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
          <p className="text-sm text-gray-500 mb-6">Welcome back, {firstName}! Here's a summary of your tools and activity.</p>
        </div>

        {/* Applications Block */}
        <div className="border border-gray-200 bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Applications
          </h2>
          <p className="text-sm text-gray-500 mb-4">Your core business tools</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* QuickQuotes */}
            <Link href="/quote-calculator">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-800">QuickQuotes</span>
                </div>
                <p className="text-sm text-gray-500">Generate product quotes quickly</p>
              </div>
            </Link>

            {/* Price List */}
            <Link href="/price-list">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-800">Price List</span>
                </div>
                <p className="text-sm text-gray-500">View product pricing tiers</p>
              </div>
            </Link>

            {/* SqM Calculator */}
            <Link href="/area-pricer">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-800">SqM Calculator</span>
                </div>
                <p className="text-sm text-gray-500">Calculate area-based pricing</p>
              </div>
            </Link>

            {/* Saved Quotes */}
            <Link href="/saved-quotes">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-gray-800">Saved Quotes</span>
                </div>
                <p className="text-sm text-gray-500">View and manage saved quotes</p>
              </div>
            </Link>

            {/* ComIntel */}
            <Link href="/competitor-pricing">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-800">ComIntel</span>
                </div>
                <p className="text-sm text-gray-500">Competitor pricing intelligence</p>
              </div>
            </Link>

            {/* Shipping Calculator */}
            <Link href="/shipping-calculator">
              <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="h-5 w-5 text-cyan-600" />
                  <span className="font-medium text-gray-800">Shipping Calculator</span>
                </div>
                <p className="text-sm text-gray-500">Calculate shipping costs</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Admin Tools Block - Only for admin users */}
        {(user as any)?.role === 'admin' && (
          <div className="border border-gray-200 bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Admin Tools
            </h2>
            <p className="text-sm text-gray-500 mb-4">Administrative functions and data management</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Admin Panel */}
              <Link href="/admin">
                <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-800">Admin Panel</span>
                  </div>
                  <p className="text-sm text-gray-500">User management and settings</p>
                </div>
              </Link>

              {/* Customer Management */}
              <Link href="/customer-management">
                <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-800">Customer Management</span>
                  </div>
                  <p className="text-sm text-gray-500">Manage customer database</p>
                </div>
              </Link>

              {/* ProductPricing Management */}
              <Link href="/product-pricing-management">
                <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-800">ProductPricing Management</span>
                  </div>
                  <p className="text-sm text-gray-500">Manage product pricing data</p>
                </div>
              </Link>

              {/* Download Data */}
              <div 
                onClick={handleDownloadData}
                className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Download className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-gray-800">Download Data</span>
                </div>
                <p className="text-sm text-gray-500">Export all database files</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Block */}
        <div className="border border-gray-200 bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Quick Stats
          </h2>
          <p className="text-sm text-gray-500 mb-4">System status and recent activity</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-md">
              <div className="text-2xl font-semibold text-gray-800 mb-1">Active</div>
              <div className="text-sm text-gray-500">System Status</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-md">
              <div className="text-2xl font-semibold text-gray-800 mb-1">6</div>
              <div className="text-sm text-gray-500">Available Tools</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-md">
              <div className="text-2xl font-semibold text-gray-800 mb-1">Ready</div>
              <div className="text-sm text-gray-500">Database</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}