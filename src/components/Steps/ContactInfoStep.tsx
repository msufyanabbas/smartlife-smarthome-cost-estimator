// src/components/Steps/ContactInfoStep.tsx
import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight, FaArrowLeft, FaWhatsapp, FaSms } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';
import { ContactInfo } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const ContactInfoStep: React.FC = () => {
  const { 
    contactInfo, 
    setContactInfo, 
    setCurrentStep,
    costBreakdown 
  } = useEstimationStore();
  
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactInfo.firstName?.trim()) {
      newErrors.firstName = t('steps.contactInfo.validation.firstNameRequired');
    }

    if (!contactInfo.lastName?.trim()) {
      newErrors.lastName = t('steps.contactInfo.validation.lastNameRequired');
    }

    if (!contactInfo.email?.trim()) {
      newErrors.email = t('steps.contactInfo.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      newErrors.email = t('steps.contactInfo.validation.emailInvalid');
    }

    if (!contactInfo.phone?.trim()) {
      newErrors.phone = t('steps.contactInfo.validation.phoneRequired');
    } else if (!/^(\+966|0)?[5]\d{8}$/.test(contactInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('steps.contactInfo.validation.phoneInvalid');
    }

    if (!contactInfo.city?.trim()) {
      newErrors.city = t('steps.contactInfo.validation.cityRequired');
    }

    if (!contactInfo.address?.trim()) {
      newErrors.address = t('steps.contactInfo.validation.addressRequired');
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
      name: t('steps.contactInfo.contactMethods.email.name'),
      icon: FaEnvelope,
      description: t('steps.contactInfo.contactMethods.email.description'),
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'phone',
      name: t('steps.contactInfo.contactMethods.phone.name'),
      icon: FaPhone,
      description: t('steps.contactInfo.contactMethods.phone.description'),
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'whatsapp',
      name: t('steps.contactInfo.contactMethods.whatsapp.name'),
      icon: FaWhatsapp,
      description: t('steps.contactInfo.contactMethods.whatsapp.description'),
      color: 'text-green-600 bg-green-100'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          {t('steps.contactInfo.title')}
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          {t('steps.contactInfo.subtitle')}
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
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{t('steps.contactInfo.yourInformation')}</h3>
              <p className="text-gray-600">{t('contactInfo.formDescription')}</p>
            </div>

            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    <FaUser className="text-accent-500" />
                    {t('steps.contactInfo.firstName')}
                  </label>
                  <input
                    type="text"
                    value={contactInfo.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder={t('steps.contactInfo.placeholders.firstName')}
                    className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    {t('steps.contactInfo.lastName')}
                  </label>
                  <input
                    type="text"
                    value={contactInfo.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder={t('steps.contactInfo.placeholders.lastName')}
                    className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                  <FaEnvelope className="text-accent-500" />
                  {t('steps.contactInfo.email')}
                </label>
                <input
                  type="email"
                  value={contactInfo.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('steps.contactInfo.placeholders.email')}
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                  <FaPhone className="text-accent-500" />
                  {t('steps.contactInfo.phone')}
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t('steps.contactInfo.placeholders.phone')}
                  className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                <p className="text-gray-500 text-sm mt-1">{t('steps.contactInfo.phoneHint')}</p>
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    <FaMapMarkerAlt className="text-accent-500" />
                    {t('steps.contactInfo.city')}
                  </label>
                  <select
                    value={contactInfo.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`form-select ${errors.city ? 'border-red-500' : ''}`}
                  >
                    <option value="">{t('steps.contactInfo.cities.selectCity')}</option>
                    <option value="riyadh">{t('steps.contactInfo.cities.riyadh')}</option>
                    <option value="jeddah">{t('steps.contactInfo.cities.jeddah')}</option>
                    <option value="dammam">{t('steps.contactInfo.cities.dammam')}</option>
                    <option value="mecca">{t('steps.contactInfo.cities.mecca')}</option>
                    <option value="medina">{t('steps.contactInfo.cities.medina')}</option>
                    <option value="khobar">{t('steps.contactInfo.cities.khobar')}</option>
                    <option value="tabuk">{t('steps.contactInfo.cities.tabuk')}</option>
                    <option value="abha">{t('steps.contactInfo.cities.abha')}</option>
                    <option value="other">{t('steps.contactInfo.cities.other')}</option>
                  </select>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  {t('steps.contactInfo.address')}
                </label>
                <textarea
                  value={contactInfo.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('steps.contactInfo.placeholders.address')}
                  rows={3}
                  className={`form-input resize-none ${errors.address ? 'border-red-500' : ''}`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                <p className="text-gray-500 text-sm mt-1">{t('steps.contactInfo.addressHint')}</p>
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  {t('steps.contactInfo.preferredContact')}
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
            className="bg-white rounded-2xl p-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('steps.contactInfo.quoteSummary')}</h3>
            {costBreakdown && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('steps.contactInfo.quoteSummaryItems.smartDevices')}</span>
                  <span className="font-medium text-gray-800">{costBreakdown.devices.length} {t('steps.contactInfo.quoteSummaryValues.items')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('steps.contactInfo.quoteSummaryItems.installation')}</span>
                  <span className="font-medium text-gray-800">{t('steps.contactInfo.quoteSummaryValues.professional')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('steps.contactInfo.quoteSummaryItems.warranty')}</span>
                  <span className="font-medium text-gray-800">{t('steps.contactInfo.quoteSummaryValues.twoYears')}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">{t('steps.contactInfo.quoteSummaryItems.totalInvestment')}</span>
                    <span className="font-bold text-md text-accent-600">
                      SAR {costBreakdown.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Privacy Notice */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
          >
            <h3 className="text-sm font-semibold text-blue-800 mb-3">{t('steps.contactInfo.privacy.title')}</h3>
            <div className="text-xs text-blue-700 space-y-2">
              <p>• {t('steps.contactInfo.privacy.items.0')}</p>
              <p>• {t('steps.contactInfo.privacy.items.1')}</p>
              <p>• {t('steps.contactInfo.privacy.items.2')}</p>
              <p>• {t('steps.contactInfo.privacy.items.3')}</p>
            </div>
          </motion.div> */}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-accent-200"
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-3">{t('steps.contactInfo.nextSteps.title')}</h3>
            <div className="text-xs text-gray-700 space-y-2">
              <p>1. {t('steps.contactInfo.nextSteps.items.0')}</p>
              <p>2. {t('steps.contactInfo.nextSteps.items.1')}</p>
              <p>3. {t('steps.contactInfo.nextSteps.items.2')}</p>
              <p>4. {t('steps.contactInfo.nextSteps.items.3')}</p>
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
          {t('steps.contactInfo.backStep')}
        </button>
        
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="spinner" />
              {t('steps.contactInfo.generating')}
            </>
          ) : (
            <>
              {t('steps.contactInfo.generateQuote')}
              <FaArrowRight />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContactInfoStep;