// src/components/Steps/ContactInfoStep.tsx
import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight, FaArrowLeft, FaWhatsapp, FaSms } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';
import { ContactInfo } from '@/types';

const ContactInfoStep: React.FC = () => {
  const { 
    contactInfo, 
    setContactInfo, 
    setCurrentStep,
    costBreakdown 
  } = useEstimationStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactInfo.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!contactInfo.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!contactInfo.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!contactInfo.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+966|0)?[5]\d{8}$/.test(contactInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Saudi phone number';
    }

    if (!contactInfo.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!contactInfo.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleNext = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call to save contact info
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep('quote-generation');
      }, 1500);
    }
  };

  const handleBack = () => {
    setCurrentStep('cost-calculation');
  };

  const contactMethods = [
    {
      id: 'email',
      name: 'Email',
      icon: FaEnvelope,
      description: 'Receive quote via email',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'phone',
      name: 'Phone Call',
      icon: FaPhone,
      description: 'Get a call from our team',
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: FaWhatsapp,
      description: 'Chat via WhatsApp',
      color: 'text-green-600 bg-green-100'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Almost There! Let's Connect
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Provide your contact details to receive your personalized smart home quote
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Your Information</h3>
              <p className="text-gray-600">We'll use this to create and send your personalized quote</p>
            </div>

            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    <FaUser className="text-accent-500" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={contactInfo.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={contactInfo.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                  <FaEnvelope className="text-accent-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactInfo.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                  <FaPhone className="text-accent-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                <p className="text-gray-500 text-sm mt-1">Saudi mobile number required</p>
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    <FaMapMarkerAlt className="text-accent-500" />
                    City
                  </label>
                  <select
                    value={contactInfo.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`form-select ${errors.city ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select your city</option>
                    <option value="riyadh">Riyadh</option>
                    <option value="jeddah">Jeddah</option>
                    <option value="dammam">Dammam</option>
                    <option value="mecca">Mecca</option>
                    <option value="medina">Medina</option>
                    <option value="khobar">Khobar</option>
                    <option value="tabuk">Tabuk</option>
                    <option value="abha">Abha</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Property Address
                </label>
                <textarea
                  value={contactInfo.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your property address"
                  rows={3}
                  className={`form-input resize-none ${errors.address ? 'border-red-500' : ''}`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                <p className="text-gray-500 text-sm mt-1">Needed for installation scheduling</p>
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  How would you like to receive your quote?
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {contactMethods.map(method => {
                    const Icon = method.icon;
                    const isSelected = contactInfo.preferredContact === method.id;
                    
                    return (
                      <button
                        key={method.id}
                        onClick={() => handleInputChange('preferredContact', method.id as 'email' | 'phone' | 'whatsapp')}
                        className={`
                          p-4 rounded-2xl border-2 transition-all duration-200 text-center
                          ${isSelected 
                            ? 'border-accent-500 bg-accent-50 shadow-lg' 
                            : 'border-gray-200 hover:border-accent-300 hover:bg-accent-25'
                          }
                        `}
                      >
                        <Icon className={`text-2xl mx-auto mb-2 ${isSelected ? 'text-accent-600' : 'text-gray-400'}`} />
                        <div className={`font-medium ${isSelected ? 'text-accent-700' : 'text-gray-700'}`}>
                          {method.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {method.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          {/* Quote Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quote Summary</h3>
            {costBreakdown && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Smart Devices:</span>
                  <span className="font-medium text-gray-800">{costBreakdown.devices.length} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Installation:</span>
                  <span className="font-medium text-gray-800">Professional</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Warranty:</span>
                  <span className="font-medium text-gray-800">2 Years</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Total Investment:</span>
                    <span className="font-bold text-xl text-accent-600">
                      SAR {costBreakdown.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
          >
            <h3 className="text-sm font-semibold text-blue-800 mb-3">Your Privacy Matters</h3>
            <div className="text-xs text-blue-700 space-y-2">
              <p>• Your information is encrypted and secure</p>
              <p>• Used only for quote generation and service</p>
              <p>• Never shared with third parties</p>
              <p>• You can request deletion anytime</p>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-accent-200"
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-3">What Happens Next?</h3>
            <div className="text-xs text-gray-700 space-y-2">
              <p>1. Receive your detailed quote instantly</p>
              <p>2. Our team will contact you within 24hrs</p>
              <p>3. Schedule a free consultation</p>
              <p>4. Professional installation begins</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-12">
        <button
          onClick={handleBack}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to Cost Breakdown
        </button>
        
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="spinner" />
              Generating Quote...
            </>
          ) : (
            <>
              Generate My Quote
              <FaArrowRight />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContactInfoStep;