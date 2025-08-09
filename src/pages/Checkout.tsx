import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, CreditCard, Smartphone, Banknote, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { apiPost, API_CONFIG } from '../config/api';


const Checkout = () => {
  const { state, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash'>('mpesa');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    delivery_address: '',
    special_instructions: ''
  });

  const total = state.total;

  // M-PESA Send Money Details
  const mpesaDetails = {
    phoneNumber: '0714042307',
    accountName: 'SERAPHINE MAITHAH',
    paymentMethod: 'Send Money'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const validateForm = () => {
    if (!formData.customer_name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!formData.delivery_address.trim()) {
      toast.error('Please enter your delivery address');
      return false;
    }
    
    // Validate Kenyan phone number
    const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Kenyan phone number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        delivery_address: formData.delivery_address,
        special_instructions: formData.special_instructions,
        payment_method: paymentMethod,
        items: state.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const orderResponse = await apiPost(API_CONFIG.ENDPOINTS.ORDERS, orderData);

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.order_id;

      // Order placed successfully
      toast.success('Order placed successfully! Use your phone number to track your order.');
      clearCart();
      navigate(`/track-order?phone=${encodeURIComponent(formData.phone)}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Checkout Form */}
          <div className="space-y-3 sm:space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-red-600" />
                <span>Customer Information</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0712345678 or +254712345678"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll use this number for order updates and MPESA payment
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>Delivery Information</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Enter your complete delivery address including landmarks"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Any special delivery instructions or dietary requirements"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span>Payment Method</span>
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="mpesa"
                    checked={paymentMethod === 'mpesa'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'mpesa')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">MPESA</p>
                    <p className="text-sm text-gray-600">Pay securely with your mobile money</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <Banknote className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when your order arrives</p>
                  </div>
                </label>
              </div>

              {/* M-PESA Send Money Details */}
              {paymentMethod === 'mpesa' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">M-PESA Send Money Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Phone Number:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold text-green-800">{mpesaDetails.phoneNumber}</span>
                        <button
                          onClick={() => copyToClipboard(mpesaDetails.phoneNumber, 'Phone Number')}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          {copiedField === 'Phone Number' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Account Name:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold text-green-800">{mpesaDetails.accountName}</span>
                        <button
                          onClick={() => copyToClipboard(mpesaDetails.accountName, 'Account Name')}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          {copiedField === 'Account Name' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Amount:</span>
                      <span className="font-mono font-semibold text-green-800">KSh {total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-white rounded border border-green-200">
                    <p className="text-xs text-green-700">
                      <strong>Instructions:</strong> Go to M-PESA → Send Money → Enter Phone Number → 
                      Enter Amount → Enter PIN → Confirm
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3 sm:space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {state.items.map((item) => (
                  <div key={`${item.product_id}-${item.customization || 'default'}`} className="flex items-center space-x-3 py-2">
                    <img
                      src={item.image_path ? `https://hamilton47.pythonanywhere.com/${item.image_path}` : '/logo.png'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.customization && (
                        <p className="text-xs text-gray-500">{item.customization}</p>
                      )}
                    </div>
                    <p className="font-medium">KSh {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">KSh {state.total.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">KSh {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold mt-6 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'mpesa' ? 'Place Order & Pay with M-PESA' : 'Place Order & Pay on Delivery'}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-4 text-center text-sm text-gray-600">
                <p>By placing this order, you agree to our terms and conditions</p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Delivery Information</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>⏱️ Estimated delivery: 30-45 minutes</p>
                <p>📞 We'll call to confirm your order</p>
                <p>💳 Pay on delivery - {paymentMethod === 'mpesa' ? 'M-PESA or Cash' : 'Cash only'}</p>
                {paymentMethod === 'mpesa' && (
                  <p>📱 M-PESA payment details shown above</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;