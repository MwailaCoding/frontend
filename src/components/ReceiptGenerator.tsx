import { API_CONFIG } from '../config/api';

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ReceiptData {
  order_id: number;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total_amount: number;
  delivery_fee: number;
  payment_method: string;
  created_at: string;
  special_instructions?: string;
  items: ReceiptItem[];
}

export async function generateReceipt(orderId: number): Promise<void> {
  try {
    // Call backend API to generate and download PDF receipt
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/receipt/${orderId}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate receipt');
    }

    // Get the PDF blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seras-kitchen-receipt-${orderId}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    throw new Error('Failed to generate receipt');
  }
}

export async function getReceiptData(orderId: number): Promise<ReceiptData | null> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/receipt/${orderId}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}




