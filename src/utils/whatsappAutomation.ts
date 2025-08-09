// WhatsApp Automation Utilities
// Free implementation using direct WhatsApp Web links

export interface OrderStatusData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  estimatedTime?: string;
  deliveryAddress?: string;
  totalAmount?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  category: string;
}

// Pre-defined message templates
export const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: 'order_confirmed',
    name: 'Order Confirmed',
    message: `🎉 Great news, {customerName}!

Your order #{orderId} has been confirmed!

📋 Order Details:
{orderItems}

💰 Total: KSh {totalAmount}
🚚 Delivery to: {deliveryAddress}
⏰ Estimated time: {estimatedTime}

We're preparing your delicious meal with love! 👨‍🍳

Track your order: {trackingLink}

Thank you for choosing Sera's Kitchen! 🍰`,
    category: 'order_status'
  },
  {
    id: 'order_preparing',
    name: 'Order Being Prepared',
    message: `👨‍🍳 Hi {customerName}!

Your order #{orderId} is now being prepared in our kitchen!

🔥 Our chefs are working their magic to create your delicious meal.

⏰ Estimated completion: {estimatedTime}
📱 We'll notify you when it's ready for delivery!

Hungry already? We're cooking as fast as we can! 😊

Sera's Kitchen - Where every meal is made with love! ❤️`,
    category: 'order_status'
  },
  {
    id: 'order_out_for_delivery',
    name: 'Out for Delivery',
    message: `🚚 On the way, {customerName}!

Your order #{orderId} is out for delivery!

📍 Delivery address: {deliveryAddress}
⏰ Expected arrival: {estimatedTime}
📞 Driver contact: Available on request

Please ensure someone is available to receive the order.

Almost there! Get ready to enjoy your meal! 🍽️

Sera's Kitchen - Delivering happiness to your doorstep! 🎉`,
    category: 'order_status'
  },
  {
    id: 'order_delivered',
    name: 'Order Delivered',
    message: `✅ Delivered! {customerName}

Your order #{orderId} has been successfully delivered!

We hope you enjoy every bite of your delicious meal! 😋

💭 How was your experience?
⭐ We'd love your feedback!
🔄 Order again anytime!

Thank you for choosing Sera's Kitchen!
Your satisfaction is our priority! ❤️

#SerasKitchen #DeliveredWithLove`,
    category: 'order_status'
  },
  {
    id: 'menu_info_cakes',
    name: 'Cake Menu Information',
    message: `🍰 Our Delicious Cakes Menu!

Hi {customerName}! Here are our available cakes:

🎂 **Chocolate Cake** - KSh 800
Rich, moist chocolate cake with chocolate frosting

🍰 **Vanilla Cake** - KSh 700  
Classic vanilla sponge with vanilla buttercream

❤️ **Red Velvet** - KSh 900
Smooth red velvet with cream cheese frosting

🎉 **Custom Cakes** - From KSh 1,200
Birthday, wedding, or special occasion cakes

📱 Ready to order? Just let us know!
🚚 Free delivery within 10km!

Sera's Kitchen - Making your celebrations sweeter! 🎈`,
    category: 'menu_inquiry'
  },
  {
    id: 'menu_info_main_dishes',
    name: 'Main Dishes Menu',
    message: `🍛 Our Main Dishes Menu!

Hi {customerName}! Here's what we're serving:

🍚 **Pilau** - KSh 500
Aromatic spiced rice with tender meat

🍛 **Biryani** - KSh 600
Fragrant basmati rice with marinated chicken

🍳 **Fried Rice** - KSh 450
Wok-fried rice with vegetables and egg

🍗 **Chicken Curry** - KSh 550
Rich coconut curry with jasmine rice

🥘 **Beef Stew** - KSh 600
Slow-cooked beef with ugali or rice

📱 Ready to order? We're here to serve!
🚚 Delivery fee: KSh 200

Sera's Kitchen - Authentic flavors, delivered fresh! 🔥`,
    category: 'menu_inquiry'
  },
  {
    id: 'delivery_info',
    name: 'Delivery Information',
    message: `🚚 Sera's Kitchen Delivery Info

Hi {customerName}! Here's everything about our delivery:

📍 **Coverage Area:**
- Within 10km radius from our kitchen
- Nairobi and surrounding areas

💰 **Delivery Fee:** KSh 200
(Free for orders above KSh 2,000!)

⏰ **Delivery Times:**
- Monday - Sunday: 8:00 AM - 10:00 PM
- Average delivery time: 30-45 minutes

📱 **How to Order:**
1. Browse our menu
2. Place your order via WhatsApp
3. Confirm delivery address
4. Pay via M-PESA or cash on delivery

Need to check if we deliver to your area? Just share your location! 📍

Sera's Kitchen - We bring the feast to you! 🎉`,
    category: 'delivery'
  },
  {
    id: 'business_hours',
    name: 'Business Hours',
    message: `⏰ Sera's Kitchen Operating Hours

Hi {customerName}! Here's when we're available:

🍳 **Kitchen Hours:**
Monday - Sunday: 7:00 AM - 11:00 PM

🚚 **Delivery Hours:**  
Monday - Sunday: 8:00 AM - 10:00 PM

📞 **Customer Service:**
Monday - Sunday: 8:00 AM - 10:00 PM

💬 **WhatsApp Orders:**
24/7 - We'll respond during business hours

🎉 **Special Hours:**
- Public holidays: 9:00 AM - 9:00 PM
- Extended hours during festive seasons

Currently: {currentStatus}

Ready to order? We're here to serve! 🍽️

Sera's Kitchen - Serving you with love, every day! ❤️`,
    category: 'general'
  },
  {
    id: 'custom_order_response',
    name: 'Custom Order Response',
    message: `🎨 Custom Order Inquiry - {customerName}

Thank you for your interest in a custom order!

To provide you with the best quote and service, please share:

📋 **Order Details:**
• What type of item? (cake, meal, catering, etc.)
• Size/quantity needed
• Preferred date and time
• Special dietary requirements
• Design preferences (for cakes)
• Budget range

⏰ **Lead Time:**
• Custom cakes: 48-72 hours notice
• Catering orders: 24-48 hours notice  
• Special meals: 12-24 hours notice

💰 **Pricing:**
We'll provide a detailed quote within 2 hours of receiving your requirements.

📱 **Next Steps:**
Reply with your details, and our team will create something amazing for you!

Sera's Kitchen - Where your vision becomes delicious reality! ✨`,
    category: 'custom_order'
  },
  {
    id: 'support_response',
    name: 'Customer Support',
    message: `🛟 Sera's Kitchen Support Team

Hi {customerName}! We're here to help!

We've received your support request and want to resolve this quickly.

📋 **Your Issue:** {issueDescription}
📞 **Reference:** #{supportTicketId}

⚡ **Immediate Actions:**
• Our team is reviewing your case
• Expected response time: 15-30 minutes
• You'll receive updates via WhatsApp

🤝 **How We Can Help:**
• Order modifications or cancellations
• Delivery tracking and updates  
• Payment and refund assistance
• Quality concerns or feedback
• General inquiries

📱 **Need Urgent Help?**
For immediate assistance, call us at: 0700 000 000

We value your business and will make this right!

Sera's Kitchen - Your satisfaction is our priority! 🌟`,
    category: 'support'
  }
];

// Utility functions
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle Kenyan numbers
  if (digits.startsWith('254')) {
    return digits;
  } else if (digits.startsWith('0')) {
    return '254' + digits.substring(1);
  } else if (digits.startsWith('7') || digits.startsWith('1')) {
    return '254' + digits;
  }
  
  return digits;
};

export const formatOrderItems = (items: OrderStatusData['items']): string => {
  if (!items || items.length === 0) return '';
  
  return items.map((item, index) => 
    `${index + 1}. ${item.name} x${item.quantity} - KSh ${item.price * item.quantity}`
  ).join('\n');
};

export const getStatusEmoji = (status: OrderStatusData['status']): string => {
  const emojis = {
    pending: '⏳',
    confirmed: '✅',
    preparing: '👨‍🍳',
    out_for_delivery: '🚚',
    delivered: '🎉'
  };
  return emojis[status] || '📋';
};

export const getStatusMessage = (status: OrderStatusData['status']): string => {
  const messages = {
    pending: 'Order received and being reviewed',
    confirmed: 'Order confirmed and queued for preparation',
    preparing: 'Being prepared in our kitchen',
    out_for_delivery: 'On the way to you',
    delivered: 'Successfully delivered'
  };
  return messages[status] || 'Status unknown';
};

export const fillTemplate = (template: WhatsAppTemplate, data: any): string => {
  let message = template.message;
  
  // Replace common placeholders
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`;
    const value = data[key] || '';
    message = message.replace(new RegExp(placeholder, 'g'), value.toString());
  });
  
  // Handle special formatting
  if (data.orderItems && Array.isArray(data.orderItems)) {
    const formattedItems = formatOrderItems(data.orderItems);
    message = message.replace('{orderItems}', formattedItems);
  }
  
  if (data.currentTime) {
    const now = new Date();
    const hour = now.getHours();
    const isOpen = hour >= 8 && hour <= 22;
    const currentStatus = isOpen ? '🟢 Currently Open' : '🔴 Currently Closed';
    message = message.replace('{currentStatus}', currentStatus);
  }
  
  if (data.trackingLink) {
    message = message.replace('{trackingLink}', data.trackingLink || 'Contact us for tracking info');
  }
  
  // Clean up any remaining placeholders
  message = message.replace(/\{[^}]*\}/g, '');
  
  return message.trim();
};

export const generateOrderStatusMessage = (orderData: OrderStatusData): string => {
  const template = whatsappTemplates.find(t => t.id === `order_${orderData.status}`);
  if (!template) return `Order #${orderData.orderId} status: ${orderData.status}`;
  
  return fillTemplate(template, {
    ...orderData,
    orderItems: orderData.items,
    trackingLink: `${window.location.origin}/track-order?id=${orderData.orderId}`
  });
};

