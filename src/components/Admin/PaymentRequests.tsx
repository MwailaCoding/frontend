import React, { useState, useEffect } from 'react';
import { Plus, Edit, CheckCircle, XCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { apiGet, apiPost, apiPut, getAuthHeaders, API_CONFIG } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentRequest, CreatePaymentRequestData, UpdatePaymentRequestData } from '../../types';

interface PaymentRequestsProps {
  onClose: () => void;
}

const PaymentRequests: React.FC<PaymentRequestsProps> = ({ onClose }) => {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PaymentRequest | null>(null);
  const [formData, setFormData] = useState<CreatePaymentRequestData>({
    order_id: 0,
    amount: 0,
    payment_method: 'mpesa',
    payment_instructions: '',
    due_date: ''
  });
  const { auth } = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      fetchPaymentRequests();
      fetchOrders();
    }
  }, [auth.isAuthenticated, auth.token]);

  const fetchPaymentRequests = async () => {
    try {
      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_PAYMENT_REQUESTS, {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentRequests(data.payment_requests || []);
      }
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_ORDERS, {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreatePaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiPost(
        API_CONFIG.ENDPOINTS.ADMIN_PAYMENT_REQUESTS,
        formData
      );

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          order_id: 0,
          amount: 0,
          payment_method: 'mpesa',
          payment_instructions: '',
          due_date: ''
        });
        fetchPaymentRequests();
      }
    } catch (error) {
      console.error('Error creating payment request:', error);
    }
  };

  const handleUpdatePaymentRequest = async (requestId: number, updateData: UpdatePaymentRequestData) => {
    try {
      const response = await apiPut(
        API_CONFIG.ENDPOINTS.ADMIN_PAYMENT_REQUEST_UPDATE(requestId.toString()),
        updateData,
        { headers: getAuthHeaders(auth.token!) }
      );

      if (response.ok) {
        setEditingRequest(null);
        fetchPaymentRequests();
      }
    } catch (error) {
      console.error('Error updating payment request:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Requests</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Payment Request
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>

      {/* Payment Requests List */}
      <div className="space-y-4">
        {paymentRequests.map((request) => (
          <div key={request.payment_request_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg">
                    Payment Request #{request.payment_request_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Order #{request.order_id} - {request.customer_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(request.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <span className="text-xs text-gray-500">Customer</span>
                <p className="text-sm font-medium">{request.customer_name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Phone</span>
                <p className="text-sm">{request.phone}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Amount</span>
                <p className="text-sm font-medium">${request.amount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-xs text-gray-500">Payment Method</span>
                <p className="text-sm font-medium capitalize">{request.payment_method.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Due Date</span>
                <p className="text-sm">
                  {request.due_date ? formatDate(request.due_date) : 'No due date'}
                </p>
              </div>
            </div>

            {request.payment_instructions && (
              <div className="mb-3">
                <span className="text-xs text-gray-500">Instructions</span>
                <p className="text-sm bg-gray-50 p-2 rounded">{request.payment_instructions}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Created: {formatDate(request.created_at)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingRequest(request)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdatePaymentRequest(request.payment_request_id, { status: 'paid' })}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Mark Paid
                    </button>
                    <button
                      onClick={() => handleUpdatePaymentRequest(request.payment_request_id, { status: 'cancelled' })}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {paymentRequests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No payment requests found</p>
          </div>
        )}
      </div>

      {/* Create Payment Request Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Payment Request</h3>
            
            <form onSubmit={handleCreatePaymentRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an order</option>
                  {orders.map((order) => (
                    <option key={order.order_id} value={order.order_id}>
                      Order #{order.order_id} - {order.customer_name} (${order.total_amount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="mpesa">M-PESA</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Instructions (Optional)
                </label>
                <textarea
                  value={formData.payment_instructions}
                  onChange={(e) => setFormData({ ...formData, payment_instructions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter payment instructions for the customer..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Payment Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Request Form */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Payment Request</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdatePaymentRequest(editingRequest.payment_request_id, {
                status: editingRequest.status,
                payment_instructions: editingRequest.payment_instructions
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingRequest.status}
                  onChange={(e) => setEditingRequest({ ...editingRequest, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Instructions
                </label>
                <textarea
                  value={editingRequest.payment_instructions}
                  onChange={(e) => setEditingRequest({ ...editingRequest, payment_instructions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter payment instructions for the customer..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Update Payment Request
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRequests; 