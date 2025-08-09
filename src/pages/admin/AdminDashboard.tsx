import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown,
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Eye,
  RefreshCw,
  Star,
  Target,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  Filter,
  Download
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import TodaysSpecial from '../../components/Admin/TodaysSpecial';
import { apiGet, getAuthHeaders, API_CONFIG } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyOrders: number;
  weeklyRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  revenueGrowth: number;
  orderGrowth: number;
  completionRate: number;
}

interface RecentOrder {
  order_id: number;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    weeklyOrders: 0,
    weeklyRevenue: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueGrowth: 0,
    orderGrowth: 0,
    completionRate: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { auth } = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      fetchDashboardData();
    }
  }, [auth.isAuthenticated, auth.token]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) return;
    
    const interval = setInterval(() => {
      
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [auth.isAuthenticated, auth.token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
  
      
      const [ordersRes, productsRes] = await Promise.all([
        apiGet(API_CONFIG.ENDPOINTS.ADMIN_ORDERS, {
          headers: getAuthHeaders(auth.token!)
        }),
        apiGet(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, {
          headers: getAuthHeaders(auth.token!)
        })
      ]);



      if (ordersRes.ok && productsRes.ok) {
        const orders = await ordersRes.json();
        const products = await productsRes.json();



        // Date calculations
        const now = new Date();
        const today = now.toDateString();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Filter orders by date
        const todayOrders = orders.filter((order: any) => 
          new Date(order.created_at).toDateString() === today
        );
        const weekOrders = orders.filter((order: any) => 
          new Date(order.created_at) >= weekAgo
        );
        const monthOrders = orders.filter((order: any) => 
          new Date(order.created_at) >= monthAgo
        );
        const lastWeekOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.created_at);
          return orderDate >= lastWeek && orderDate < weekAgo;
        });

        // Calculate revenue with proper number conversion and validation
        const safeParseAmount = (amount: any): number => {
          if (amount === null || amount === undefined) return 0;
          const parsed = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
          return isNaN(parsed) ? 0 : parsed;
        };

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + safeParseAmount(order.total_amount), 0);
        const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + safeParseAmount(order.total_amount), 0);
        const weeklyRevenue = weekOrders.reduce((sum: number, order: any) => sum + safeParseAmount(order.total_amount), 0);
        const monthlyRevenue = monthOrders.reduce((sum: number, order: any) => sum + safeParseAmount(order.total_amount), 0);
        const lastWeekRevenue = lastWeekOrders.reduce((sum: number, order: any) => sum + safeParseAmount(order.total_amount), 0);



        // Calculate growth rates with proper validation
        const revenueGrowth = lastWeekRevenue > 0 ? 
          ((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 
          weeklyRevenue > 0 ? 100 : 0;
        
        const orderGrowth = lastWeekOrders.length > 0 ? 
          ((weekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100 : 
          weekOrders.length > 0 ? 100 : 0;

        // Calculate other metrics with validation
        const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
        const completedOrders = orders.filter((order: any) => order.status === 'delivered').length;
        const completionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;
        const averageOrderValue = orders.length > 0 && totalRevenue > 0 ? totalRevenue / orders.length : 0;



        // Get top products from actual data
        const topProducts = products.slice(0, 3).map((product: any) => ({
          name: product.name,
          sales: 0, // Will be calculated from actual order data
          revenue: 0 // Will be calculated from actual order data
        }));

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          pendingOrders,
          todayOrders: todayOrders.length,
          todayRevenue,
          weeklyOrders: weekOrders.length,
          weeklyRevenue,
          monthlyOrders: monthOrders.length,
          monthlyRevenue,
          averageOrderValue,
          topProducts,
          revenueGrowth,
          orderGrowth,
          completionRate
        });

        setRecentOrders(orders.slice(0, 5));
        setLastRefresh(new Date());
        

      } else {
        const errorMsg = `Failed to fetch data: Orders ${ordersRes.status}, Products ${productsRes.status}`;
        setError(errorMsg);
        console.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMsg);
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'preparing':
        return 'text-orange-600 bg-orange-100';
      case 'out_for_delivery':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    // Handle edge cases
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'KSh 0';
    }
    
    try {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount).replace('KES', 'KSh');
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `KSh ${amount.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">Welcome back! Here's your business overview</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-4 lg:mt-0">
            <div className="text-xs sm:text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
                <span className="sm:hidden">{loading ? '...' : '↻'}</span>
              </button>
              <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">↓</span>
              </button>
              <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">⚙</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start sm:items-center gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-red-800 font-medium text-sm sm:text-base">Error loading dashboard data</p>
              <p className="text-red-600 text-xs sm:text-sm truncate">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="ml-auto px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs sm:text-sm flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Revenue</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 truncate">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(stats.revenueGrowth)}
                  <span className="text-blue-100 text-xs sm:text-sm ml-1 truncate">
                    {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% this week
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-white bg-opacity-20 rounded-full flex-shrink-0">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold mt-1">{stats.totalOrders.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(stats.orderGrowth)}
                  <span className="text-green-100 text-sm ml-1">
                    {stats.orderGrowth > 0 ? '+' : ''}{stats.orderGrowth.toFixed(1)}% this week
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Order Value</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.averageOrderValue)}</p>
                <div className="flex items-center mt-2">
                  <Target className="w-4 h-4 text-purple-100" />
                  <span className="text-purple-100 text-sm ml-1">Per transaction</span>
                </div>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold mt-1">{stats.completionRate.toFixed(1)}%</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-orange-100" />
                  <span className="text-orange-100 text-sm ml-1">Orders delivered</span>
                </div>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Time-based Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Performance */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Performance</h3>
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Orders</span>
                <span className="text-2xl font-bold text-gray-900">{stats.todayOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress vs Weekly Avg</span>
                  <span className="text-gray-700">{((stats.todayOrders / (stats.weeklyOrders / 7)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((stats.todayOrders / (stats.weeklyOrders / 7)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Orders</span>
                <span className="text-2xl font-bold text-gray-900">{stats.weeklyOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(stats.weeklyRevenue)}</span>
              </div>
            <div className="flex items-center justify-between">
                <span className="text-gray-600">Growth</span>
                <div className="flex items-center">
                  {getGrowthIcon(stats.revenueGrowth)}
                  <span className={`font-semibold ml-1 ${getGrowthColor(stats.revenueGrowth)}`}>
                    {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              <Zap className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Orders</span>
                <span className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Products</span>
                <span className="text-2xl font-bold text-gray-900">{stats.totalProducts}</span>
              </div>
            <div className="flex items-center justify-between">
                <span className="text-gray-600">Monthly Orders</span>
                <span className="text-2xl font-bold text-gray-900">{stats.monthlyOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link
                to="/admin/orders"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                  View all <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                    <div key={order.order_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">#{order.order_id}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="font-semibold text-gray-900">
                          {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
          <Link
            to="/admin/products"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Manage <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {stats.topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
              </div>
              )}
            </div>
          </div>
        </div>

                {/* Enhanced Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Link
              to="/admin/products"
              className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group border border-blue-200"
          >
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h3 className="text-lg font-semibold text-blue-900">Manage Products</h3>
                  <p className="text-sm text-blue-700">Add, edit, or remove menu items</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all group border border-green-200"
          >
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors">
                  <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h3 className="text-lg font-semibold text-green-900">View Orders</h3>
                  <p className="text-sm text-green-700">Process and track customer orders</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-medium">Payment options</span> are now available in the sidebar for easy access.
            </p>
          </div>
        </div>


      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

