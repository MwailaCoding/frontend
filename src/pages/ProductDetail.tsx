import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Star, Plus, Minus, ShoppingCart, ArrowLeft, Heart, Share2, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import { apiGet, API_CONFIG } from '../config/api';
import { formatPreparationTime } from '../utils/timeUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [customization, setCustomization] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiGet(API_CONFIG.ENDPOINTS.PRODUCT_DETAIL(id!));
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_path: product.image_path,
      customization: customization || undefined
    });

    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#10B981',
        color: 'white',
      },
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleWhatsAppInquiry = () => {
    const phoneNumber = '254700000000';
    const message = `Hello! I'm interested in ${product?.name}. Can you tell me more about it?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Add the item to cart first
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_path: product.image_path,
      customization: customization || undefined
    });

    // Navigate directly to checkout
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-6 bg-gray-300 rounded w-1/4" />
                <div className="h-32 bg-gray-300 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = product.image_path 
    ? `https://hamilton47.pythonanywhere.com/${product.image_path}`
    : '/logo.png';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-green-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-64 sm:h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/logo.png';
                }}
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full shadow-lg transition-colors ${
                    isLiked ? 'bg-red-600 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Fresh & Available
                </span>
              </div>
            </div>

            {/* Additional product info cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center space-x-2 text-orange-600 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Prep Time</span>
                </div>
                <p className="text-gray-900">
                  {formatPreparationTime(product.preparation_time)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center space-x-2 text-green-600 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Popularity</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-gray-900">4.8 (127 reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 font-medium">{product.category_name}</span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(127)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-green-50 to-orange-50 p-4 sm:p-6 rounded-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-green-600">
                    KSh {product.price.toLocaleString()}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">Free delivery</p>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                <p className="text-gray-600">{product.ingredients}</p>
              </div>
            )}

            {/* Customization */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Instructions</h3>
              <textarea
                value={customization}
                onChange={(e) => setCustomization(e.target.value)}
                placeholder="Any special requests or dietary requirements?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-2xl font-bold text-green-600">
                    KSh {(product.price * quantity).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Buy Now</span>
                </button>
                <button
                  onClick={handleWhatsAppInquiry}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Ask Question</span>
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 p-4 sm:p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Delivery Information</h3>
              <div className="space-y-2 text-blue-800">
                <p>⏱️ Estimated delivery: 30-45 minutes</p>
                <p>📞 We'll call you when your order is ready</p>
                <p>💳 Pay via MPESA on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;