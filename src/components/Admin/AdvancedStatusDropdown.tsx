import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface AdvancedStatusDropdownProps {
  orderId: number;
  currentStatus: string;
  onStatusUpdate: (orderId: number, newStatus: string) => Promise<void>;
  isUpdating?: boolean;
  pendingStatus?: string;
}

const AdvancedStatusDropdown: React.FC<AdvancedStatusDropdownProps> = ({
  orderId,
  currentStatus,
  onStatusUpdate,
  isUpdating = false,
  pendingStatus
}) => {
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'orange' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'purple' },
    { value: 'delivered', label: 'Delivered', color: 'green' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'preparing':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'out_for_delivery':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdating) return;

    // Update local state immediately for instant feedback
    setLocalStatus(newStatus);

    try {
      await onStatusUpdate(orderId, newStatus);
    } catch (error) {
      // Revert on error
      setLocalStatus(currentStatus);
    }
  };

  const displayStatus = pendingStatus || localStatus;

  return (
    <div className="relative">
      <select
        value={displayStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(displayStatus)} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
          isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
        }`}
      >
        {statusOptions.map(status => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      
      {/* Loading indicator */}
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
          <RefreshCw className="w-4 h-4 text-green-600 animate-spin" />
        </div>
      )}
      
      {/* Success indicator */}
      {pendingStatus && !isUpdating && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
          <CheckCircle className="w-2 h-2 text-white" />
        </div>
      )}
      
      {/* Error indicator */}
      {displayStatus !== currentStatus && !pendingStatus && !isUpdating && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
          <AlertTriangle className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
};

export default AdvancedStatusDropdown; 