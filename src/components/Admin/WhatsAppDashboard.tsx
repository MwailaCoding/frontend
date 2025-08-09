import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  TrendingUp, 
  Phone, 
  Copy, 
  ExternalLink,
  Settings,
  BarChart3,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { apiGet, apiPost, apiPut, getAuthHeaders, API_CONFIG } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessage {
  chat_id: number;
  customer_name: string;
  customer_phone: string;
  message: string;
  message_type: 'order_status' | 'menu_inquiry' | 'custom_order' | 'delivery' | 'support' | 'general';
  created_at: string;
  status: 'new' | 'responded' | 'resolved';
  order_id?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_response?: string;
  responded_at?: string;
  order_status?: string;
  order_total?: number;
  order_items?: string;
}

interface WhatsAppStats {
  totalChats: number;
  todayChats: number;
  responseRate: number;
  avgResponseTime: string;
  topInquiryType: string;
  pendingChats: number;
}

const WhatsAppDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chats' | 'templates' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | ChatMessage['message_type']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ChatMessage['status']>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();

  // Real-time data states
  const [stats, setStats] = useState<WhatsAppStats>({
    totalChats: 0,
    todayChats: 0,
    responseRate: 0,
    avgResponseTime: '0 minutes',
    topInquiryType: 'General',
    pendingChats: 0
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Settings state
  const [settings, setSettings] = useState({
    adminPhone: '+254714042307',
    businessName: "Sera's Kitchen",
    openingTime: '08:00',
    closingTime: '22:00',
    chatWidgetEnabled: true
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      loadDashboardData();
      loadSavedSettings();
    }
  }, [auth.isAuthenticated, auth.token]);

  const loadSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('whatsapp_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsedSettings
        }));
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadWhatsAppStats(),
        loadWhatsAppChats(),
        loadWhatsAppTemplates()
      ]);
    } catch (error) {
      console.error('Error loading WhatsApp dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppStats = async () => {
    try {
      const response = await apiGet(API_CONFIG.ENDPOINTS.WHATSAPP_STATS, {
        headers: getAuthHeaders(auth.token!)
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading WhatsApp stats:', error);
    }
  };

  const loadWhatsAppChats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterType !== 'all') queryParams.append('type', filterType);
      if (filterStatus !== 'all') queryParams.append('status', filterStatus);
      if (searchTerm) queryParams.append('search', searchTerm);
      queryParams.append('limit', '50');
      
      const response = await apiGet(`${API_CONFIG.ENDPOINTS.WHATSAPP_CHATS}?${queryParams}`, {
        headers: getAuthHeaders(auth.token!)
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.chats || []);
      }
    } catch (error) {
      console.error('Error loading WhatsApp chats:', error);
    }
  };

  const loadWhatsAppTemplates = async () => {
    try {
      const response = await apiGet(API_CONFIG.ENDPOINTS.WHATSAPP_TEMPLATES, {
        headers: getAuthHeaders(auth.token!)
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error loading WhatsApp templates:', error);
    }
  };

  // Reload chats when filters change
  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      loadWhatsAppChats();
    }
  }, [filterType, filterStatus, searchTerm, auth.isAuthenticated, auth.token]);

  const updateChatStatus = async (chatId: number, status: string, adminResponse?: string) => {
    try {
      const response = await apiPut(API_CONFIG.ENDPOINTS.WHATSAPP_CHAT_STATUS(chatId.toString()), 
        { status, admin_response: adminResponse },
        { headers: getAuthHeaders(auth.token!) }
      );
      
      if (response.ok) {
        // Reload chats to get updated data
        await loadWhatsAppChats();
        await loadWhatsAppStats(); // Update stats as well
      }
    } catch (error) {
      console.error('Error updating chat status:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      setError(null);
      
      // Here you would normally save to backend, but for now we'll simulate it
      // In a real implementation, you'd call an API endpoint to save settings
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just store in localStorage as a demo
      localStorage.setItem('whatsapp_settings', JSON.stringify(settings));
      
      // Show success message
      
      setSettingsSaved(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSettingsSaved(false), 3000);
      
      // Update the WhatsApp widget with new settings if it exists
      if (window.dispatchEvent) {
        const settingsEvent = new CustomEvent('whatsapp-settings-updated', { 
          detail: settings 
        });

        window.dispatchEvent(settingsEvent);
      }
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTypeColor = (type: ChatMessage['message_type']) => {
    const colors = {
      order_status: 'bg-blue-100 text-blue-800',
      menu_inquiry: 'bg-purple-100 text-purple-800',
      custom_order: 'bg-green-100 text-green-800',
      delivery: 'bg-orange-100 text-orange-800',
      support: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  const getStatusColor = (status: ChatMessage['status']) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: ChatMessage['priority']) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority];
  };

  const filteredChats = chatMessages.filter(chat => {
    if (!chat || typeof chat !== 'object') return false;
    
    const matchesSearch = !searchTerm || 
      chat.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.customer_phone?.includes(searchTerm);
    const matchesType = filterType === 'all' || chat.message_type === filterType;
    const matchesStatus = filterStatus === 'all' || chat.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const openWhatsApp = (phone: string, message?: string) => {
    const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
    const url = message 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${cleanPhone}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">WhatsApp Management</h2>
            <p className="text-sm text-gray-600">Manage customer conversations and automation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
          )}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">
              {error}
            </div>
          )}
          <button
            onClick={loadDashboardData}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'chats', label: 'Chats', icon: MessageCircle },
            { id: 'templates', label: 'Templates', icon: Copy },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Chats</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalChats}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Today's Chats</p>
                    <p className="text-2xl font-bold text-green-900">{stats.todayChats}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Response Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.responseRate}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Pending Chats</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.pendingChats}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Chat Activity</h3>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded mb-2"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-16 bg-gray-300 rounded"></div>
                          <div className="h-6 w-16 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : chatMessages.length > 0 ? (
                <div className="space-y-4">
                  {chatMessages.slice(0, 3).map((chat) => (
                    <div key={chat.chat_id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{chat.customer_name}</h4>
                          <span className="text-sm text-gray-500">{formatTime(chat.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{chat.message.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(chat.message_type)}`}>
                            {chat.message_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chat.status)}`}>
                            {chat.status}
                          </span>
                          {chat.order_id && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              Order #{chat.order_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No chat messages yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="order_status">Order Status</option>
                <option value="menu_inquiry">Menu Inquiry</option>
                <option value="custom_order">Custom Order</option>
                <option value="delivery">Delivery</option>
                <option value="support">Support</option>
                <option value="general">General</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Chat List */}
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded mb-3"></div>
                          <div className="flex space-x-2">
                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                            <div className="h-6 w-16 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : chatMessages.length > 0 ? (
                chatMessages.map((chat) => (
                  <div key={chat.chat_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{chat.customer_name}</h3>
                          <span className="text-sm text-gray-500">{chat.customer_phone}</span>
                          <span className={`w-2 h-2 rounded-full ${getPriorityColor(chat.priority)}`}>●</span>
                          <span className="text-xs text-gray-400">{formatTime(chat.created_at)}</span>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{chat.message}</p>
                        
                        {chat.admin_response && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-blue-800">
                              <strong>Admin Response:</strong> {chat.admin_response}
                            </p>
                            {chat.responded_at && (
                              <p className="text-xs text-blue-600 mt-1">
                                Responded {formatTime(chat.responded_at)}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(chat.message_type)}`}>
                            {chat.message_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chat.status)}`}>
                            {chat.status}
                          </span>
                          {chat.order_id && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              Order #{chat.order_id}
                              {chat.order_status && ` (${chat.order_status})`}
                            </span>
                          )}
                          {chat.order_total && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                              KSh {chat.order_total.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {chat.order_items && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Items:</strong> {chat.order_items}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => openWhatsApp(chat.customer_phone)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Open WhatsApp"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(chat.customer_phone)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy phone number"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {chat.status === 'new' && (
                          <button
                            onClick={() => updateChatStatus(chat.chat_id, 'responded')}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Mark as responded"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No chat messages found</p>
                  {(filterType !== 'all' || filterStatus !== 'all' || searchTerm) && (
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterStatus('all');
                        setSearchTerm('');
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quick Response Templates</h3>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Add Template
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="h-4 bg-gray-300 rounded mb-3"></div>
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <div className="h-20 bg-gray-300 rounded"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-6 w-16 bg-gray-300 rounded"></div>
                        <div className="h-6 w-12 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : templates.length > 0 ? (
                templates.map((template) => (
                  <div key={template.template_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{template.template_name}</h4>
                      <button
                        onClick={() => copyToClipboard(template.message_template)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Copy template"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-700 whitespace-pre-line">{template.message_template}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.template_category)}`}>
                        {template.template_category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          by {template.created_by_name || 'Admin'}
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <Copy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No templates found</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first template to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">WhatsApp Integration Setup</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a free WhatsApp integration using direct links. For advanced features like webhooks and automated responses, consider upgrading to WhatsApp Business API.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin WhatsApp Number
                </label>
                <input
                  type="text"
                  value={settings.adminPhone}
                  onChange={(e) => handleSettingsChange('adminPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter WhatsApp number with country code"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include country code (e.g., +254700000000)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => handleSettingsChange('businessName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={settings.openingTime}
                      onChange={(e) => handleSettingsChange('openingTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={settings.closingTime}
                      onChange={(e) => handleSettingsChange('closingTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Enable Chat Widget</h4>
                  <p className="text-sm text-gray-600">Show WhatsApp chat button on website</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.chatWidgetEnabled}
                    onChange={(e) => handleSettingsChange('chatWidgetEnabled', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {settingsSaved && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Settings saved successfully!</span>
                </div>
              )}



              <button 
                onClick={saveSettings}
                disabled={savingSettings}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {savingSettings ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppDashboard;