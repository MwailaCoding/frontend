export const SEO_CONFIG = {
  default: {
    title: "Sera's Kitchen - Authentic Kenyan Cuisine & Delicious Cakes",
    description: "Discover authentic Kenyan cuisine and delicious homemade cakes from Sera's Kitchen. Order fresh, traditional dishes and custom cakes online. Fast delivery, authentic flavors.",
    keywords: "Kenyan food, authentic cuisine, homemade cakes, traditional dishes, African food, Nairobi cuisine, cake delivery, Kenyan recipes, fresh cakes, local food",
    image: "/logo.png",
    type: "website" as const,
  },
  
  home: {
    title: "Sera's Kitchen - Authentic Kenyan Cuisine & Premium Catering Services",
    description: "Transform your events with authentic Kenyan cuisine and artisan cakes from Sera's Kitchen. Premium catering services, fast delivery, and unforgettable flavors. Order online today!",
    keywords: "Kenyan catering, premium catering services, artisan cakes, authentic Kenyan cuisine, event catering, Nairobi catering, African food catering, custom cakes, wedding catering, corporate catering",
    image: "/logo.png",
    type: "website" as const,
  },
  
  products: {
    title: "Menu - Authentic Kenyan Food & Delicious Cakes | Sera's Kitchen",
    description: "Explore our complete menu featuring authentic Kenyan dishes, traditional recipes, and homemade cakes. Fresh ingredients, authentic flavors, and fast delivery.",
    keywords: "Kenyan menu, traditional food, authentic recipes, homemade cakes, African cuisine, Nairobi food, local dishes, fresh ingredients, fast delivery",
    image: "/logo.png",
    type: "website" as const,
  },
  
  productDetail: {
    title: "Product Details - Sera's Kitchen",
    description: "Discover the authentic flavors and ingredients of our products. Fresh, homemade, and delivered to your door.",
    keywords: "product details, ingredients, nutritional info, authentic flavors, fresh food, homemade",
    image: "/logo.png",
    type: "product" as const,
  },
  
  cart: {
    title: "Shopping Cart - Sera's Kitchen",
    description: "Review your order and proceed to checkout. Fast, secure, and convenient online ordering.",
    keywords: "shopping cart, order review, checkout, online ordering, secure payment",
    image: "/logo.png",
    type: "website" as const,
  },
  
  checkout: {
    title: "Checkout - Secure Payment | Sera's Kitchen",
    description: "Complete your order with our secure checkout process. Fast delivery and excellent customer service guaranteed.",
    keywords: "checkout, secure payment, order completion, fast delivery, customer service",
    image: "/logo.png",
    type: "website" as const,
  },
  
  orderTracking: {
    title: "Track Your Order - Sera's Kitchen",
    description: "Track your order status in real-time. Get updates on delivery progress and estimated arrival time.",
    keywords: "order tracking, delivery status, real-time updates, delivery progress, estimated arrival",
    image: "/logo.png",
    type: "website" as const,
  },
  
  privacyPolicy: {
    title: "Privacy Policy - Sera's Kitchen",
    description: "Learn how we protect your privacy and handle your personal information. Transparent and secure data practices.",
    keywords: "privacy policy, data protection, personal information, security, transparency",
    image: "/logo.png",
    type: "website" as const,
  },
  
  termsOfService: {
    title: "Terms of Service - Sera's Kitchen",
    description: "Read our terms of service and understand your rights and responsibilities when using our platform.",
    keywords: "terms of service, user rights, responsibilities, platform usage, legal terms",
    image: "/logo.png",
    type: "website" as const,
  },
};

export const STRUCTURED_DATA = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sera's Kitchen",
    "url": "https://your-domain.vercel.app",
    "logo": "https://your-domain.vercel.app/logo.png",
    "description": "Authentic Kenyan cuisine and delicious homemade cakes",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KE",
      "addressLocality": "Nairobi"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+254-XXX-XXX-XXX",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://www.facebook.com/seraskitchen",
      "https://www.instagram.com/seraskitchen"
    ]
  },
  
  restaurant: {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Sera's Kitchen",
    "description": "Authentic Kenyan cuisine and delicious homemade cakes",
    "url": "https://your-domain.vercel.app",
    "logo": "https://your-domain.vercel.app/logo.png",
    "image": "https://your-domain.vercel.app/logo.png",
    "telephone": "+254-XXX-XXX-XXX",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KE",
      "addressLocality": "Nairobi"
    },
    "servesCuisine": ["Kenyan", "African", "Cakes", "Desserts"],
    "priceRange": "$$",
    "openingHours": "Mo-Su 08:00-22:00",
    "deliveryAvailable": true,
    "takeoutAvailable": true,
    "cateringAvailable": true,
    "menu": "https://your-domain.vercel.app/products",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1247"
    }
  },
  
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sera's Kitchen",
    "url": "https://your-domain.vercel.app",
    "description": "Online platform for authentic Kenyan cuisine and homemade cakes",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://your-domain.vercel.app/products?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
};

export const generateProductStructuredData = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description || "Delicious food from Sera's Kitchen",
  "image": product.image_path ? `https://your-domain.vercel.app${product.image_path}` : "https://your-domain.vercel.app/logo.png",
  "brand": {
    "@type": "Brand",
    "name": "Sera's Kitchen"
  },
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "KES",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Sera's Kitchen"
    }
  },
  "aggregateRating": product.rating ? {
    "@type": "AggregateRating",
    "ratingValue": product.rating,
    "reviewCount": "1"
  } : undefined
});
