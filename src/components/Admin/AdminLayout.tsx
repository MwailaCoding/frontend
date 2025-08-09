import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  ChefHat,
  Menu,
  X,
  DollarSign,
  CheckCircle,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import PaymentRequests from './PaymentRequests';
import WhatsAppDashboard from './WhatsAppDashboard';
import PaymentVerifications from './PaymentVerifications';
import { apiGet, getAuthHeaders, API_CONFIG } from '../../config/api';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPaymentRequests, setShowPaymentRequests] = useState(false);
  const [showWhatsAppDashboard, setShowWhatsAppDashboard] = useState(false);
  const [showPaymentVerifications, setShowPaymentVerifications] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrderForVerification, setSelectedOrderForVerification] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/admin/login');
    }
  }, [auth.isAuthenticated, navigate]);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  ];

  const paymentActions = [
    { 
      name: 'Payment Requests', 
      icon: DollarSign, 
      action: () => setShowPaymentRequests(true),
      description: 'Request & track'
    },
    {
      name: 'Verify Payments',
      icon: CheckCircle,
      action: () => setShowPaymentVerifications(true),
      description: 'M-PESA codes'
    },
  ];

  const communicationActions = [
    { 
      name: 'WhatsApp Chat', 
      icon: MessageCircle, 
      action: () => setShowWhatsAppDashboard(true),
      description: 'Manage customer chats'
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_ORDERS, {
        headers: getAuthHeaders(auth.token!)
      });
      
      if (response.ok) {
        const orders = await response.json();
        const mpesaPendingOrders = orders.filter((order: any) => 
          order.payment_method === 'mpesa' && order.status === 'pending'
        );
        setPendingOrders(mpesaPendingOrders);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast.error('Failed to fetch pending orders');
    }
  };

  const handleVerifyPayment = (order: any) => {
    setSelectedOrderForVerification(order);
    // setShowTransactionVerification(true); // This state is no longer used
  };

  const handleVerificationSubmitted = () => {
    // setShowTransactionVerification(false); // This state is no longer used
    setSelectedOrderForVerification(null);
    fetchPendingOrders(); // Refresh the list
    toast.success('Payment verification submitted successfully!');
  };

  // Show loading while checking authentication
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-purple-700 rounded-full flex items-center justify-center">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Sera's Kitchen</h1>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 sm:mt-6 px-3">
          {/* Main Navigation - Hidden on mobile since it's in bottom bar */}
          <div className="hidden lg:block space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-3 sm:py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile-only: Current Page Info */}
          <div className="lg:hidden mb-6">
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Page</p>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                if (isActive) {
                  return (
                    <div key={item.name} className="flex items-center">
                      <item.icon className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Payment Section */}
          <div className="mt-6 sm:mt-8">
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Payments
              </h3>
            </div>
            <div className="space-y-1">
              {paymentActions.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    item.action();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-3 sm:py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="truncate">{item.name}</span>
                    <span className="text-xs text-gray-500 truncate">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Communication Section */}
          <div className="mt-6 sm:mt-8">
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Communication
              </h3>
            </div>
            <div className="space-y-1">
              {communicationActions.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    item.action();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-3 sm:py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="truncate">{item.name}</span>
                    <span className="text-xs text-gray-500 truncate">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 sm:bottom-6 left-3 right-3">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 sm:py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Dashboard */}
          <Link
            to="/admin/dashboard"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/admin/dashboard'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>

          {/* Products */}
          <Link
            to="/admin/products"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/admin/products'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Products</span>
          </Link>

          {/* Orders */}
          <Link
            to="/admin/orders"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/admin/orders'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Orders</span>
          </Link>

          {/* More Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <div className="w-5 h-5 mb-1 flex items-center justify-center">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full mx-1"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="lg:hidden">
                <h1 className="text-lg font-bold text-gray-900">Sera's Kitchen</h1>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                target="_blank"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                View Site →
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Dashboard */}
          <Link
            to="/admin/dashboard"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/admin/dashboard'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>

          {/* Products */}
          <Link
            to="/admin/products"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/admin/products'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Products</span>
          </Link>

          {/* Orders */}
          <Link
            to="/admin/orders"
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/admin/orders'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Orders</span>
          </Link>

          {/* More Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <div className="w-5 h-5 mb-1 flex items-center justify-center">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full mx-1"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Payment Requests Modal */}
      {showPaymentRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <PaymentRequests onClose={() => setShowPaymentRequests(false)} />
          </div>
        </div>
      )}

      {/* WhatsApp Dashboard Modal */}
      {showWhatsAppDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <WhatsAppDashboard onClose={() => setShowWhatsAppDashboard(false)} />
          </div>
        </div>
      )}

      {/* Payment Verifications Modal */}
      {showPaymentVerifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <PaymentVerifications onClose={() => setShowPaymentVerifications(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;

