// Performance-optimized Chatbot Service
// Handles intelligent responses and conversation context

export interface ChatContext {
  userId?: string;
  sessionId: string;
  conversationHistory: string[];
  userPreferences: {
    dietaryRestrictions?: string[];
    favoriteCategories?: string[];
    deliveryAddress?: string;
  };
  lastInteraction: Date;
}

export interface ChatResponse {
  text: string;
  action?: 'menu' | 'delivery' | 'hours' | 'pricing' | 'support' | 'custom' | 'order' | 'fallback';
  quickReplies?: Array<{
    id: string;
    text: string;
    action: string;
  }>;
  metadata?: {
    confidence: number;
    intent: string;
    entities: string[];
  };
}

// Pre-compiled response templates for better performance
const RESPONSE_TEMPLATES = {
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
    "🚚 **Delivery Information:**\n\n📍 **Coverage:** Within 10km radius\n💰 **Fee:** KSh 200 (Free for orders above KSh 2,000)\n⏰ **Time:** 30-45 minutes average\n🕐 **Hours:** 8:00 AM - 10:00 PM daily\n\nWe deliver to Nairobi and surrounding areas!",
    "Our delivery service:\n\n• Within 10km radius\n• KSh 200 delivery fee\n• 30-45 minutes average\n• Daily 8 AM - 10 PM\n• Free delivery for orders above KSh 2,000"
  ],
  hours: [
    "⏰ **Business Hours:**\n\n🍳 **Kitchen:** 7:00 AM - 11:00 PM\n🚚 **Delivery:** 8:00 AM - 10:00 PM\n📞 **Support:** 8:00 AM - 10:00 PM\n\nWe're open 7 days a week! 🎉",
    "We're available:\n\n• Kitchen: 7 AM - 11 PM\n• Delivery: 8 AM - 10 PM\n• Support: 8 AM - 10 PM\n\n7 days a week! 🌟"
  ],
  pricing: [
    "💰 **Our Pricing:**\n\n🍰 **Cakes:** KSh 700 - 1,200\n🍛 **Main Dishes:** KSh 450 - 600\n🚚 **Delivery:** KSh 200\n\nFree delivery for orders above KSh 2,000!",
    "Pricing breakdown:\n\n• Cakes: KSh 700-1,200\n• Main dishes: KSh 450-600\n• Delivery: KSh 200\n• Free delivery on orders above KSh 2,000"
  ],
  support: [
    "📞 **Contact Support:**\n\n📱 **WhatsApp:** +254714042307\n📧 **Email:** info@seraskitchen.com\n⏰ **Hours:** 8 AM - 10 PM\n\nWe're here to help! 🤝",
    "Need help? Contact us:\n\n• WhatsApp: +254714042307\n• Email: info@seraskitchen.com\n• Hours: 8 AM - 10 PM"
  ],
  custom: [
    "🎨 **Custom Orders:**\n\nWe specialize in custom cakes and catering!\n\n📋 **What we need:**\n• Type of item\n• Size/quantity\n• Date and time\n• Special requirements\n• Budget range\n\n⏰ **Lead time:** 24-72 hours\n\nWould you like to discuss your custom order?",
    "Custom orders available:\n\n• Custom cakes\n• Catering services\n• Special dietary needs\n• Event planning\n\n24-72 hours notice required. Let's create something amazing together! ✨"
  ],
  fallback: [
    "I'm not sure I understood that. Could you try asking about our menu, delivery, pricing, or business hours?",
    "I didn't catch that. You can ask me about:\n• Our menu\n• Delivery information\n• Business hours\n• Pricing\n• Custom orders"
  ]
};

// Intent patterns for better matching
const INTENT_PATTERNS = {
  menu: [
    'menu', 'food', 'dish', 'eat', 'hungry', 'what do you have', 'available', 'serve', 'offer'
  ],
  delivery: [
    'deliver', 'delivery', 'area', 'location', 'distance', 'how far', 'coverage', 'zone'
  ],
  hours: [
    'hour', 'open', 'time', 'when', 'schedule', 'operating', 'business hours', 'close'
  ],
  pricing: [
    'price', 'cost', 'how much', 'expensive', 'cheap', 'budget', 'fee', 'charge'
  ],
  support: [
    'support', 'help', 'contact', 'problem', 'issue', 'complaint', 'assist'
  ],
  custom: [
    'custom', 'special', 'cake', 'catering', 'event', 'party', 'celebration', 'design'
  ],
  order: [
    'order', 'buy', 'purchase', 'place order', 'get', 'want', 'need'
  ]
};

