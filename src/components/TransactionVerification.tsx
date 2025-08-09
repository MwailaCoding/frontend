import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiPost, API_CONFIG } from '../config/api';
import { VerifyTransactionData } from '../types';

interface TransactionVerificationProps {
  orderId: number;
  phoneNumber: string;
  amount: number;
  onClose: () => void;
  onVerificationSubmitted: () => void;
}

const TransactionVerification: React.FC<TransactionVerificationProps> = ({
  orderId,
  phoneNumber,
  amount,
  onClose,
  onVerificationSubmitted
}) => {
  const [transactionCode, setTransactionCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionCode.trim()) {
      toast.error('Please enter your M-PESA transaction code');
      return;
    }

    setLoading(true);
    try {
      const verificationData: VerifyTransactionData = {
        order_id: orderId,
        transaction_code: transactionCode.trim(),
        phone_number: phoneNumber
      };

      const response = await apiPost(API_CONFIG.ENDPOINTS.VERIFY_TRANSACTION, verificationData);

      if (response.ok) {
        const data = await response.json();
        toast.success('Transaction code submitted for verification!');
        onVerificationSubmitted();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit transaction code');
      }
    } catch (error) {
      console.error('Error submitting transaction code:', error);
      toast.error('Failed to submit transaction code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Verify M-PESA Payment</h2>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong>
          </p>
          <ol className="text-sm text-blue-700 mt-2 space-y-1">
            <li>1. Pay via M-PESA using the details below</li>
            <li>2. Copy your transaction code from the M-PESA message</li>
            <li>3. Enter the transaction code below</li>
            <li>4. Submit for verification</li>
          </ol>
        </div>

        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">M-PESA Send Money Details</h3>
          <div className="space-y-1 text-sm text-green-700">
            <div className="flex justify-between">
              <span>Phone Number:</span>
              <span className="font-mono font-semibold">0714042307</span>
            </div>
            <div className="flex justify-between">
              <span>Account Name:</span>
              <span className="font-mono font-semibold">SERAPHINE MAITHAH</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-mono font-semibold">KSh {amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              M-PESA Transaction Code *
            </label>
            <input
              type="text"
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your M-PESA transaction code"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in your M-PESA confirmation message
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p><strong>Note:</strong> Your order will be processed after payment verification.</p>
              <p>You can also pay cash on delivery if preferred.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionVerification; 