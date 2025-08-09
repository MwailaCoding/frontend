import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Cake, Utensils, Package, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { state } = useCart();

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Cakes', path: '/products/cakes', icon: Cake },
    { name: 'Food', path: '/products/main-dishes', icon: Utensils },
    { name: 'Track', path: '/track-order', icon: Package },
    { name: 'Cart', path: '/cart', icon: ShoppingCart }
  ];



  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          const isCart = item.path === '/cart';
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px] ${
                isActive
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {isCart && state.itemCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {state.itemCount}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium mt-1">{item.name}</span>
              {isActive && (
                <div className="w-1 h-1 bg-red-600 rounded-full mt-1"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
