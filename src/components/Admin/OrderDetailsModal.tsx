import React from 'react';
import { X, Phone, MapPin, Clock, Package, User, DollarSign } from 'lucide-react';
import { Order } from '../../types';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: number, status: string) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onStatusUpdate }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'preparing':
        return 'text-orange-600 bg-orange-100';
      case 'out_for_delivery':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_id}</h2>
            <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Update */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Order Status
            </label>
            <div className="flex items-center space-x-4">
              <select
                value={order.status}
                onChange={(e) => onStatusUpdate(order.order_id, e.target.value)}
                className={`px-4 py-2 rounded-lg font-medium border ${getStatusColor(order.status)} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                Current status: {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 text-green-600 mr-2" />
                Customer Details
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{order.customer_name}</p>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href={`tel:${order.phone}`} className="hover:text-green-600 transition-colors">
                    {order.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-2" />
                Delivery Address
              </h3>
              <p className="text-gray-600">{order.delivery_address}</p>
              <button
                onClick={() => {
                  const address = encodeURIComponent(order.delivery_address);
                  window.open(`https://maps.google.com?q=${address}`, '_blank');
                }}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm transition-colors"
              >
                View on Google Maps →
              </button>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 text-green-600 mr-2" />
              Order Items
            </h3>
            
            {/* Note: You'll need to fetch order items from your backend */}
            <div className="text-gray-600">
              <p>Order items will be displayed here once you implement the order items endpoint in your backend.</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              Payment Summary
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">KSh {(order.total_amount - order.delivery_fee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">KSh {order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 text-green-600 mr-2" />
              Order Timeline
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Order Placed</p>
                  <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                </div>
              </div>
              
              {/* Add more timeline items based on order status */}
              {order.status !== 'pending' && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Confirmed</p>
                    <p className="text-sm text-gray-600">Status updated</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-4">
            <a
              href={`tel:${order.phone}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Customer</span>
            </a>
            
            <button
              onClick={() => {
                const phoneNumber = '254700000000'; // Your WhatsApp number
                const message = `Hello ${order.customer_name}, your order #${order.order_id} status has been updated. Thank you for choosing Sera's Kitchen!`;
                window.open(`https://wa.me/${order.phone.replace(/^0/, '254')}?text=${encodeURIComponent(message)}`);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>WhatsApp Customer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;