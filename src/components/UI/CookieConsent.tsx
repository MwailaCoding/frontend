import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Shield, Settings } from 'lucide-react';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    onDecline?.();
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential-only');
    setIsVisible(false);
    onAccept?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                <Cookie className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  We use cookies and similar technologies to help personalize content, provide social media features, and analyze our traffic. We also share information about your use of our site with our social media, advertising, and analytics partners.
                </p>
                
                {showDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <h4 className="font-semibold text-gray-800 mb-2">Cookie Types</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-green-600 mr-2" />
                        <span><strong>Essential:</strong> Required for basic site functionality</span>
                      </div>
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 text-blue-600 mr-2" />
                        <span><strong>Analytics:</strong> Help us understand how you use our site</span>
                      </div>
                      <div className="flex items-center">
                        <Cookie className="w-4 h-4 text-purple-600 mr-2" />
                        <span><strong>Marketing:</strong> Used for personalized advertising</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    {showDetails ? 'Hide Details' : 'Learn More'}
                  </button>
                  <span className="text-gray-400">•</span>
                  <Link 
                    to="/privacy-policy" 
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={handleAcceptEssential}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
