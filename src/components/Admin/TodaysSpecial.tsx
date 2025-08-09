import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, getAuthHeaders } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface TodaysSpecial {
  id?: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const TodaysSpecial: React.FC = () => {
  const { auth } = useAuth();
  const [specials, setSpecials] = useState<TodaysSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TodaysSpecial>({
    title: '',
    description: '',
    price: 0,
    category: '',
    is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSpecials();
  }, []);

  const fetchSpecials = async () => {
    try {
      const response = await apiGet('/api/admin/todays-specials', {
        headers: getAuthHeaders(auth.token!)
      });
      if (response.ok) {
        const data = await response.json();
        setSpecials(data);
      }
    } catch (error) {
      console.error('Error fetching specials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('is_active', formData.is_active.toString());
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (editingId) {
        response = await apiPut(`/api/admin/todays-specials/${editingId}`, formDataToSend, {
          headers: { ...getAuthHeaders(auth.token!) }
        });
      } else {
        response = await apiPost('/api/admin/todays-specials', formDataToSend, {
          headers: { ...getAuthHeaders(auth.token!) }
        });
      }

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          description: '',
          price: 0,
          category: '',
          is_active: true
        });
        setImageFile(null);
        fetchSpecials();
      }
    } catch (error) {
      console.error('Error saving special:', error);
    }
  };

  const handleEdit = (special: TodaysSpecial) => {
    setEditingId(special.id || null);
    setFormData(special);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this special?')) {
      try {
        const response = await apiDelete(`/api/admin/todays-specials/${id}`, {
          headers: getAuthHeaders(auth.token!)
        });
        
        if (response.ok) {
          fetchSpecials();
        }
      } catch (error) {
        console.error('Error deleting special:', error);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Today's Specials</h2>
          <p className="text-gray-600">Manage featured dishes and special offers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Special</span>
        </button>
      </div>

      {/* Specials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specials.map((special) => (
          <div key={special.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            {/* Image */}
            <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              {special.image_url ? (
                <img 
                  src={special.image_url} 
                  alt={special.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl">🍽️</div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{special.title}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Star className="w-3 h-3 mr-1" />
                    {special.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    KSh {special.price.toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    special.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {special.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{special.description}</p>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(special)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => special.id && handleDelete(special.id)}
                  className="inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit Special' : 'Add New Special'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      title: '',
                      description: '',
                      price: 0,
                      category: '',
                      is_active: true
                    });
                    setImageFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (KSh) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Traditional">Traditional</option>
                      <option value="Cakes">Cakes</option>
                      <option value="Staples">Staples</option>
                      <option value="Rice">Rice</option>
                      <option value="Special">Special</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingId ? 'Update' : 'Create'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 inline-flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysSpecial;
