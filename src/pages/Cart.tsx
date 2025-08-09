import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = state.total;
  const total = subtotal - discount;

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleApplyPromo = () => {
    const validCodes = {
      'WELCOME10': 0.1,
      'SAVE50': 50,
      'FIRSTORDER': 0.15
    };

    const code = promoCode.toUpperCase();
    if (validCodes[code as keyof typeof validCodes]) {
      const discountValue = typeof validCodes[code as keyof typeof validCodes] === 'number' 
        ? validCodes[code as keyof typeof validCodes] as number
        : 0;
      
      const calculatedDiscount = discountValue < 1 
        ? subtotal * discountValue 
        : discountValue;
      
      setDiscount(calculatedDiscount);
      toast.success(`Promo code applied! You saved KSh ${calculatedDiscount.toLocaleString()}`);
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 bg-gray-200 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Your cart is empty</h2>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              Looks like you haven't added any delicious items to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                to="/products"
                className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Start Shopping</span>
              </Link>
              <Link
                to="/products/cakes"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Browse Cakes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 font-medium transition-colors text-sm sm:text-base"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {state.items.map((item) => {
              const imageUrl = item.image_path 
                ? `http://localhost:5000/${item.image_path}`
                : 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300';

              return (
                <div key={`${item.product_id}-${item.customization || 'default'}`} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300';
                        }}
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                      {item.customization && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          Special instructions: {item.customization}
                        </p>
                      )}
                      <p className="text-green-600 font-semibold text-sm sm:text-base mt-1">
                        KSh {item.price.toLocaleString()} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <p className="text-sm sm:text-base font-semibold text-gray-900">
                        KSh {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        removeFromCart(item.product_id);
                        toast.success('Item removed from cart');
                      }}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Promo Code */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Promo Code</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <p className="text-green-600 text-xs sm:text-sm mt-2">
                  ✓ Promo code applied! You saved KSh {discount.toLocaleString()}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">KSh {subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm sm:text-base">
                    <span>Discount</span>
                    <span>-KSh {discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-2 sm:pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">KSh {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 rounded-lg font-semibold mt-4 sm:mt-6 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="mt-3 sm:mt-4 text-center">
                <Link
                  to="/products"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors text-sm sm:text-base"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">Delivery Information</h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-800">
                <p>⏱️ Estimated delivery: 30-45 minutes</p>
                <p>📞 We'll call to confirm your order</p>
                <p>💳 Pay via MPESA or cash on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;