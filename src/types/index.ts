export interface Product {
  product_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  ingredients: string;
  preparation_time: number;
  image_path: string;
  is_available: boolean;
  category_name: string;
  created_at?: string;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_path: string;
  customization?: string;
}

export interface Order {
  order_id: number;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total_amount: number;
  delivery_fee: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name?: string;
}

export interface PaymentRequest {
  payment_request_id: number;
  order_id: number;
  amount: number;
  payment_method: 'card' | 'mpesa' | 'bank_transfer' | 'cash';
  payment_instructions: string;
  due_date: string | null;
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  created_at: string;
  customer_name: string;
  phone: string;
  total_amount: number;
}

export interface CreatePaymentRequestData {
  order_id: number;
  amount: number;
  payment_method: 'card' | 'mpesa' | 'bank_transfer' | 'cash';
  payment_instructions?: string;
  due_date?: string;
}

export interface UpdatePaymentRequestData {
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  payment_instructions?: string;
}

export interface PaymentVerification {
  verification_id: number;
  order_id: number;
  transaction_code: string;
  phone_number: string;
  amount: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_by: number | null;
  verified_at: string | null;
  created_at: string;
  customer_name: string;
  order_status: string;
}

export interface VerifyTransactionData {
  order_id: number;
  transaction_code: string;
  phone_number: string;
}

export interface MPESATransaction {
  transaction_id: number;
  order_id: number;
  merchant_request_id: string;
  checkout_request_id: string;
  phone_number: string;
  amount: number;
  status: string;
  created_at: string;
}