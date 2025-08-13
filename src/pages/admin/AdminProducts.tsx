import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import ProductForm from '../../components/Admin/ProductForm';
import { Product } from '../../types';
import { apiGet, apiDelete, apiPut, getAuthHeaders, API_CONFIG } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatPreparationTime } from '../../utils/timeUtils';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const { auth } = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      fetchProducts();
    }
  }, [auth.isAuthenticated, auth.token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      if (!auth.token) {
        setError('Authentication token missing. Please login again.');
        setLoading(false);
        return;
      }
      
      const response = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, {
        headers: getAuthHeaders(auth.token)
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
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
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await apiDelete(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_DETAIL(productId.toString()), {
        headers: getAuthHeaders(auth.token!)
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
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
    fetchProducts();
  };

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === '' || product.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.sort();
  }, [products]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter(p => p.available).length;
    const hidden = total - available;
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    const avgPrice = total > 0 ? totalValue / total : 0;

    return { total, available, hidden, totalValue, avgPrice };
  }, [products]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">Manage your menu items</p>
            </div>
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Product
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-300 rounded flex-1"></div>
                    <div className="h-8 bg-gray-300 rounded flex-1"></div>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your menu items and pricing</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Product
          </button>
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
              <Eye className="w-8 h-8 text-green-100" />
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
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredProducts.length} of {products.length} products
            {searchTerm && ` matching "${searchTerm}"`}
            {filterCategory && ` in ${filterCategory}`}
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && !filterCategory && (
              <button
                onClick={handleAddProduct}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  {/* Product Image */}
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={`https://hamilton47.pythonanywhere.com/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-center text-gray-400 ${product.image ? 'hidden' : ''}`}>
                      <Package className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">No Image</p>
                    </div>
                  </div>
                  
                  {/* Availability Toggle */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleAvailability(product.id, product.available)}
                      className={`p-2 rounded-full shadow-lg transition-colors ${
                        product.available 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                      title={product.available ? 'Hide product' : 'Make available'}
                    >
                      {product.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.available ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                      {product.name}
                    </h3>
                    <span className="text-lg font-bold text-red-600">
                      ${product.price}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span>{formatPreparationTime(product.preparation_time)}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-white rounded-lg shadow-xl">
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