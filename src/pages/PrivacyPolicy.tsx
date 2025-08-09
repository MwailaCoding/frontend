import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Users, Database, Phone, Mail, MapPin, Clock } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            Sera's Kitchen ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or interact with our services.
          </p>
          <p className="text-gray-700">
            By using our services, you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-red-600" />
            Information We Collect
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Delivery address and location data</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Order history and preferences</li>
                <li>Account credentials (if you create an account)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, interactions)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Location data (with your consent)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-red-600" />
            How We Use Your Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Service Delivery</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Deliver food to your location</li>
                <li>Process payments</li>
                <li>Send order confirmations and updates</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Communication</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Respond to your inquiries</li>
                <li>Send promotional offers (with consent)</li>
                <li>Provide customer support</li>
                <li>Send service updates</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Improvement</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Analyze usage patterns</li>
                <li>Improve our services</li>
                <li>Develop new features</li>
                <li>Personalize your experience</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Legal Compliance</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Comply with legal obligations</li>
                <li>Protect against fraud</li>
                <li>Enforce our terms of service</li>
                <li>Resolve disputes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Information Sharing */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-red-600" />
            Information Sharing
          </h2>
          
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
          </p>
          
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our website, processing payments, and delivering orders</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
          </ul>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-red-600" />
            Data Security
          </h2>
          
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Security Measures</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Data Retention</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Order data: 7 years</li>
                <li>Account information: Until deletion</li>
                <li>Analytics data: 2 years</li>
                <li>Marketing data: Until opt-out</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Access and Control</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Access your personal information</li>
                <li>Update or correct your data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Data Portability</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Export your data</li>
                <li>Transfer data to other services</li>
                <li>Download your order history</li>
                <li>Request data in machine-readable format</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
          
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Essential Cookies</h3>
              <p className="text-gray-700 text-sm">Required for basic functionality and security</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Analytics Cookies</h3>
              <p className="text-gray-700 text-sm">Help us understand how you use our services</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Marketing Cookies</h3>
              <p className="text-gray-700 text-sm">Used for personalized advertising (with consent)</p>
            </div>
          </div>
        </div>

        {/* Children's Privacy */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
          
          <p className="text-gray-700">
            Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
          </p>
        </div>

        {/* International Transfers */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
          
          <p className="text-gray-700">
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
          </p>
        </div>

        {/* Changes to Policy */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
          
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-red-600" />
            Contact Us
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Get in Touch</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-red-600" />
                  <span>+254 714 042 307</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-red-600" />
                  <span>privacy@seraskitchen.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-red-600" />
                  <span>Nairobi, Kenya</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-red-600" />
                  <span>Mon-Fri: 8:00 AM - 10:00 PM</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Data Protection Officer</h3>
              <p className="text-gray-700">
                For privacy-related inquiries, data requests, or to exercise your rights, please contact our Data Protection Officer at:
              </p>
              <p className="text-gray-700 mt-2">
                Email: dpo@seraskitchen.com<br />
                Phone: +254 714 042 307
              </p>
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

export default PrivacyPolicy;
