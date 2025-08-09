import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MessageCircle, X, Phone, Clock, MapPin, ShoppingCart, HelpCircle, Star } from 'lucide-react';
import { getPerformanceSettings, debounce } from '../../utils/performance';

interface WhatsAppChatProps {
  adminPhone?: string;
  businessName?: string;
}

interface ChatTemplate {
  id: string;
  title: string;
  icon: React.ElementType;
  message: string;
  description: string;
  color: string;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ 
  adminPhone: propAdminPhone = "0714042307", 
  businessName: propBusinessName = "Sera's Kitchen"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    orderNumber: ''
  });

  // Get performance settings
  const performanceSettings = getPerformanceSettings();

  // Dynamic settings that can be updated from admin dashboard
  const [settings, setSettings] = useState({
    adminPhone: propAdminPhone,
    businessName: propBusinessName,
    openingTime: '08:00',
    closingTime: '22:00',
    chatWidgetEnabled: true
  });

  // Debounced settings update to prevent excessive re-renders
  const debouncedSettingsUpdate = useCallback(
    debounce((newSettings: any) => {
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));
    }, 100),
    []
  );

  // Listen for settings updates from admin dashboard
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      const newSettings = event.detail;
      console.log('WhatsApp widget received settings update:', newSettings);
      debouncedSettingsUpdate(newSettings);
    };

    // Load saved settings from localStorage on mount FIRST
    const loadSavedSettings = () => {
      try {
        const savedSettings = localStorage.getItem('whatsapp_settings');
        console.log('Loading WhatsApp settings from localStorage:', savedSettings);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          console.log('Parsed WhatsApp settings:', parsedSettings);
          setSettings(prev => {
            const newSettings = {
              ...prev,
              ...parsedSettings
            };
            console.log('Updated WhatsApp widget settings:', newSettings);
            return newSettings;
          });
        }
      } catch (error) {
        console.error('Error loading WhatsApp settings:', error);
      }
    };

    // Load settings immediately
    loadSavedSettings();

    window.addEventListener('whatsapp-settings-updated', handleSettingsUpdate as EventListener);

    return () => {
      window.removeEventListener('whatsapp-settings-updated', handleSettingsUpdate as EventListener);
    };
  }, [debouncedSettingsUpdate]);

  // Get business hours status using dynamic settings
  const getBusinessStatus = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes
    
    const [openHour, openMinute] = settings.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = settings.closingTime.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    const isBusinessHours = currentTime >= openTime && currentTime <= closeTime;
    
    return {
      isOpen: isBusinessHours,
      message: isBusinessHours 
        ? "We're online! We'll respond quickly." 
        : `We're offline. We'll respond during business hours (${settings.openingTime} - ${settings.closingTime}).`
    };
  }, [settings.openingTime, settings.closingTime]);

  const businessStatus = getBusinessStatus();

  const chatTemplates: ChatTemplate[] = useMemo(() => [
    {
      id: 'order_status',
      title: 'Track My Order',
      icon: ShoppingCart,
      message: `Hi ${settings.businessName}! 👋\n\nI'd like to check the status of my order.\n\nOrder Number: [ORDER_NUMBER]\nPhone: [PHONE]\n\nThank you!`,
      description: 'Check your order status',
      color: 'bg-blue-500'
    },
    {
      id: 'menu_inquiry',
      title: 'Menu & Prices',
      icon: Star,
      message: `Hi ${settings.businessName}! 👋\n\nI'd like to know more about your menu and prices.\n\nSpecifically interested in:\n- [ITEM TYPE]\n\nCan you help me with details?\n\nThank you!`,
      description: 'Ask about menu items',
      color: 'bg-purple-500'
    },
    {
      id: 'custom_order',
      title: 'Custom Order',
      icon: Phone,
      message: `Hi ${settings.businessName}! 👋\n\nI'd like to place a custom order.\n\nDetails:\n- Item: [ITEM]\n- Quantity: [QUANTITY]\n- Special requirements: [REQUIREMENTS]\n- Delivery date: [DATE]\n\nName: [NAME]\nPhone: [PHONE]\nAddress: [ADDRESS]\n\nPlease let me know if this is possible!\n\nThank you!`,
      description: 'Place a special order',
      color: 'bg-green-500'
    },
    {
      id: 'delivery_inquiry',
      title: 'Delivery Info',
      icon: MapPin,
      message: `Hi ${settings.businessName}! 👋\n\nI'd like to know about delivery to my area.\n\nLocation: [YOUR_AREA]\n\nQuestions:\n- Do you deliver to this area?\n- How long does delivery take?\n\nThank you!`,
      description: 'Ask about delivery',
      color: 'bg-orange-500'
    },
    {
      id: 'support',
      title: 'Customer Support',
      icon: HelpCircle,
      message: `Hi ${settings.businessName}! 👋\n\nI need help with:\n[DESCRIBE YOUR ISSUE]\n\nOrder Number (if applicable): [ORDER_NUMBER]\nPhone: [PHONE]\n\nI'd appreciate your assistance.\n\nThank you!`,
      description: 'Get help & support',
      color: 'bg-red-500'
    },
    {
      id: 'business_hours',
      title: 'Business Hours',
      icon: Clock,
      message: `Hi ${settings.businessName}! 👋\n\nI'd like to know your:\n- Business hours\n- Delivery times\n- Best time to call\n\nThank you!`,
      description: 'Check operating hours',
      color: 'bg-indigo-500'
    }
  ], [settings.businessName]); // Recreate templates when business name changes

  const formatMessage = useCallback((template: ChatTemplate) => {
    let message = template.message;
    
    // Replace placeholders with actual data
    if (customerInfo.name) {
      message = message.replace(/\[NAME\]/g, customerInfo.name);
    }
    if (customerInfo.phone) {
      message = message.replace(/\[PHONE\]/g, customerInfo.phone);
    }
    if (customerInfo.orderNumber) {
      message = message.replace(/\[ORDER_NUMBER\]/g, customerInfo.orderNumber);
    }
    
    return message;
  }, [customerInfo]);

  const openWhatsApp = useCallback((message: string) => {
    console.log('Opening WhatsApp with settings:', settings);
    console.log('Raw admin phone:', settings.adminPhone);
    const cleanPhone = settings.adminPhone.replace(/\D/g, ''); // Remove non-digits
    console.log('Clean phone number:', cleanPhone);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    console.log('WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  }, [settings.adminPhone]);

  const handleTemplateSelect = useCallback((template: ChatTemplate) => {
    setSelectedTemplate(template.id);
    setCustomMessage(formatMessage(template));
  }, [formatMessage]);

  const handleSendMessage = useCallback(() => {
    if (customMessage.trim()) {
      openWhatsApp(customMessage);
    }
  }, [customMessage, openWhatsApp]);

  // Auto-close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.whatsapp-chat-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Don't render if chat widget is disabled
  if (!settings.chatWidgetEnabled) {
    return null;
  }

  // Optimize animation based on performance settings
  const animationClass = performanceSettings.enableAnimations ? 'animate-pulse' : '';

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${animationClass}`}
          title="Chat with us on WhatsApp"
          style={{ 
            transitionDuration: `${performanceSettings.animationDuration}ms`,
            willChange: 'transform' // Optimize for animations
          }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Chat Interface - Lazy load when opened */}
      {isOpen && (
        <div className="whatsapp-chat-container fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{settings.businessName}</h3>
                  <p className="text-sm text-green-100">
                    {businessStatus.isOpen ? '🟢 Online' : '🔴 Offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                style={{ transitionDuration: '200ms' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-green-100 mt-2">{businessStatus.message}</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!selectedTemplate ? (
              <>
                {/* Quick Info Form */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Info (Optional)</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Your phone number"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Order number (if any)"
                      value={customerInfo.orderNumber}
                      onChange={(e) => setCustomerInfo({...customerInfo, orderNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Template Options */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">How can we help you?</h4>
                  <div className="space-y-2">
                    {chatTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        style={{ transitionDuration: '200ms' }}
                      >
                        <div className={`p-2 ${template.color} text-white rounded-lg`}>
                          <template.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{template.title}</div>
                          <div className="text-sm text-gray-600">{template.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Custom Message Editor */
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Customize Your Message</h4>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setCustomMessage('');
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                    style={{ transitionDuration: '200ms' }}
                  >
                    ← Back
                  </button>
                </div>
                
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Type your message here..."
                />
                
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleSendMessage}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    style={{ transitionDuration: '200ms' }}
                  >
                    Send via WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <p className="text-xs text-gray-600 text-center">
              Powered by WhatsApp • We'll respond as soon as possible
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppChat;