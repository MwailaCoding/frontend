import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet, getAuthHeaders, API_CONFIG } from '../../config/api';

// Cache for dashboard data
const dashboardCache = {
  data: null,
  timestamp: 0,
  ttl: 2 * 60 * 1000 // 2 minutes cache
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    weekOrders: 0,
    weekRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    lastWeekOrders: 0,
    lastWeekRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueGrowth: 0,
    orderGrowth: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();

  // Memoized calculations to avoid recalculating on every render
  const calculatedStats = useMemo(() => {
    if (!stats.totalOrders) return stats;

    const pendingOrders = stats.totalOrders - stats.completedOrders;
    const averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
    const completionRate = stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0;

    return {
      ...stats,
      pendingOrders,
      averageOrderValue,
      completionRate
    };
  }, [stats]);

  // Optimized data fetching with caching
  const fetchDashboardData = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Use cached data if still valid and not forcing refresh
    if (!force && dashboardCache.data && (now - dashboardCache.timestamp) < dashboardCache.ttl) {
      setStats(dashboardCache.data);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!auth.token) {
        setError('Authentication token missing. Please login again.');
        setLoading(false);
        return;
      }
      
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

        // Optimized date calculations
        const now = new Date();
        const today = now.toDateString();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Single pass through orders for better performance
        const orderStats = orders.reduce((acc: any, order: any) => {
          const orderDate = new Date(order.created_at);
          const orderAmount = parseFloat(order.total_amount) || 0;
          
          acc.totalAmount += orderAmount;
          acc.totalCount += 1;
          
          if (orderDate.toDateString() === today) {
            acc.todayAmount += orderAmount;
            acc.todayCount += 1;
          }
          
          if (orderDate >= weekAgo) {
            acc.weekAmount += orderAmount;
            acc.weekCount += 1;
          }
          
          if (orderDate >= monthAgo) {
            acc.monthAmount += orderAmount;
            acc.monthCount += 1;
          }
          
          if (orderDate >= lastWeek && orderDate < weekAgo) {
            acc.lastWeekAmount += orderAmount;
            acc.lastWeekCount += 1;
          }
          
          if (order.status === 'delivered') {
            acc.completedCount += 1;
          }
          
          return acc;
        }, {
          totalAmount: 0,
          totalCount: 0,
          todayAmount: 0,
          todayCount: 0,
          weekAmount: 0,
          weekCount: 0,
          monthAmount: 0,
          monthCount: 0,
          lastWeekAmount: 0,
          lastWeekCount: 0,
          completedCount: 0
        });

        const newStats = {
          totalOrders: orderStats.totalCount,
          totalProducts: products.length,
          totalRevenue: orderStats.totalAmount,
          todayOrders: orderStats.todayCount,
          todayRevenue: orderStats.todayAmount,
          weekOrders: orderStats.weekCount,
          weekRevenue: orderStats.weekAmount,
          monthOrders: orderStats.monthCount,
          monthRevenue: orderStats.monthAmount,
          lastWeekOrders: orderStats.lastWeekCount,
          lastWeekRevenue: orderStats.lastWeekAmount,
          completedOrders: orderStats.completedCount,
          averageOrderValue: orderStats.totalCount > 0 ? orderStats.totalAmount / orderStats.totalCount : 0,
          topProducts: products.slice(0, 3).map((product: any) => ({
            name: product.name,
            sales: 0,
            revenue: 0
          })),
          revenueGrowth: orderStats.lastWeekAmount > 0 ? 
            ((orderStats.weekAmount - orderStats.lastWeekAmount) / orderStats.lastWeekAmount) * 100 : 
            orderStats.weekAmount > 0 ? 100 : 0,
          orderGrowth: orderStats.lastWeekCount > 0 ? 
            ((orderStats.weekCount - orderStats.lastWeekCount) / orderStats.lastWeekCount) * 100 : 
            orderStats.weekCount > 0 ? 100 : 0,
          completionRate: orderStats.totalCount > 0 ? (orderStats.completedCount / orderStats.totalCount) * 100 : 0
        };

        setStats(newStats);
        
        // Cache the results
        dashboardCache.data = newStats;
        dashboardCache.timestamp = now;
        
        setError(null);
      } else {
        // Handle individual response errors
        if (!ordersRes.ok) {
          if (ordersRes.status === 401) {
            setError('Authentication failed. Please login again.');
            window.location.href = '/admin/login';
            return;
          } else if (ordersRes.status === 502) {
            setError('Backend server is currently unavailable. Please try again later.');
          } else {
            setError(`Failed to fetch orders: ${ordersRes.status}`);
          }
        }
        
        if (!productsRes.ok) {
          if (productsRes.status === 401) {
            setError('Authentication failed. Please login again.');
            window.location.href = '/admin/login';
            return;
          } else if (productsRes.status === 502) {
            setError('Backend server is currently unavailable. Please try again later.');
          } else {
            setError(`Failed to fetch products: ${productsRes.status}`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      fetchDashboardData();
      
      // Reduced refresh interval from 5 minutes to 10 minutes
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearInterval(interval);
    }
  }, [auth.isAuthenticated, auth.token, fetchDashboardData]);

  // Memoized stat cards to prevent unnecessary re-renders
  const StatCard = React.memo(({ title, value, icon: Icon, trend, trendValue, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue}%
          </span>
        </div>
      )}
    </div>
  ));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchDashboardData(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your restaurant's performance</p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={calculatedStats.totalOrders}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Total Products"
            value={calculatedStats.totalProducts}
            icon={Package}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`$${calculatedStats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="purple"
          />
          <StatCard
            title="Completion Rate"
            value={`${calculatedStats.completionRate.toFixed(1)}%`}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Today's Orders"
            value={calculatedStats.todayOrders}
            icon={Clock}
            trend={calculatedStats.todayOrders > 0 ? 'up' : 'down'}
            trendValue={calculatedStats.todayOrders > 0 ? 100 : 0}
            color="blue"
          />
          <StatCard
            title="This Week's Revenue"
            value={`$${calculatedStats.weekRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={calculatedStats.revenueGrowth > 0 ? 'up' : 'down'}
            trendValue={Math.abs(calculatedStats.revenueGrowth).toFixed(1)}
            color="green"
          />
          <StatCard
            title="Average Order Value"
            value={`$${calculatedStats.averageOrderValue.toFixed(2)}`}
            icon={DollarSign}
            color="purple"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

