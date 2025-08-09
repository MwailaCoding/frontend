import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface SimpleWhatsAppChatProps {
  adminPhone?: string;
  businessName?: string;
}

const SimpleWhatsAppChat: React.FC<SimpleWhatsAppChatProps> = ({ 
  adminPhone = "0714042307", 
  businessName = "Sera's Kitchen"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openWhatsApp = () => {
    const cleanPhone = adminPhone.replace(/\D/g, '');
    const message = `Hi ${businessName}! 👋\n\nI'd like to know more about your menu and services.\n\nThank you!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating WhatsApp Button - Visible on all devices */}
      <div className="fixed bottom-6 left-6 lg:bottom-6 lg:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white p-3 lg:p-4 rounded-full shadow-lg transition-colors"
          title="Chat with us on WhatsApp"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Simple Chat Interface - Visible on all devices */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 lg:bottom-24 lg:right-6 w-72 lg:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{businessName}</h3>
                  <p className="text-sm text-green-100">🟢 Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-green-100 mt-2">We're online! We'll respond quickly.</p>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">How can we help you?</h4>
            <p className="text-gray-600 text-sm mb-4">
              Click the button below to start a conversation with us on WhatsApp.
            </p>
            
            <button
              onClick={openWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Start Chat on WhatsApp
            </button>
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

export default SimpleWhatsAppChat; 