import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Filter, Eye, Phone, Clock, CheckCircle, Package, Truck, Home, 
  AlertTriangle, History, Bell, RefreshCw, X, ChevronDown, ChevronUp, 
  MoreVertical, Download, TrendingUp, TrendingDown, 
  DollarSign, Activity, BarChart3, PieChart, 
  ArrowUpRight, ArrowDownRight, Star, Flag, Bookmark
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiGet, apiPut, API_CONFIG, getAuthHeaders } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import OrderDetailsModal from '../../components/Admin/OrderDetailsModal';

interface AdminOrder {
  order_id: number;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total_amount: number;
  delivery_fee?: number;
  status: string;
  created_at: string;
  updated_at?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  special_instructions?: string;
  payment_method?: string;
  payment_status?: string;
}

interface StatusUpdate {
  orderId: number;
  oldStatus: string;
  newStatus: string;
  timestamp: Date;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  completionRate: number;
  pendingOrders: number;
  overdueOrders: number;
  revenueGrowth: number;
  orderGrowth: number;
}

const AdminOrders = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusUpdate[]>([]);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Map<number, string>>(new Map());
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'kanban'>('table');
  const [sortBy, setSortBy] = useState<'created_at' | 'total_amount' | 'priority' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState(''); // Added payment filter state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // Added debounced search term state

  // Helper function to safely parse amounts from database
  const safeParseAmount = (value: any): number => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(numValue) ? 0 : numValue;
  };

  // Helper function to check if an order is overdue
  const isOrderOverdue = (order: AdminOrder) => {
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    
    const overdueThresholds = {
      pending: 1,
      confirmed: 2,
      preparing: 3,
      out_for_delivery: 2,
      delivered: Infinity
    };

    return hoursSinceOrder > (overdueThresholds[order.status as keyof typeof overdueThresholds] || 24);
  };

  // Computed metrics with real-time data
  const metrics = useMemo((): DashboardMetrics => {

    
    // If no orders, return zeros
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        completionRate: 0,
        pendingOrders: 0,
        overdueOrders: 0,
        revenueGrowth: 0,
        orderGrowth: 0
      };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const currentOrders = orders.filter(order => new Date(order.created_at) >= weekAgo);
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= monthAgo && orderDate < weekAgo;
    });

    // Calculate totals with safe parsing
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = safeParseAmount(order.total_amount);
      
      return sum + amount;
    }, 0);

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const overdueOrders = orders.filter(order => isOrderOverdue(order)).length;

    // Calculate growth with safe parsing
    const currentRevenue = currentOrders.reduce((sum, order) => sum + safeParseAmount(order.total_amount), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + safeParseAmount(order.total_amount), 0);
    
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 
                        currentRevenue > 0 ? 100 : 0;
    const orderGrowth = previousOrders.length > 0 ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 
                      currentOrders.length > 0 ? 100 : 0;

    const result = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      completionRate,
      pendingOrders,
      overdueOrders,
      revenueGrowth,
      orderGrowth
    };

    
    return result;
  }, [orders]);

  // Optimized data fetching with caching
  const fetchOrders = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && (now - lastFetchTime) < 5000) return;
    if (isRateLimited && !force && (now - lastFetchTime) < 30000) return;

    try {
      setLastFetchTime(now);
      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_ORDERS, {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setIsRateLimited(false);
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        window.location.href = '/admin/login';
      } else if (response.status === 429) {
        setIsRateLimited(true);
        toast.error('Rate limited. Slowing down refresh...');
      } else if (response.status === 502) {
        toast.error('Backend server is currently unavailable. Please try again later.');
      } else {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [auth.token, lastFetchTime, isRateLimited]);

  // Memoized filtered orders for better performance
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchTerm === '' || 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm) ||
        order.order_id?.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === '' || order.status === statusFilter;
      const matchesPayment = paymentFilter === '' || order.payment_method === paymentFilter;
      
      const orderDate = new Date(order.created_at);
      const now = new Date();
      let matchesDate = true;
      
      switch (selectedTimeRange) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, selectedTimeRange]);

  // Memoized order statistics
  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0
    };

    orders.forEach(order => {
      const amount = safeParseAmount(order.total_amount);
      stats.totalRevenue += amount;
      
      switch (order.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'confirmed':
          stats.confirmed++;
          break;
        case 'preparing':
          stats.preparing++;
          break;
        case 'out_for_delivery':
          stats.outForDelivery++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }, [orders]);

  // Debounced search to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm]);

  // Reduced auto-refresh interval for better performance
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) return;
    
    fetchOrders();
    
    const interval = setInterval(() => {
      fetchOrders();
    }, autoRefresh ? refreshInterval : 0);

    return () => clearInterval(interval);
  }, [auth.isAuthenticated, auth.token, fetchOrders, autoRefresh, refreshInterval]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const oldOrder = orders.find(order => order.order_id === orderId);
    if (!oldOrder) return;

    // Optimistic update
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.order_id === orderId
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      )
    );

    setPendingUpdates(prev => new Map(prev.set(orderId, newStatus)));
    setUpdatingStatus(orderId);

    try {
      const response = await apiPut(
        API_CONFIG.ENDPOINTS.ADMIN_ORDER_STATUS(orderId.toString()),
        { status: newStatus },
        { headers: getAuthHeaders(auth.token!) }
      );

      if (response.ok) {
        // Add to status history
        setStatusHistory(prev => [
          ...prev,
          {
            orderId,
            oldStatus: oldOrder.status,
            newStatus,
            timestamp: new Date()
          }
        ]);

        toast.success(`Order #${orderId} status updated to ${newStatus.replace('_', ' ')}`);
      } else if (response.status === 429) {
        setIsRateLimited(true);
        toast.error('Rate limited. Please wait before making more updates.');
        // Revert optimistic update
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.order_id === orderId
              ? { ...order, status: oldOrder.status }
              : order
          )
        );
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      // Revert optimistic update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.order_id === orderId
            ? { ...order, status: oldOrder.status }
            : order
        )
      );
    } finally {
      setUpdatingStatus(null);
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
    }
  };

  const updateOrderPriority = async (orderId: number, newPriority: string) => {
    const oldOrder = orders.find(order => order.order_id === orderId);
    if (!oldOrder) return;

    // Optimistic update
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.order_id === orderId
          ? { ...order, priority: newPriority as AdminOrder['priority'] }
          : order
      )
    );

    try {
      const response = await apiPut(
        API_CONFIG.ENDPOINTS.ADMIN_ORDER_PRIORITY(orderId.toString()),
        { priority: newPriority },
        { headers: getAuthHeaders(auth.token!) }
      );

      if (response.ok) {
        toast.success(`Order #${orderId} priority updated to ${newPriority}`);
      } else {
        throw new Error('Failed to update priority');
      }
    } catch (error) {
      console.error('Error updating order priority:', error);
      toast.error('Failed to update order priority');
      // Revert optimistic update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.order_id === orderId
            ? { ...order, priority: oldOrder.priority }
            : order
        )
      );
    }
  };

  const bulkUpdateStatus = async (orderIds: number[], newStatus: string) => {
    try {
      const response = await apiPut(
        API_CONFIG.ENDPOINTS.ADMIN_BULK_ORDER_STATUS,
        { orderIds, status: newStatus },
        { headers: getAuthHeaders(auth.token!) }
      );

      if (response.ok) {
        // Optimistic update
        setOrders(prevOrders =>
          prevOrders.map(order =>
            orderIds.includes(order.order_id)
              ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
              : order
          )
        );
        
        toast.success(`${orderIds.length} orders updated to ${newStatus.replace('_', ' ')}`);
        setSelectedOrders([]);
      } else {
        throw new Error('Failed to bulk update');
      }
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      toast.error('Failed to bulk update orders');
    }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = filteredOrders.filter(order => {
      const matchesSearch = 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm) ||
        order.order_id.toString().includes(searchTerm);
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesPriority = !priorityFilter || order.priority === priorityFilter;
      
      const orderDate = new Date(order.created_at);
      const now = new Date();
      let matchesDate = true;
      
      switch (selectedTimeRange) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'total_amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [filteredOrders, searchTerm, statusFilter, priorityFilter, selectedTimeRange, sortBy, sortOrder]);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'blue', icon: CheckCircle },
    { value: 'preparing', label: 'Preparing', color: 'orange', icon: Package },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'purple', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'green', icon: Home }
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: 'red', icon: AlertTriangle },
    { value: 'high', label: 'High', color: 'orange', icon: Flag },
    { value: 'medium', label: 'Medium', color: 'yellow', icon: Star },
    { value: 'low', label: 'Low', color: 'gray', icon: Bookmark }
  ];

  const handleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredAndSortedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredAndSortedOrders.map(order => order.order_id));
    }
  };

  const formatCurrency = (amount: number) => {
    // Handle NaN, null, undefined cases
    const safeAmount = safeParseAmount(amount);
    
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-KE', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Advanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Orders Command Center</h1>
              <p className="text-blue-100 text-lg">
                Real-time order management with advanced analytics
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  isRateLimited ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isRateLimited ? 'bg-red-400' : 'bg-green-400'
                  } animate-pulse`}></div>
                  {isRateLimited ? 'Rate Limited' : 'Live Updates'}
                </div>
                <div className="text-blue-200 text-sm">
                  Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStatusHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                <History className="w-4 h-4" />
                History
              </button>
              
              <button
                onClick={() => fetchOrders(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                  autoRefresh 
                    ? 'bg-green-500/20 border-green-400/30 text-green-200' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Bell className="w-4 h-4" />
                Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {metrics.revenueGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-200" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-200" />
                  )}
                  <span className="text-sm text-green-100">
                    {Math.abs(metrics.revenueGrowth).toFixed(1)}% this week
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">{metrics.totalOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  {metrics.orderGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-blue-200" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-200" />
                  )}
                  <span className="text-sm text-blue-100">
                    {Math.abs(metrics.orderGrowth).toFixed(1)}% this week
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Order Value</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.averageOrderValue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-200" />
                  <span className="text-sm text-purple-100">
                    {metrics.completionRate.toFixed(1)}% completion rate
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Activity className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold">{metrics.pendingOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-4 h-4 text-orange-200" />
                  <span className="text-sm text-orange-100">
                    {metrics.overdueOrders} overdue
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          {statusOptions.map(status => {
            const count = orders.filter(order => order.status === status.value).length;
            const overdueCount = orders.filter(order => 
              order.status === status.value && isOrderOverdue(order)
            ).length;
            const totalValue = orders
              .filter(order => order.status === status.value)
              .reduce((sum, order) => sum + safeParseAmount(order.total_amount), 0);
            const IconComponent = status.icon;
            
            return (
              <div 
                key={status.value} 
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                  statusFilter === status.value 
                    ? `border-${status.color}-400 bg-${status.color}-50` 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setStatusFilter(statusFilter === status.value ? '' : status.value)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${status.color}-100`}>
                    <IconComponent className={`w-5 h-5 text-${status.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{status.label}</p>
                    <p className={`text-2xl font-bold text-${status.color}-600`}>{count}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>
                {overdueCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {overdueCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Advanced Filters & Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Orders Management</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <PieChart className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1min</option>
                <option value={300}>5min</option>
              </select>
              
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 sm:mb-6">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders, customers, phone..."
                value={searchTerm}
                onChange={(e) => setDebouncedSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Sort by Date</option>
                <option value="total_amount">Sort by Amount</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                {priorityOptions.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPriorityFilter('');
                  setSelectedTimeRange('all');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors sm:col-span-2 lg:col-span-1"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl mb-6">
              <span className="text-blue-800 font-medium">
                {selectedOrders.length} orders selected
              </span>
              <div className="flex gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status.value}
                    onClick={() => bulkUpdateStatus(selectedOrders, status.value)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors bg-${status.color}-100 text-${status.color}-800 hover:bg-${status.color}-200`}
                  >
                    Mark as {status.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedOrders([])}
                className="ml-auto p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Orders Display - Mobile Responsive */}
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredAndSortedOrders.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">Order</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Priority</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Time</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOrders.map((order) => (
                    <tr 
                      key={order.order_id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isOrderOverdue(order) ? 'bg-red-50 border-red-100' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.order_id)}
                          onChange={() => handleOrderSelection(order.order_id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            isOrderOverdue(order) ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                          }`}></div>
                          <div>
                            <p className="font-semibold text-gray-900">#{order.order_id}</p>
                            <p className="text-sm text-gray-500">
                              {formatTime(order.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            {order.phone}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900">{formatCurrency(safeParseAmount(order.total_amount))}</p>
                          {order.delivery_fee && (
                            <p className="text-sm text-gray-500">
                              +{formatCurrency(safeParseAmount(order.delivery_fee))} delivery
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="grid grid-cols-2 gap-1">
                          {statusOptions.map(status => (
                            <button
                              key={status.value}
                              onClick={() => updateOrderStatus(order.order_id, status.value)}
                              disabled={updatingStatus === order.order_id}
                              className={`px-2 py-1 text-xs rounded-lg transition-all ${
                                order.status === status.value
                                  ? `bg-${status.color}-100 text-${status.color}-800 ring-2 ring-${status.color}-300`
                                  : `bg-gray-100 text-gray-600 hover:bg-${status.color}-50 hover:text-${status.color}-700`
                              }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="grid grid-cols-2 gap-1">
                          {priorityOptions.map(priority => (
                            <button
                              key={priority.value}
                              onClick={() => updateOrderPriority(order.order_id, priority.value)}
                              className={`px-2 py-1 text-xs rounded-lg transition-all ${
                                order.priority === priority.value
                                  ? `bg-${priority.color}-100 text-${priority.color}-800 ring-2 ring-${priority.color}-300`
                                  : `bg-gray-100 text-gray-600 hover:bg-${priority.color}-50 hover:text-${priority.color}-700`
                              }`}
                            >
                              {priority.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{formatTime(order.created_at)}</p>
                          {isOrderOverdue(order) && (
                            <p className="text-red-600 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Overdue
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => window.open(`tel:${order.phone}`)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredAndSortedOrders.map((order) => (
                <div
                  key={order.order_id}
                  className={`bg-white rounded-xl shadow-md border-2 transition-all ${
                    isOrderOverdue(order) ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.order_id)}
                          onChange={() => handleOrderSelection(order.order_id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className={`w-3 h-3 rounded-full ${
                          isOrderOverdue(order) ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                        }`}></div>
                        <div>
                          <h3 className="font-bold text-gray-900">#{order.order_id}</h3>
                          <p className="text-sm text-gray-500">{formatTime(order.created_at)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`tel:${order.phone}`)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-3">
                      <p className="font-semibold text-gray-900 text-lg">{order.customer_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-3 h-3" />
                        {order.phone}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(safeParseAmount(order.total_amount))}
                      </p>
                      {order.delivery_fee && (
                        <p className="text-sm text-gray-500">
                          +{formatCurrency(safeParseAmount(order.delivery_fee))} delivery
                        </p>
                      )}
                    </div>

                    {/* Overdue Warning */}
                    {isOrderOverdue(order) && (
                      <div className="flex items-center gap-2 p-2 bg-red-100 rounded-lg mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-red-700 font-medium">Overdue</span>
                      </div>
                    )}
                  </div>

                  {/* Status Section */}
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map(status => (
                        <button
                          key={status.value}
                          onClick={() => updateOrderStatus(order.order_id, status.value)}
                          disabled={updatingStatus === order.order_id}
                          className={`px-3 py-2 text-sm rounded-lg transition-all font-medium ${
                            order.status === status.value
                              ? `bg-${status.color}-100 text-${status.color}-800 ring-2 ring-${status.color}-300`
                              : `bg-gray-100 text-gray-600 hover:bg-${status.color}-50 hover:text-${status.color}-700`
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority Section */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Priority</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {priorityOptions.map(priority => (
                        <button
                          key={priority.value}
                          onClick={() => updateOrderPriority(order.order_id, priority.value)}
                          className={`px-3 py-2 text-sm rounded-lg transition-all font-medium ${
                            order.priority === priority.value
                              ? `bg-${priority.color}-100 text-${priority.color}-800 ring-2 ring-${priority.color}-300`
                              : `bg-gray-100 text-gray-600 hover:bg-${priority.color}-50 hover:text-${priority.color}-700`
                          }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredAndSortedOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter || priorityFilter 
                  ? 'Try adjusting your filters to see more orders.'
                  : 'Orders will appear here once customers start placing them.'
                }
              </p>
              {(searchTerm || statusFilter || priorityFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setPriorityFilter('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={{
            order_id: selectedOrder.order_id,
            customer_name: selectedOrder.customer_name,
            phone: selectedOrder.phone,
            delivery_address: selectedOrder.delivery_address,
            total_amount: safeParseAmount(selectedOrder.total_amount),
            delivery_fee: safeParseAmount(selectedOrder.delivery_fee) || 0,
            status: selectedOrder.status,
            payment_status: selectedOrder.payment_status || 'pending',
            created_at: selectedOrder.created_at
          }}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={(orderId, newStatus) => {
            updateOrderStatus(orderId, newStatus);
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Status History Modal */}
      {showStatusHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Status Update History</h3>
              <button
                onClick={() => setShowStatusHistory(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-2 sm:p-6 overflow-y-auto">
              {statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {statusHistory.map((update, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          Order #{update.orderId} status changed from{' '}
                          <span className="font-semibold text-orange-600">
                            {update.oldStatus.replace('_', ' ')}
                          </span>{' '}
                          to{' '}
                          <span className="font-semibold text-green-600">
                            {update.newStatus.replace('_', ' ')}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {update.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No status updates recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;