import React, { useState } from 'react';
import { MessageCircle, Phone, ShoppingCart, X, Headphones } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useCart();

  const handleWhatsApp = () => {
    const phoneNumber = '254700000000';
    const message = 'Hello! I need help with my order from Sera\'s Kitchen.';
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
  };

  const handleCall = () => {
    window.open('tel:+254700000000');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      <div className={`flex flex-col space-y-3 mb-4 transition-all duration-300 transform ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 animate-bounce-in"
          style={{ animationDelay: '0.1s' }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Call */}
        <button
          onClick={handleCall}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 animate-bounce-in"
          style={{ animationDelay: '0.2s' }}
        >
          <Phone className="w-6 h-6" />
        </button>

        {/* Support */}
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 animate-bounce-in"
          style={{ animationDelay: '0.3s' }}
        >
          <Headphones className="w-6 h-6" />
        </button>
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 text-white p-4 rounded-full shadow-2xl transform transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        
        {/* Cart Badge */}
        {state.itemCount > 0 && !isOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {state.itemCount}
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingActionButton;