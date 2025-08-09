import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Users, CreditCard, Truck, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FileText className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-700 mb-4">
            These Terms of Service ("Terms") govern your use of Sera's Kitchen's website, mobile application, and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-700">
            If you disagree with any part of these terms, then you may not access the Service.
          </p>
        </div>

        {/* Service Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-red-600" />
            Service Description
          </h2>
          <p className="text-gray-700 mb-4">
            Sera's Kitchen provides food delivery services, including but not limited to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Online food ordering and delivery</li>
            <li>Custom cake orders and special requests</li>
            <li>Traditional Kenyan cuisine</li>
            <li>Event catering services</li>
            <li>Customer support and order tracking</li>
          </ul>
        </div>

        {/* User Accounts */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-red-600" />
            User Accounts
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Account Creation</h3>
              <p className="text-gray-700">
                You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Account Responsibilities</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Keep your account credentials secure</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>You are responsible for all activities under your account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ordering and Payment */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-red-600" />
            Ordering and Payment
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Order Process</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Orders are subject to availability</li>
                <li>We reserve the right to refuse or cancel orders</li>
                <li>Prices are subject to change without notice</li>
                <li>Delivery times are estimates and may vary</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Payment Terms</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Payment is required at the time of ordering</li>
                <li>We accept various payment methods as displayed</li>
                <li>All prices include applicable taxes</li>
                <li>Refunds are processed according to our refund policy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delivery and Cancellation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery and Cancellation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Delivery</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Delivery is available within specified areas</li>
                <li>Delivery fees may apply</li>
                <li>Someone must be present to receive the order</li>
                <li>We are not responsible for delays beyond our control</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Cancellation</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Orders can be cancelled before preparation begins</li>
                <li>Custom orders may have different cancellation terms</li>
                <li>Refunds are processed within 5-7 business days</li>
                <li>Contact us immediately for cancellation requests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Food Safety and Quality */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-600" />
            Food Safety and Quality
          </h2>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Quality Commitment</h3>
              </div>
              <ul className="list-disc list-inside text-green-700 space-y-1 ml-4">
                <li>Fresh, high-quality ingredients</li>
                <li>Proper food handling and preparation</li>
                <li>Hygienic kitchen practices</li>
                <li>Regular health inspections</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-800">Allergen Information</h3>
              </div>
              <p className="text-yellow-700">
                We handle common allergens including nuts, dairy, eggs, and gluten. Please inform us of any allergies when placing your order.
              </p>
            </div>
          </div>
        </div>

        {/* Prohibited Uses */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
          <p className="text-gray-700 mb-4">
            You may not use our Service for any unlawful purpose or to solicit others to perform unlawful acts. You agree not to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Submit false or misleading information</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of our Service</li>
            <li>Use our Service for commercial purposes without permission</li>
          </ul>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            The Service and its original content, features, and functionality are owned by Sera's Kitchen and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <p className="text-gray-700">
            You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service without our prior written consent.
          </p>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy</h2>
          <p className="text-gray-700 mb-4">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </p>
          <Link 
            to="/privacy-policy"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            View Privacy Policy
          </Link>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            In no event shall Sera's Kitchen, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Your use or inability to use the Service</li>
            <li>Any unauthorized access to or use of our servers</li>
            <li>Any interruption or cessation of transmission to or from the Service</li>
            <li>Any bugs, viruses, or other harmful code that may be transmitted</li>
            <li>Any errors or omissions in any content or for any loss or damage incurred</li>
          </ul>
        </div>

        {/* Disclaimers */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Disclaimers</h2>
          <p className="text-gray-700 mb-4">
            The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, Sera's Kitchen:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Excludes all representations, warranties, conditions and terms whether express or implied</li>
            <li>Does not guarantee that the Service will be secure or free from bugs or viruses</li>
            <li>Does not guarantee that the Service will be available at all times</li>
            <li>Reserves the right to modify or discontinue the Service at any time</li>
          </ul>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Governing Law</h2>
          <p className="text-gray-700">
            These Terms shall be interpreted and governed by the laws of Kenya, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-gray-700">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-red-600" />
              <span>Phone: +254 714 042 307</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-red-600" />
              <span>Email: legal@seraskitchen.com</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-red-600" />
              <span>Address: Nairobi, Kenya</span>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
