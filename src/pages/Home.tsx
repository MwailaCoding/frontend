import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Star, Clock, Truck, Shield, Heart, 
  TrendingUp, Award, Users, MapPin, Phone, MessageCircle, Gift, Zap,
  Check, ArrowRight, Filter, Search, Grid3X3, List,
  Crown, Target, Flame, ChefHat, Coffee
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { apiGet, API_CONFIG } from '../config/api';
import SimpleProductCard from '../components/Products/SimpleProductCard';


interface Product {
  product_id: number;
  name: string;
  price: number;
  image_path: string;
  category_name: string;
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

const Home = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsPerPage] = useState(6);



  const [homeStats, setHomeStats] = useState<HomeStats>({
    totalOrders: 500,
    happyCustomers: 350,
    averageRating: 4.9,
    deliveryTime: '30min'
  });



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
      const response = await apiGet(API_CONFIG.ENDPOINTS.PRODUCTS);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        
        // Calculate pagination
        const total = data.length;
        const pages = Math.ceil(total / productsPerPage);
        setTotalPages(pages);
        
        // Get current page products
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const currentProducts = data.slice(startIndex, endIndex);
        setFeaturedProducts(currentProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, productsPerPage]);

  const fetchHomeStats = useCallback(async () => {
    try {
      const response = await apiGet('/api/stats/home');
      if (response.ok) {
        const data = await response.json();
        setHomeStats(data);
      }
    } catch (error) {
      console.error('Error fetching home stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchHomeStats();
  }, [fetchProducts, fetchHomeStats]);



  // Removed unused handlers since SimpleProductCard handles functionality internally

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

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

      {/* Advanced Hero Section */}
      <section className="relative h-[80vh] overflow-hidden bg-gradient-to-br from-red-600 via-orange-500 to-red-700">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-orange-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-red-300/30 rounded-full blur-xl animate-pulse"></div>
        
        {/* Main Content */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 animate-bounce">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  🎉 Premium Catering Services
                </div>
                
                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                    <span className="block animate-pulse">SERA'S KITCHEN</span>
                    <span className="block text-3xl md:text-5xl text-orange-200 mt-2">
                      Premium Catering
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                    Transform your events into unforgettable experiences with our 
                    <span className="text-orange-200 font-semibold"> authentic Kenyan cuisine</span> and 
                    <span className="text-orange-200 font-semibold"> artisan cakes</span>
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 py-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-sm text-white/70">Happy Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">4.9★</div>
                    <div className="text-sm text-white/70">Customer Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">30min</div>
                    <div className="text-sm text-white/70">Delivery Time</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/products"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/20 transform hover:scale-105"
                  >
                    <span>🛒</span>
                    Explore Menu
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  
                  <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30 transform hover:scale-105">
                    <span>▶️</span>
                    Watch Story
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>

              {/* Right Side - Floating Food Cards */}
              <div className="relative hidden lg:block">
                <div className="relative h-96">
                  {/* Floating Card 1 */}
                  <div className="absolute top-0 right-0 w-48 h-32 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl transform rotate-12 animate-pulse">
                    <div className="p-4">
                      <div className="text-2xl mb-2">🍰</div>
                      <div className="font-semibold text-gray-800">Artisan Cakes</div>
                      <div className="text-sm text-gray-600">Handcrafted with love</div>
                    </div>
                  </div>
                  
                  {/* Floating Card 2 */}
                  <div className="absolute top-20 left-0 w-40 h-28 bg-orange-100/90 backdrop-blur-sm rounded-2xl shadow-2xl transform -rotate-6 animate-pulse">
                    <div className="p-4">
                      <div className="text-2xl mb-2">🍽️</div>
                      <div className="font-semibold text-gray-800">Kenyan Delights</div>
                      <div className="text-sm text-gray-600">Authentic flavors</div>
                    </div>
                  </div>
                  
                  {/* Floating Card 3 */}
                  <div className="absolute bottom-10 right-10 w-44 h-32 bg-red-100/90 backdrop-blur-sm rounded-2xl shadow-2xl transform rotate-3 animate-pulse">
                    <div className="p-4">
                      <div className="text-2xl mb-2">🎉</div>
                      <div className="font-semibold text-gray-800">Event Catering</div>
                      <div className="text-sm text-gray-600">Premium service</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center text-white/70 animate-bounce">
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>





      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              All Our <span className="text-red-600">Delicacies</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our complete menu with pagination - discover all our delicious offerings
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <div key={product.product_id}>
                <SimpleProductCard
                  product={product}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mb-8">
              {/* Previous Button */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        isCurrentPage
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Page Info */}
          <div className="text-center text-gray-600 mb-8">
            <p>
              Showing {((currentPage - 1) * productsPerPage) + 1} to{' '}
              {Math.min(currentPage * productsPerPage, products.length)} of{' '}
              {products.length} products
            </p>
          </div>

          {/* View All Products Button */}
          <div className="text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-semibold text-lg hover:bg-red-700 transition-colors shadow-xl"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Simplified Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{homeStats.happyCustomers}+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
              <div className="text-sm text-red-600 mt-1">↗ +12% this month</div>
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

      {/* Category Navigation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore by <span className="text-red-600">Category</span>
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

export default Home;