import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Crown, Lock, Eye, EyeOff } from 'lucide-react';

const HiddenAdminAccess: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [keySequence, setKeySequence] = useState('');
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();

  // Secret key sequence for admin access
  const secretCode = 'admin123';

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only allow access if user is authenticated
      if (!auth.isAuthenticated) return;

      setKeySequence(prev => {
        const newSequence = prev + event.key;
        const trimmedSequence = newSequence.slice(-10); // Keep last 10 chars

        // Check if secret code is entered
        if (trimmedSequence.includes(secretCode)) {
  
          setShowAccessPanel(true);
          return '';
        }

        return trimmedSequence;
      });
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [auth.isAuthenticated]);

  const handleAdminAccess = () => {
    // Always redirect to login page, even for authenticated users
    navigate('/admin/login');
    setShowAccessPanel(false);
  };

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Only show the hidden access if user is authenticated
  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Hidden Admin Access Button (only visible when toggled) */}
      {isVisible && (
        <div className="fixed bottom-20 right-6 z-40">
          <button
            onClick={handleAdminAccess}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            title="Admin Access"
          >
            <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

      {/* Toggle Button (always visible for authenticated users) */}
      <div className="fixed bottom-32 right-6 z-40">
        <button
          onClick={handleToggleVisibility}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 opacity-50 hover:opacity-100"
          title="Toggle Admin Access"
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Access Panel Modal */}
      {showAccessPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Admin Access</h3>
                <p className="text-sm text-gray-600">Secret access activated</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Authentication verified
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAdminAccess}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Access Admin Panel
                </button>
                <button
                  onClick={() => setShowAccessPanel(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HiddenAdminAccess;
