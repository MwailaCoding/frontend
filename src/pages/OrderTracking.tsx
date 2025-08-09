import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Phone, MapPin, Clock, CheckCircle, Package, Truck, Home, DollarSign, CreditCard, RefreshCw, Wifi, WifiOff, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiGet, API_CONFIG } from '../config/api';
import TransactionVerification from '../components/TransactionVerification';
import { generateReceipt } from '../components/ReceiptGenerator';

// Add NodeJS types
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

interface Order {
  order_id: number;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at?: string;
  payment_method?: string;
  special_instructions?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState(() => {
    // Get phone from URL parameters, otherwise use empty string
    return searchParams.get('phone') || '';
  });
  const [order, setOrder] = useState<Order | null>(null);
  const [previousOrder, setPreviousOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTransactionVerification, setShowTransactionVerification] = useState(false);
  
  // Real-time functionality states
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [statusChanged, setStatusChanged] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const isInitialLoad = useRef(true);

  const handleSearch = async (isAutoRefresh = false) => {
    if (!phone.trim()) {
      if (!isAutoRefresh) {
        toast.error('Please enter your phone number');
      }
      return;
    }

    if (!isAutoRefresh) {
      setLoading(true);
    }
    
    try {
      const response = await apiGet(`${API_CONFIG.ENDPOINTS.ORDER_BY_PHONE}?phone=${phone.trim()}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Enhanced status change detection
        const hasStatusChanged = checkStatusChange(data, order);
        
        if (order && hasStatusChanged) {
          setPreviousOrder(order);
          setStatusChanged(true);
          
          // Show toast notification for status change
          toast.success(`Order status updated to: ${data.status.replace('_', ' ').toUpperCase()}`, {
            duration: 5000,
            icon: '🎉',
          });
          
          // Reset animation after 3 seconds
          setTimeout(() => {
            setStatusChanged(false);
            setPreviousOrder(null);
          }, 3000);
        }
        
        setOrder(data);
        setLastRefresh(new Date());
        
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
        }
        
      } else if (response.status === 404) {
        if (!isAutoRefresh) {
          toast.error('No orders found for this phone number. Please check your phone number.');
        }
        setOrder(null);
        stopAutoRefresh();
      } else {
        if (!isAutoRefresh) {
          toast.error('Failed to fetch order details');
        }
        setOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      if (!isAutoRefresh) {
        toast.error('Failed to fetch order details');
      }
      setOrder(null);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  // Auto-refresh functionality
  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      if (isAutoRefreshEnabled && phone.trim() && isOnline) {
        handleSearch(true);
      }
    }, refreshInterval * 1000);
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleAutoRefresh = () => {
    setIsAutoRefreshEnabled(!isAutoRefreshEnabled);
    if (!isAutoRefreshEnabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  // Enhanced status change detection
  const checkStatusChange = (newOrder: Order, oldOrder: Order | null) => {
    if (!oldOrder) return false;
    
    // Check if status changed
    if (newOrder.status !== oldOrder.status) {
      return true;
    }
    
    // Check if updated_at timestamp changed (indicates any update)
    if (newOrder.updated_at && oldOrder.updated_at && 
        newOrder.updated_at !== oldOrder.updated_at) {
      return true;
    }
    
    return false;
  };

  // Auto-search when phone number is provided via URL
  useEffect(() => {
    const phoneFromUrl = searchParams.get('phone');
    if (phoneFromUrl && phoneFromUrl.trim()) {
      setPhone(phoneFromUrl);
      // Auto-search after a short delay to ensure state is set
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  }, [searchParams]);

  // Start auto-refresh when order is loaded
  useEffect(() => {
    if (order && isAutoRefreshEnabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => stopAutoRefresh();
  }, [order, isAutoRefreshEnabled, refreshInterval, phone]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (order && isAutoRefreshEnabled) {
        startAutoRefresh();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      stopAutoRefresh();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [order, isAutoRefreshEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAutoRefresh();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'preparing':
        return <Package className="w-6 h-6 text-orange-500" />;
      case 'out_for_delivery':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <Home className="w-6 h-6 text-green-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
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

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Clock },
      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
      { key: 'preparing', label: 'Preparing', icon: Package },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: Home }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStatus.toLowerCase());
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your phone number to track your delicious meal
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => handleSearch(false)}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Controls */}
        {order && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Status Indicator */}
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
                
                {lastRefresh && (
                  <span className="text-sm text-gray-500">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-3">
                {/* Refresh Interval Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Refresh every:</label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                  >
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1min</option>
                  </select>
                </div>

                {/* Auto-refresh Toggle */}
                <button
                  onClick={toggleAutoRefresh}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isAutoRefreshEnabled 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isAutoRefreshEnabled ? 'animate-spin' : ''}`} />
                  <span>{isAutoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
                </button>

                {/* Manual Refresh */}
                <button
                  onClick={() => handleSearch(false)}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-3 sm:space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_id}</h2>
                  <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-medium transition-all duration-500 ${getStatusColor(order.status)} ${
                  statusChanged ? 'animate-pulse ring-4 ring-green-300' : ''
                }`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                  {statusChanged && <span className="ml-2">🎉</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Customer</p>
                    <p className="text-gray-600">{order.customer_name}</p>
                    <p className="text-gray-600">{order.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Delivery Address</p>
                    <p className="text-gray-600">{order.delivery_address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      KSh {order.total_amount.toLocaleString()}
                    </p>
                    {order.payment_method && (
                      <p className="text-sm text-gray-600 mt-1">
                        Payment Method: <span className="font-medium capitalize">{order.payment_method}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Details */}
              {order.payment_method === 'mpesa' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">M-PESA Send Money Details</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Phone Number:</span>
                      <span className="font-mono font-semibold">0714042307</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Name:</span>
                      <span className="font-mono font-semibold">SERAPHINE MAITHAH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-mono font-semibold">KSh {order.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white rounded border border-green-200">
                    <p className="text-xs text-green-700">
                      <strong>Instructions:</strong> Go to M-PESA → Send Money → Enter Phone Number → 
                      Enter Amount → Enter PIN → Confirm
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Request Button */}
              <div className="mt-6 flex justify-center gap-3">
                {order.payment_method === 'mpesa' && order.status === 'pending' && (
                  <button
                    onClick={() => setShowTransactionVerification(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    Verify M-PESA Payment
                  </button>
                )}
                
                {/* Download Receipt Button - Only available when order is out for delivery or delivered */}
                {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
                  <button
                    onClick={async () => {
                      try {
                        await generateReceipt(order.order_id);
                        toast.success('Receipt downloaded successfully!');
                      } catch (error) {
                        console.error('Receipt download error:', error);
                        toast.error('Failed to download receipt');
                      }
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Receipt
                  </button>
                )}

                {/* Receipt Not Available Message */}
                {order.status !== 'out_for_delivery' && order.status !== 'delivered' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg">
                    <Download className="w-5 h-5" />
                    <span className="text-sm">
                      Receipt will be available when your order is out for delivery
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Order Status</h3>
                {statusChanged && (
                  <div className="flex items-center space-x-2 text-green-600 animate-bounce">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Status Updated!</span>
                  </div>
                )}
              </div>
              
              <div className="relative">
                {getStatusSteps(order.status).map((step, index) => (
                  <div key={step.key} className="flex items-center mb-8 last:mb-0">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${
                      step.completed 
                        ? 'bg-green-600 border-green-600 text-white' 
                        : step.active
                        ? `bg-white border-green-600 text-green-600 ${statusChanged ? 'animate-pulse ring-4 ring-green-300' : ''}`
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <p className={`font-medium transition-colors duration-300 ${
                        step.completed || step.active ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      {step.active && (
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-green-600">Current status</p>
                          {statusChanged && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full animate-pulse">
                              Just updated!
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {index < getStatusSteps(order.status).length - 1 && (
                      <div className={`absolute left-6 w-0.5 h-8 mt-12 transition-colors duration-500 ${
                        step.completed ? 'bg-green-600' : 'bg-gray-300'
                      }`} style={{ top: `${index * 6 + 3}rem` }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Real-time Status Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <RefreshCw className={`w-4 h-4 text-blue-600 ${isAutoRefreshEnabled ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium text-blue-800">Live Tracking Active</span>
                </div>
                <p className="text-sm text-blue-700">
                  Your order status is being monitored in real-time. You'll be notified instantly when it changes!
                </p>
                {!isOnline && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ You're currently offline. Status updates will resume when connection is restored.
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h3>
                
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        KSh {(item.unit_price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Support */}
            <div className="bg-blue-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Need Help?</h4>
              <div className="space-y-2 text-blue-800">
                <p>📞 Call us: +254 700 000 000</p>
                <p>💬 WhatsApp: +254 700 000 000</p>
                <p>�� Email: support@seraskitchen.co.ke</p>
                <p className="text-sm mt-3">
                  Our customer service team is available 8AM - 9PM daily
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Order Found */}
        {!loading && !order && phone && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find an order with the provided details. Please check your phone number.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Make sure you entered the correct phone number</p>
              <p>• Contact support if you continue to have issues</p>
            </div>
          </div>
        )}
      </div>

      {showTransactionVerification && order && (
        <TransactionVerification
          orderId={order.order_id}
          phoneNumber={order.phone}
          amount={order.total_amount}
          onClose={() => setShowTransactionVerification(false)}
          onVerificationSubmitted={() => {
            // Refresh order data after verification submission
            handleSearch();
          }}
        />
      )}
    </div>
  );
};

export default OrderTracking;

