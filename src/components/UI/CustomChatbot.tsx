import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, X, Send, Bot, Phone, ArrowUp } from 'lucide-react';
import { chatbotService, ChatResponse } from '../../utils/chatbotService';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'menu' | 'order_status';
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

interface CustomChatbotProps {
  adminPhone?: string;
  businessName?: string;
}

const CustomChatbot: React.FC<CustomChatbotProps> = ({ 
  adminPhone = "0714042307", 
  businessName = "Sera's Kitchen"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoized quick replies for better performance
  const quickReplies = useMemo<QuickReply[]>(() => [
    { id: '1', text: '📋 View Menu', action: 'menu' },
    { id: '2', text: '🚚 Delivery Info', action: 'delivery' },
    { id: '3', text: '⏰ Business Hours', action: 'hours' },
    { id: '4', text: '💰 Pricing', action: 'pricing' },
    { id: '5', text: '📞 Contact Support', action: 'support' },
    { id: '6', text: '🎂 Custom Orders', action: 'custom' }
  ], []);

  // Memoized bot responses for better performance
  const botResponses = useMemo(() => ({
    greeting: [
      "Hello! Welcome to Sera's Kitchen! 👋 How can I help you today?",
      "Hi there! I'm your Sera's Kitchen assistant. What would you like to know?",
      "Welcome to Sera's Kitchen! I'm here to help with your questions."
    ],
    menu: [
      "🍽️ Here's our delicious menu:\n\n🍰 **Cakes & Desserts:**\n• Chocolate Cake - KSh 800\n• Vanilla Cake - KSh 700\n• Red Velvet - KSh 900\n• Custom Cakes - From KSh 1,200\n\n🍛 **Main Dishes:**\n• Pilau - KSh 500\n• Biryani - KSh 600\n• Fried Rice - KSh 450\n• Chicken Curry - KSh 550\n• Beef Stew - KSh 600\n\nWould you like to place an order?",
      "Here's what we're serving today:\n\n🎂 **Cakes:** Chocolate, Vanilla, Red Velvet, Custom\n🍚 **Rice Dishes:** Pilau, Biryani, Fried Rice\n🍗 **Meat Dishes:** Chicken Curry, Beef Stew\n\nAll made with fresh, local ingredients! 🌱"
    ],
         delivery: [
       "🚚 **Delivery Information:**\n\n📍 **Coverage:** Within 10km radius\n💰 **Fee:** Free delivery for all orders\n⏰ **Time:** 30-45 minutes average\n🕐 **Hours:** 8:00 AM - 10:00 PM daily\n\nWe deliver to Nairobi and surrounding areas!",
       "Our delivery service:\n\n• Within 10km radius\n• Free delivery for all orders\n• 30-45 minutes average\n• Daily 8 AM - 10 PM"
     ],
    hours: [
      "⏰ **Business Hours:**\n\n🍳 **Kitchen:** 7:00 AM - 11:00 PM\n🚚 **Delivery:** 8:00 AM - 10:00 PM\n📞 **Support:** 8:00 AM - 10:00 PM\n\nWe're open 7 days a week! 🎉",
      "We're available:\n\n• Kitchen: 7 AM - 11 PM\n• Delivery: 8 AM - 10 PM\n• Support: 8 AM - 10 PM\n\n7 days a week! 🌟"
    ],
         pricing: [
       "💰 **Our Pricing:**\n\n🍰 **Cakes:** KSh 700 - 1,200\n🍛 **Main Dishes:** KSh 450 - 600\n🚚 **Delivery:** Free for all orders\n\nNo minimum order required!",
       "Pricing breakdown:\n\n• Cakes: KSh 700-1,200\n• Main dishes: KSh 450-600\n• Delivery: Free for all orders\n• No minimum order required"
     ],
    support: [
             "📞 **Contact Support:**\n\n📱 **WhatsApp:** 0714042307\n📧 **Email:** info@seraskitchen.com\n⏰ **Hours:** 8 AM - 10 PM\n\nWe're here to help! 🤝",
       "Need help? Contact us:\n\n• WhatsApp: 0714042307\n• Email: info@seraskitchen.com\n• Hours: 8 AM - 10 PM"
    ],
    custom: [
      "🎨 **Custom Orders:**\n\nWe specialize in custom cakes and catering!\n\n📋 **What we need:**\n• Type of item\n• Size/quantity\n• Date and time\n• Special requirements\n• Budget range\n\n⏰ **Lead time:** 24-72 hours\n\nWould you like to discuss your custom order?",
      "Custom orders available:\n\n• Custom cakes\n• Catering services\n• Special dietary needs\n• Event planning\n\n24-72 hours notice required. Let's create something amazing together! ✨"
    ],
    fallback: [
      "I'm not sure I understood that. Could you try asking about our menu, delivery, pricing, or business hours?",
      "I didn't catch that. You can ask me about:\n• Our menu\n• Delivery information\n• Business hours\n• Pricing\n• Custom orders"
    ]
  }), []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)],
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, botResponses.greeting]);

  // Simulate typing effect
  const simulateTyping = useCallback(async (response: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    return response;
  }, []);

  // Process user input using the chatbot service
  const processUserInput = useCallback(async (input: string): Promise<ChatResponse> => {
    return await chatbotService.processInput(input, sessionId);
  }, [sessionId]);

  // Handle sending message
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatResponse = await processUserInput(text);
      const botResponse = await simulateTyping(chatResponse.text);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: chatResponse.action as any
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [processUserInput, simulateTyping]);

  // Handle quick reply
  const handleQuickReply = useCallback(async (action: string) => {
    const quickReplyText = quickReplies.find(qr => qr.action === action)?.text || '';
    await handleSendMessage(quickReplyText);
  }, [quickReplies, handleSendMessage]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue);
    }
  }, [inputValue, isLoading, handleSendMessage]);

  // Open WhatsApp
  const openWhatsApp = useCallback(() => {
    const cleanPhone = adminPhone.replace(/\D/g, '');
    const message = `Hi ${businessName}! 👋\n\nI'd like to speak with a human representative.\n\nThank you!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }, [adminPhone, businessName]);

  return (
    <>
      {/* Floating Chat Button - Visible on all devices */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 lg:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="Chat with our AI assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Bot className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Chat Interface - Visible on all devices */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 lg:w-96 h-[400px] lg:h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{businessName} AI</h3>
                  <p className="text-sm text-blue-100">🤖 AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-blue-100 mt-2">Ask me anything about our menu, delivery, or services!</p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.slice(0, 3).map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReply(reply.action)}
                    disabled={isLoading}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="px-4 pb-4 flex space-x-2">
            <button
              onClick={openWhatsApp}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleQuickReply('menu')}
              disabled={isLoading}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomChatbot;
