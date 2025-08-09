import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiGet, apiPut, getAuthHeaders, API_CONFIG } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentVerification {
  verification_id: number;
  order_id: number;
  transaction_code: string;
  phone_number: string;
  amount: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_at?: string;
  customer_name: string;
  order_status: string;
}

interface PaymentVerificationsProps {
  onClose: () => void;
}

const PaymentVerifications: React.FC<PaymentVerificationsProps> = ({ onClose }) => {
  const { auth } = useAuth();
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<number | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_PAYMENT_VERIFICATIONS, {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications);
      } else {
        throw new Error('Failed to fetch verifications');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to fetch payment verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (verificationId: number, status: 'verified' | 'rejected') => {
    try {
      setVerifying(verificationId);
      const action = status === 'verified' ? 'approve' : 'reject';
      const response = await apiPut(
        API_CONFIG.ENDPOINTS.ADMIN_VERIFY_PAYMENT(verificationId.toString()),
        { action },
        { headers: getAuthHeaders(auth.token!) }
      );

      if (response.ok) {
        toast.success(`Payment ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
        fetchVerifications();
      } else {
        throw new Error('Failed to update verification');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    } finally {
      setVerifying(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Verifications</h2>
            <p className="text-gray-600 mt-1">Review and verify submitted M-PESA transaction codes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchVerifications}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading verifications...</span>
          </div>
        ) : verifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Verifications</h3>
            <p className="text-gray-600">All payment verifications have been processed or there are no pending submissions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div key={verification.verification_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(verification.verification_status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Order #{verification.order_id} - {verification.customer_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Phone: {verification.phone_number} | Amount: KSh {verification.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Transaction Code</p>
                        <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {verification.transaction_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Order Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(verification.order_status)}`}>
                          {verification.order_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Submitted: {formatDate(verification.created_at)}</p>
                      {verification.verified_at && (
                        <p>Verified: {formatDate(verification.verified_at)}</p>
                      )}
                    </div>
                  </div>
                  
                  {verification.verification_status === 'pending' && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleVerify(verification.verification_id, 'verified')}
                        disabled={verifying === verification.verification_id}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        {verifying === verification.verification_id ? 'Verifying...' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleVerify(verification.verification_id, 'rejected')}
                        disabled={verifying === verification.verification_id}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-sm"
                      >
                        <X className="w-4 h-4" />
                        {verifying === verification.verification_id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerifications;