export const openWhatsAppWithMessage = (phone: string, message: string): void => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

// Auto-response suggestions based on keywords
export const getAutoResponseSuggestion = (customerMessage: string): WhatsAppTemplate | null => {
  const message = customerMessage.toLowerCase();
  
  // Order status keywords
  if (message.includes('order') && (message.includes('status') || message.includes('track') || message.includes('where'))) {
    return whatsappTemplates.find(t => t.id === 'order_confirmed') || null;
  }
  
  // Menu keywords
  if (message.includes('menu') || message.includes('price') || message.includes('available')) {
    if (message.includes('cake')) {
      return whatsappTemplates.find(t => t.id === 'menu_info_cakes') || null;
    }
    return whatsappTemplates.find(t => t.id === 'menu_info_main_dishes') || null;
  }
  
  // Delivery keywords
  if (message.includes('deliver') || message.includes('location') || message.includes('area')) {
    return whatsappTemplates.find(t => t.id === 'delivery_info') || null;
  }
  
  // Business hours keywords
  if (message.includes('hours') || message.includes('open') || message.includes('close') || message.includes('time')) {
    return whatsappTemplates.find(t => t.id === 'business_hours') || null;
  }
  
  // Custom order keywords
  if (message.includes('custom') || message.includes('special') || message.includes('design')) {
    return whatsappTemplates.find(t => t.id === 'custom_order_response') || null;
  }
  
  // Support keywords
  if (message.includes('help') || message.includes('problem') || message.includes('issue') || message.includes('complaint')) {
    return whatsappTemplates.find(t => t.id === 'support_response') || null;
  }
  
  return null;
};

// Generate quick action links for admin
export const generateQuickActions = (customerPhone: string, customerName: string) => {
  const formattedPhone = formatPhoneNumber(customerPhone);
  
  return {
    call: `tel:+${formattedPhone}`,
    whatsapp: `https://wa.me/${formattedPhone}`,
    orderStatus: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Hi ${customerName}! Let me check your order status for you. Please share your order number.`)}`,
    menuInfo: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(fillTemplate(whatsappTemplates.find(t => t.id === 'menu_info_main_dishes')!, { customerName }))}`,
    deliveryInfo: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(fillTemplate(whatsappTemplates.find(t => t.id === 'delivery_info')!, { customerName }))}`
  };
};

export default {
  whatsappTemplates,
  formatPhoneNumber,
  fillTemplate,
  generateOrderStatusMessage,
  openWhatsAppWithMessage,
  getAutoResponseSuggestion,
  generateQuickActions
};