import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, ShoppingCart, Search, Phone, MessageCircle, 
  ChevronDown, Sparkles, Crown, Home, Cake, Utensils, Package
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import SimpleSearchBar from '../UI/SimpleSearchBar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { state } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const categories = [
    { name: 'Cakes', path: '/products/cakes', id: 1 },
    { name: 'Main Dishes', path: '/products/main-dishes', id: 2 }
  ];

  const handleWhatsAppContact = () => {
    const phoneNumber = '254714042307';
    const message = 'Hello! I would like to know more about your menu.';
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
  };



  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Navigation items with icons for mobile
  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Cakes', path: '/products/cakes', icon: Cake },
    { name: 'Food', path: '/products/main-dishes', icon: Utensils },
    { name: 'Track', path: '/track-order', icon: Package }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/20' 
        : 'bg-white/90 backdrop-blur-sm shadow-lg'
    }`}>
      
      {/* Premium Top Bar */}
      <div className={`bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white transition-all duration-500 ${
        isScrolled ? 'py-1' : 'py-2'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 group">
                <Phone className="w-4 h-4 text-red-300 group-hover:rotate-12 transition-transform" />
                <span className="font-medium">0714042307</span>
              </div>
              <button
                onClick={handleWhatsAppContact}
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-red-600 hover:border-red-400 transition-all duration-300 group"
              >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">WhatsApp</span>
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-red-300 animate-pulse" />
              <span className="font-medium bg-gradient-to-r from-red-300 to-red-100 bg-clip-text text-transparent">
                Fresh ingredients daily
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className={`flex flex-col sm:flex-row justify-between items-center transition-all duration-500 ${
          isScrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-4'
        }`}>
          
          {/* Premium Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className={`relative transition-all duration-500 ${
              isScrolled ? 'w-10 h-10' : 'w-12 h-12'
            }`}>
              <img 
                src="/logo.png" 
                alt="Sera's Kitchen Logo" 
                className="w-full h-full object-contain rounded-full border-2 border-red-800 group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  // Fallback to text if image fails
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 hidden border-2 border-red-800">
                <span className={`text-white font-bold transition-all duration-300 ${
                  isScrolled ? 'text-lg' : 'text-xl'
                }`}>SK</span>
              </div>
            </div>
            <div className="group-hover:scale-105 transition-transform duration-300">
              <h1 className={`font-bold bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent transition-all duration-300 ${
                isScrolled ? 'text-xl' : 'text-2xl'
              }`}>
                Sera's Kitchen
              </h1>
              <p className={`text-red-700 font-medium transition-all duration-300 ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>
                Cakes & Kenyan Food
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 group ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-red-700 to-red-600 shadow-lg'
                      : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </div>
                  
                  {/* Hover Effect */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 to-red-500/0 group-hover:from-orange-500/20 group-hover:to-red-500/20 transition-all duration-300"></div>
                  )}
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center space-x-3">
            
            {/* Premium Search Bar */}
            <div className="hidden xl:block">
              <div className="relative">
                <SimpleSearchBar
                  onSearch={(query) => navigate(`/products?search=${query}`)}
                  placeholder="Search delicious food..."
                />
              </div>
            </div>

            {/* Search Button for smaller screens */}
            <button className="xl:hidden p-2 text-gray-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300">
              <Search className="w-5 h-5" />
            </button>

            {/* Premium Cart Button */}
            <Link
              to="/cart"
              className="relative group"
            >
              <div className={`relative p-3 rounded-xl transition-all duration-300 ${
                state.itemCount > 0
                  ? 'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white'
              }`}>
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                
                {/* Cart Count Badge */}
                {state.itemCount > 0 && (
                                  <div className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                  {state.itemCount}
                </div>
                )}
              </div>
            </Link>


          </div>
        </div>
      </div>


    </header>
  );
};

export default Header;