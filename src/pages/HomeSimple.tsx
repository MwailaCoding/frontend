import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Star, Clock, Truck, Shield, Heart, 
  ChevronLeft, ChevronRight, Play, TrendingUp, Award,
  Users, MapPin, Phone, MessageCircle, Gift, Zap,
  Check, ArrowRight, Filter, Search, Grid3X3, List,
  Sparkles, Crown, Target, Flame, ChefHat, Coffee
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { apiGet, API_CONFIG } from '../config/api';
import SimpleHero from '../components/UI/SimpleHero';
import SimpleProductCard from '../components/Products/SimpleProductCard';

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description?: string;
  rating?: number;
  is_popular?: boolean;
  is_new?: boolean;
  discount?: number;
}

interface HomeStats {
  totalOrders: number;
  happyCustomers: number;
  averageRating: number;
  deliveryTime: string;
}

const HomeSimple = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeStats, setHomeStats] = useState<HomeStats>({
    totalOrders: 500,
    happyCustomers: 350,
    averageRating: 4.9,
    deliveryTime: '30min'
  });

  // Hero slides with real food images
  const heroSlides = [
    {
      id: 1,
      title: "Authentic Kenyan Cuisine",
      subtitle: "Taste of Kenya",
      description: "Experience the rich flavors of traditional Kenyan dishes made with love",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      category: "Main Dishes",
      cta: "Explore Menu",
      color: "from-red-800 to-red-600"
    },
    {
      id: 2,
      title: "Artisan Cakes & Desserts",
      subtitle: "Sweet Celebrations",
      description: "Handcrafted cakes and desserts for every special occasion",
      image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      category: "Cakes",
      cta: "Order Cakes",
      color: "from-red-700 to-red-500"
    },
    {
      id: 3,
      title: "Fresh Daily Specials",
      subtitle: "Chef's Choice",
      description: "Discover our daily special dishes prepared with the freshest ingredients",
      image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      category: "Specials",
      cta: "Today's Menu",
      color: "from-red-600 to-red-400"
    },
    {
      id: 4,
      title: "Traditional Kenyan Delights",
      subtitle: "Heritage Flavors",
      description: "Savor the authentic taste of Kenya's most beloved traditional dishes",
      image: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      category: "Traditional",
      cta: "Discover Heritage",
      color: "from-red-900 to-red-700"
    },
    {
      id: 5,
      title: "Premium Catering Services",
      subtitle: "Events & Celebrations",
      description: "Make your special occasions memorable with our premium catering services",
      image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      category: "Catering",
      cta: "Book Catering",
      color: "from-red-800 to-red-600"
    }
  ];

  // Features with red theme
  const features = [
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Get your food delivered in 30 minutes or less",
      color: "text-red-600 bg-red-100"
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "100% fresh ingredients and authentic recipes",
      color: "text-red-600 bg-red-100"
    },
    {
      icon: Crown,
      title: "Premium Experience",
      description: "VIP customer service and exclusive member benefits",
      color: "text-red-600 bg-red-100"
    },
    {
      icon: Target,
      title: "Smart Recommendations",
      description: "AI-powered meal suggestions based on your preferences",
      color: "text-red-600 bg-red-100"
    }
  ];

  // Product categories with red theme
  const categories = [
    { id: 'all', name: 'All Items', icon: Grid3X3, count: 50, color: 'bg-gray-500' },
    { id: 'main-dishes', name: 'Main Dishes', icon: ChefHat, count: 15, color: 'bg-red-600' },
    { id: 'cakes', name: 'Cakes', icon: Gift, count: 12, color: 'bg-red-500' },
    { id: 'traditional', name: 'Traditional', icon: Crown, count: 10, color: 'bg-red-700' },
    { id: 'specials', name: "Today's Specials", icon: Flame, count: 8, color: 'bg-red-800' },
    { id: 'drinks', name: 'Beverages', icon: Coffee, count: 5, color: 'bg-red-600' }
  ];

  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiGet('/products');
      if (response.success) {
        setProducts(response.data);
        setFeaturedProducts(response.data.filter((p: Product) => p.is_popular).slice(0, 6));
      }
    } catch (error) {
      // Error handling for production
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHomeStats = useCallback(async () => {
    try {
      const response = await apiGet('/stats/home');
      if (response.success) {
        setHomeStats(response.data);
      }
    } catch (error) {
      // Error handling for production
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchHomeStats();
  }, [fetchProducts, fetchHomeStats]);

  const handleQuickView = useCallback((product: Product) => {
    
  }, []);

  const handleShare = useCallback((product: Product) => {
    
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delicious food...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Simplified Hero Section */}
      <SimpleHero slides={heroSlides} />

      {/* Simplified Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{homeStats.happyCustomers}+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
              <div className="text-sm text-green-600 mt-1">↗ +12% this month</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{homeStats.deliveryTime}</div>
              <div className="text-gray-600 font-medium">Average Delivery</div>
              <div className="text-sm text-blue-600 mt-1">Fastest in area</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{homeStats.averageRating}★</div>
              <div className="text-gray-600 font-medium">Customer Rating</div>
              <div className="text-sm text-purple-600 mt-1">1,247 reviews</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{homeStats.totalOrders}+</div>
              <div className="text-gray-600 font-medium">Orders Delivered</div>
              <div className="text-sm text-orange-600 mt-1">This month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">Sera's Kitchen</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of food delivery with our cutting-edge platform designed for food lovers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured <span className="text-green-600">Delicacies</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular dishes loved by customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.product_id}>
                <SimpleProductCard
                  product={product}
                  onQuickView={handleQuickView}
                  onShare={handleShare}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-xl"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore by <span className="text-green-600">Category</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products/${category.id}`}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${category.color} rounded-xl mb-3 text-white`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSimple; 