// Performance-optimized intent detection
const detectIntent = (input: string): { intent: string; confidence: number } => {
  const lowerInput = input.toLowerCase();
  let bestMatch = { intent: 'fallback', confidence: 0 };

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let matches = 0;
    for (const pattern of patterns) {
      if (lowerInput.includes(pattern)) {
        matches++;
      }
    }
    
    const confidence = matches / patterns.length;
    if (confidence > bestMatch.confidence) {
      bestMatch = { intent, confidence };
    }
  }

  return bestMatch;
};

// Context-aware response generation
const generateContextualResponse = (
  intent: string, 
  context: ChatContext, 
  userInput: string
): ChatResponse => {
  const templates = RESPONSE_TEMPLATES[intent as keyof typeof RESPONSE_TEMPLATES] || RESPONSE_TEMPLATES.fallback;
  const response = templates[Math.floor(Math.random() * templates.length)];

  // Add contextual quick replies based on conversation history
  const quickReplies = generateQuickReplies(intent, context);

  return {
    text: response,
    action: intent as any,
    quickReplies,
    metadata: {
      confidence: 0.8,
      intent,
      entities: extractEntities(userInput)
    }
  };
};

// Generate contextual quick replies
const generateQuickReplies = (intent: string, context: ChatContext) => {
  const baseReplies = [
    { id: '1', text: '📋 View Menu', action: 'menu' },
    { id: '2', text: '🚚 Delivery Info', action: 'delivery' },
    { id: '3', text: '⏰ Business Hours', action: 'hours' },
    { id: '4', text: '💰 Pricing', action: 'pricing' },
    { id: '5', text: '📞 Contact Support', action: 'support' },
    { id: '6', text: '🎂 Custom Orders', action: 'custom' }
  ];

  // Filter based on context and intent
  if (intent === 'menu') {
    return [
      { id: 'order', text: '🛒 Place Order', action: 'order' },
      { id: 'delivery', text: '🚚 Delivery Info', action: 'delivery' },
      { id: 'pricing', text: '💰 Pricing', action: 'pricing' }
    ];
  }

  if (intent === 'delivery') {
    return [
      { id: 'menu', text: '📋 View Menu', action: 'menu' },
      { id: 'hours', text: '⏰ Business Hours', action: 'hours' },
      { id: 'support', text: '📞 Contact Support', action: 'support' }
    ];
  }

  return baseReplies.slice(0, 3);
};

// Extract entities from user input
const extractEntities = (input: string): string[] => {
  const entities: string[] = [];
  const lowerInput = input.toLowerCase();

  // Extract food items
  const foodItems = ['cake', 'chocolate', 'vanilla', 'pilau', 'biryani', 'rice', 'chicken', 'beef', 'curry'];
  foodItems.forEach(item => {
    if (lowerInput.includes(item)) {
      entities.push(item);
    }
  });

  // Extract time references
  const timePatterns = ['now', 'today', 'tomorrow', 'morning', 'afternoon', 'evening'];
  timePatterns.forEach(time => {
    if (lowerInput.includes(time)) {
      entities.push(time);
    }
  });

  return entities;
};

// Main chatbot service class
export class ChatbotService {
  private static instance: ChatbotService;
  private contexts: Map<string, ChatContext> = new Map();

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  // Process user input with context awareness
  async processInput(
    userInput: string, 
    sessionId: string, 
    userId?: string
  ): Promise<ChatResponse> {
    // Get or create context
    const context = this.getOrCreateContext(sessionId, userId);
    
    // Update context
    context.conversationHistory.push(userInput);
    context.lastInteraction = new Date();
    
    // Detect intent
    const { intent, confidence } = detectIntent(userInput);
    
    // Generate contextual response
    const response = generateContextualResponse(intent, context, userInput);
    
    // Update context with response
    context.conversationHistory.push(response.text);
    
    // Clean up old contexts (performance optimization)
    this.cleanupOldContexts();
    
    return response;
  }

  // Get or create conversation context
  private getOrCreateContext(sessionId: string, userId?: string): ChatContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        userId,
        sessionId,
        conversationHistory: [],
        userPreferences: {},
        lastInteraction: new Date()
      });
    }
    return this.contexts.get(sessionId)!;
  }

  // Clean up old contexts to prevent memory leaks
  private cleanupOldContexts(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    for (const [sessionId, context] of this.contexts.entries()) {
      if (context.lastInteraction < oneHourAgo) {
        this.contexts.delete(sessionId);
      }
    }
  }

  // Get conversation history
  getConversationHistory(sessionId: string): string[] {
    const context = this.contexts.get(sessionId);
    return context ? context.conversationHistory : [];
  }

  // Update user preferences
  updateUserPreferences(sessionId: string, preferences: Partial<ChatContext['userPreferences']>): void {
    const context = this.getOrCreateContext(sessionId);
    context.userPreferences = { ...context.userPreferences, ...preferences };
  }

  // Clear conversation context
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }
}

// Export singleton instance
export const chatbotService = ChatbotService.getInstance();
