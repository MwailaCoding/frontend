import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/logo.png" 
                alt="Sera's Kitchen Logo" 
                className="w-8 h-8 object-contain rounded-full border border-red-800"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  // Fallback to text if image fails
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center hidden border border-red-800">
                <span className="text-white font-bold text-sm">SK</span>
              </div>
              <h3 className="text-lg font-bold">Sera's Kitchen</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Cakes & Kenyan Food - Authentic cuisine with love and tradition.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-red-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products/cakes" className="text-gray-300 hover:text-red-500 transition-colors">
                  Cakes
                </Link>
              </li>
              <li>
                <Link to="/products/main-dishes" className="text-gray-300 hover:text-red-500 transition-colors">
                  Main Dishes
                </Link>
              </li>

              <li>
                <Link to="/track-order" className="text-gray-300 hover:text-red-500 transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-red-500" />
                <span className="text-gray-300">0714042307</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-red-500" />
                <span className="text-gray-300">info@seraskitchen.co.ke</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-gray-300">Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Opening Hours</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-gray-300">Mon - Fri: 8AM - 9PM</p>
                  <p className="text-gray-300">Sat - Sun: 9AM - 10PM</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-800 rounded-lg">
              <p className="text-sm text-red-200">
                🎉 Special Weekend Discounts Available!
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <p className="text-gray-400 text-sm">
              © 2025 Sera's Kitchen. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                Terms of Service
              </Link>
              <a href="#" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                Delivery Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;