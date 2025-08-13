import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  Grid3X3,
  List,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Star,
  TrendingUp,
  BarChart3,
  Settings,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import ProductForm from '../../components/Admin/ProductForm';
import { Product } from '../../types';
import { apiGet, apiDelete, apiPut, getAuthHeaders, API_CONFIG, getImageUrl } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatPreparationTime } from '../../utils/timeUtils';

// Cache for products data
const productsCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { auth } = useAuth();

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized filtered and sorted products for better performance
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = debouncedSearchTerm === '' || 
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === '' || product.category === filterCategory;
      
      const matchesAvailability = filterAvailability === '' || 
        (filterAvailability === 'available' && product.available) ||
        (filterAvailability === 'hidden' && !product.available);
      
      return matchesSearch && matchesCategory && matchesAvailability;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'preparation_time':
          aValue = a.preparation_time || 0;
          bValue = b.preparation_time || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, debouncedSearchTerm, filterCategory, filterAvailability, sortBy, sortOrder]);

  // Memoized unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.sort();
  }, [products]);

  // Memoized statistics
  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter(p => p.available).length;
    const hidden = total - available;
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    const avgPrice = total > 0 ? totalValue / total : 0;

    return { total, available, hidden, totalValue, avgPrice };
  }, [products]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      fetchProducts();
    }
  }, [auth.isAuthenticated, auth.token]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
  
      if (!auth.token) {
        console.error('No token available');
        toast.error('Authentication token missing. Please login again.');
        return;
      }

      // Check cache first
      const now = Date.now();
      if (productsCache.data && (now - productsCache.timestamp) < productsCache.ttl) {
        setProducts(productsCache.data);
        setLoading(false);
        return;
      }

      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, {
        headers: getAuthHeaders(auth.token)
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        
        // Update cache
        productsCache.data = data;
        productsCache.timestamp = now;
        setLastRefresh(new Date());
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        window.location.href = '/admin/login';
      } else if (response.status === 502) {
        toast.error('Backend server is currently unavailable. Please try again later.');
      } else {
        toast.error(`Failed to fetch products: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const response = await apiDelete(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_DETAIL(productId.toString()), {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        // Invalidate cache and refetch
        productsCache.data = null;
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleAvailability = async (productId: number, currentAvailability: boolean) => {
    try {
      const response = await apiPut(
        API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_AVAILABILITY(productId.toString()),
        { available: !currentAvailability },
        { headers: getAuthHeaders(auth.token!) }
      );

      if (response.ok) {
        toast.success(`Product ${currentAvailability ? 'hidden' : 'made available'} successfully`);
        // Invalidate cache and refetch
        productsCache.data = null;
        fetchProducts();
      } else {
        toast.error('Failed to update product availability');
      }
    } catch (error) {
      console.error('Error updating product availability:', error);
      toast.error('Failed to update product availability');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = () => {
    handleFormClose();
    // Invalidate cache and refetch
    productsCache.data = null;
    fetchProducts();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.warn('Image failed to load, using fallback:', target.src);
    target.src = '/logo.png';
    target.onerror = null; // Prevent infinite loop
  };

  // Enhanced Product Card Component
  const ProductCard = React.memo(({ product }: { product: Product }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative group">
        <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          ) : (
            <div className="text-center text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">No Image</p>
            </div>
          )}
        </div>
        
        {/* Availability Toggle */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => handleToggleAvailability(product.id, product.available)}
            className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
              product.available 
                ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-110' 
                : 'bg-red-500 hover:bg-red-600 text-white hover:scale-110'
            }`}
            title={product.available ? 'Hide product' : 'Make available'}
          >
            {product.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.available 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.available ? 'Available' : 'Hidden'}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 truncate flex-1 mr-3">
            {product.name}
          </h3>
          <div className="text-right">
            <span className="text-2xl font-bold text-red-600">
              ${parseFloat(product.price).toLocaleString()}
            </span>
            <div className="text-xs text-gray-500 mt-1">
              {formatPreparationTime(product.preparation_time)}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {product.description || 'No description available'}
        </p>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {product.preparation_time || 0}m
            </span>
            <span className="flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              {product.category}
            </span>
          </div>
          <div className="flex items-center">
            <Star className="w-3 h-3 text-yellow-500 mr-1" />
            <span>New</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditProduct(product)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  ));

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Enhanced Loading Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 text-lg">Manage your menu items</p>
            </div>
            <button
              disabled
              className="bg-gray-400 text-white px-6 py-3 rounded-xl cursor-not-allowed text-lg font-medium"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Product
            </button>
          </div>
          
          {/* Loading Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Loading Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-10 bg-gray-300 rounded flex-1"></div>
                    <div className="h-10 bg-gray-300 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 text-lg">Manage your menu items and pricing</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right text-sm text-gray-500">
              <div>Last updated: {lastRefresh.toLocaleTimeString()}</div>
              <div className="text-xs">Total: {stats.total} products</div>
            </div>
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh products"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleAddProduct}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-lg font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-100" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available</p>
                <p className="text-3xl font-bold">{stats.available}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-100" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Hidden</p>
                <p className="text-3xl font-bold">{stats.hidden}</p>
              </div>
              <EyeOff className="w-8 h-8 text-orange-100" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Price</p>
                <p className="text-3xl font-bold">${stats.avgPrice.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-100" />
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white text-lg min-w-[180px]"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white text-lg min-w-[180px]"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="relative">
              <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white text-lg min-w-[160px]"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="category">Sort by Category</option>
                <option value="preparation_time">Sort by Prep Time</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <TrendingUp className={`w-5 h-5 text-gray-600 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="Grid view"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedProducts.length} of {products.length} products
            {searchTerm && ` matching "${searchTerm}"`}
            {filterCategory && ` in ${filterCategory}`}
            {filterAvailability && ` (${filterAvailability})`}
          </span>
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span className="hover:text-red-600 cursor-pointer">Export Results</span>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No products found</h3>
            <p className="text-gray-600 mb-6 text-lg">
              {searchTerm || filterCategory || filterAvailability
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product to the menu'
              }
            </p>
            {!searchTerm && !filterCategory && !filterAvailability && (
              <button
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
              <ProductForm
                product={editingProduct}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;