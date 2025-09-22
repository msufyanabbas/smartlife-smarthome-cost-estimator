// src/components/Steps/PropertyDetailsStep.tsx
import React, { useState } from 'react';
import { FaHome, FaBed, FaBath, FaRuler, FaArrowRight, FaArrowLeft, FaBuilding, FaCheck } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { PropertyDetails } from '@/types';

const PropertyDetailsStep: React.FC = () => {
  const { 
    propertyDetails, 
    setPropertyDetails, 
    setCurrentStep, 
    inputMethod 
  } = useEstimationStore();

  const { t, isRTL } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const propertyTypes = [
    { 
      id: 'apartment', 
      name: t('steps.propertyDetails.types.apartment'), 
      icon: FaBuilding, 
      description: t('steps.propertyDetails.descriptions.apartment'),
      sizeRange: t('steps.propertyDetails.sizeRanges.apartment'),
      avgRooms: t('steps.propertyDetails.avgRooms.apartment')
    },
    { 
      id: 'villa', 
      name: t('steps.propertyDetails.types.villa'), 
      icon: FaHome, 
      description: t('steps.propertyDetails.descriptions.villa'),
      sizeRange: t('steps.propertyDetails.sizeRanges.villa'),
      avgRooms: t('steps.propertyDetails.avgRooms.villa')
    },
    { 
      id: 'townhouse', 
      name: t('steps.propertyDetails.types.townhouse'), 
      icon: FaHome, 
      description: t('steps.propertyDetails.descriptions.townhouse'),
      sizeRange: t('steps.propertyDetails.sizeRanges.townhouse'),
      avgRooms: t('steps.propertyDetails.avgRooms.townhouse')
    },
    { 
      id: 'mansion', 
      name: t('steps.propertyDetails.types.mansion'), 
      icon: FaBuilding, 
      description: t('steps.propertyDetails.descriptions.mansion'),
      sizeRange: t('steps.propertyDetails.sizeRanges.mansion'),
      avgRooms: t('steps.propertyDetails.avgRooms.mansion')
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!propertyDetails.type) {
      newErrors.type = t('steps.propertyDetails.validation.typeRequired');
    }

    if (!propertyDetails.size || propertyDetails.size < 500 || propertyDetails.size > 15000) {
      newErrors.size = t('steps.propertyDetails.validation.sizeRange');
    }

    if (!propertyDetails.rooms || propertyDetails.rooms < 1 || propertyDetails.rooms > 20) {
      newErrors.rooms = t('steps.propertyDetails.validation.roomsRange');
    }

    if (!propertyDetails.bathrooms || propertyDetails.bathrooms < 1 || propertyDetails.bathrooms > 15) {
      newErrors.bathrooms = t('steps.propertyDetails.validation.bathroomsRange');
    }

    if (propertyDetails.bathrooms && propertyDetails.rooms && propertyDetails.bathrooms > propertyDetails.rooms) {
      newErrors.bathrooms = t('steps.propertyDetails.validation.bathroomsExceed');
    }

    if (inputMethod === 'dwg' && (!propertyDetails.floors || propertyDetails.floors < 1 || propertyDetails.floors > 5)) {
      newErrors.floors = t('steps.propertyDetails.validation.floorsRange');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PropertyDetails, value: string | number) => {
    setPropertyDetails({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      if (inputMethod === 'manual') {
        setCurrentStep('device-placement');
      } else {
        setCurrentStep('floor-upload');
      }
    }
  };

  const handleBack = () => {
    setCurrentStep('input-method');
  };

  const isFormValid = () => {
    return propertyDetails.type && 
           propertyDetails.size && 
           propertyDetails.rooms && 
           propertyDetails.bathrooms &&
           (inputMethod === 'manual' || propertyDetails.floors);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-bold text-white mb-4"
        >
          {t('steps.propertyDetails.title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/80 max-w-2xl mx-auto"
        >
          {t('steps.propertyDetails.subtitle')}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
      >
        {/* Property Type Selection */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            {t('steps.propertyDetails.propertyType')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = propertyDetails.type === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleInputChange('type', type.id)}
                  className={`
                    p-4 rounded-2xl border-2 transition-all duration-200 text-center hover:scale-105
                    ${isSelected 
                      ? 'border-accent-500 bg-accent-50 shadow-lg' 
                      : 'border-gray-200 hover:border-accent-300 hover:bg-accent-25'
                    }
                  `}
                >
                  <Icon className={`text-3xl mx-auto mb-3 ${isSelected ? 'text-accent-600' : 'text-gray-400'}`} />
                  <div className={`font-semibold text-lg mb-1 ${isSelected ? 'text-accent-700' : 'text-gray-700'}`}>
                    {type.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {type.description}
                  </div>
                  <div className="text-xs text-gray-400">
                    <div>{type.sizeRange}</div>
                    <div>{type.avgRooms}</div>
                  </div>
                  {isSelected && (
                    <div className="mt-2">
                      <FaCheck className="text-accent-600 mx-auto" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {errors.type && <p className="text-red-500 text-sm mt-2">{errors.type}</p>}
        </div>

        {/* Property Details Form */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Property Size */}
          <div>
            <label className={`flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FaRuler className="text-accent-500" />
              {t('steps.propertyDetails.propertySize')}
            </label>
            <input
              type="number"
              value={propertyDetails.size || ''}
              onChange={(e) => handleInputChange('size', parseInt(e.target.value) || 0)}
              placeholder={t('steps.propertyDetails.placeholders.size')}
              min="500"
              max="15000"
              className={`
                w-full px-4 py-3 border-2 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 
                transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-accent-500/10 focus:outline-none
                ${errors.size ? 'border-red-500' : 'border-gray-300 focus:border-accent-500'}
                ${isRTL ? 'text-right' : 'text-left'}
              `}
            />
            {errors.size && <p className="text-red-500 text-sm mt-1">{errors.size}</p>}
            <p className="text-gray-500 text-sm mt-1">{t('steps.propertyDetails.hints.size')}</p>
          </div>

          {/* Number of Rooms */}
          <div>
            <label className={`flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FaBed className="text-accent-500" />
              {t('steps.propertyDetails.rooms')}
            </label>
            <input
              type="number"
              value={propertyDetails.rooms || ''}
              onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 0)}
              placeholder={t('steps.propertyDetails.placeholders.rooms')}
              min="1"
              max="20"
              className={`
                w-full px-4 py-3 border-2 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 
                transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-accent-500/10 focus:outline-none
                ${errors.rooms ? 'border-red-500' : 'border-gray-300 focus:border-accent-500'}
                ${isRTL ? 'text-right' : 'text-left'}
              `}
            />
            {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>}
            <p className="text-gray-500 text-sm mt-1">{t('steps.propertyDetails.hints.rooms')}</p>
          </div>

          {/* Number of Bathrooms */}
          <div>
            <label className={`flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FaBath className="text-accent-500" />
              {t('steps.propertyDetails.bathrooms')}
            </label>
            <input
              type="number"
              value={propertyDetails.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
              placeholder={t('steps.propertyDetails.placeholders.bathrooms')}
              min="1"
              max="15"
              className={`
                w-full px-4 py-3 border-2 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 
                transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-accent-500/10 focus:outline-none
                ${errors.bathrooms ? 'border-red-500' : 'border-gray-300 focus:border-accent-500'}
                ${isRTL ? 'text-right' : 'text-left'}
              `}
            />
            {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
            <p className="text-gray-500 text-sm mt-1">{t('steps.propertyDetails.hints.bathrooms')}</p>
          </div>

          {/* Number of Floors (only for DWG upload) */}
          {inputMethod === 'dwg' && (
            <div>
              <label className={`flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <FaBuilding className="text-accent-500" />
                {t('steps.propertyDetails.floors')}
              </label>
              <input
                type="number"
                value={propertyDetails.floors || ''}
                onChange={(e) => handleInputChange('floors', parseInt(e.target.value) || 0)}
                placeholder={t('steps.propertyDetails.placeholders.floors')}
                min="1"
                max="5"
                className={`
                  w-full px-4 py-3 border-2 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 
                  transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-accent-500/10 focus:outline-none
                  ${errors.floors ? 'border-red-500' : 'border-gray-300 focus:border-accent-500'}
                  ${isRTL ? 'text-right' : 'text-left'}
                `}
              />
              {errors.floors && <p className="text-red-500 text-sm mt-1">{errors.floors}</p>}
              <p className="text-gray-500 text-sm mt-1">{t('steps.propertyDetails.hints.floors')}</p>
            </div>
          )}
        </div>

        {/* Property Summary */}
        {/* {isFormValid() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gradient-to-r from-accent-50 to-primary-50 rounded-2xl border border-accent-200"
          >
            <h3 className={`font-semibold text-gray-800 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FaCheck className="text-green-500" />
              {t('steps.propertyDetails.summary')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{t('steps.propertyDetails.propertyType')}:</span>
                <p className="font-medium text-gray-800 capitalize">{propertyDetails.type}</p>
              </div>
              <div>
                <span className="text-gray-600">{t('steps.propertyDetails.propertySize')}:</span>
                <p className="font-medium text-gray-800">{propertyDetails.size?.toLocaleString()} sq ft</p>
              </div>
              <div>
                <span className="text-gray-600">{t('steps.propertyDetails.rooms')}:</span>
                <p className="font-medium text-gray-800">{propertyDetails.rooms}</p>
              </div>
              <div>
                <span className="text-gray-600">{t('steps.propertyDetails.bathrooms')}:</span>
                <p className="font-medium text-gray-800">{propertyDetails.bathrooms}</p>
              </div>
              {inputMethod === 'dwg' && propertyDetails.floors && (
                <div>
                  <span className="text-gray-600">{t('steps.propertyDetails.floors')}:</span>
                  <p className="font-medium text-gray-800">{propertyDetails.floors}</p>
                </div>
              )}
            </div>
          </motion.div>
        )} */}

        {/* Navigation Buttons */}
        <div className={`flex justify-between mt-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={handleBack}
            className={`bg-gray-100 text-gray-800 border-2 border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 hover:border-accent-500 inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <FaArrowLeft className={isRTL ? 'rotate-180' : ''} />
            {t('navigation.back')}
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isFormValid()}
            className={`
              font-semibold py-3 px-6 rounded-xl transition-all duration-300 inline-flex items-center gap-2
              ${isFormValid()
                ? 'bg-gradient-to-r from-primary-900 to-accent-500 text-white hover:shadow-accent-hover hover:-translate-y-1'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
              ${isRTL ? 'flex-row-reverse' : ''}
            `}
          >
            {t('steps.propertyDetails.nextStep.' + inputMethod)}
            <FaArrowRight className={isRTL ? 'rotate-180' : ''} />
          </button>
        </div>
      </motion.div>

      {/* Help Tips */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
      >
        <div className="text-white">
          <h3 className="font-semibold mb-3">{t('steps.propertyDetails.help.title')}</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-white/80">
            <div>
              <h4 className="font-medium text-white mb-2">{t('steps.propertyDetails.help.measuring.title')}</h4>
              <ul className="space-y-1">
                {t('steps.propertyDetails.help.measuring.items').split(',').map((item, idx) => (
                  <li key={idx} className={`${isRTL ? 'text-right' : ''}`}>• {item.trim()}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">{t('steps.propertyDetails.help.counting.title')}</h4>
              <ul className="space-y-1">
                {t('steps.propertyDetails.help.counting.items').split(',').map((item, idx) => (
                  <li key={idx} className={`${isRTL ? 'text-right' : ''}`}>• {item.trim()}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div> */}
    </div>
  );
};

export default PropertyDetailsStep;