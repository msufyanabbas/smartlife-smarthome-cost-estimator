// src/components/Steps/InputMethodStep.tsx
import React from 'react';
import { FaEdit, FaUpload, FaArrowRight, FaClock, FaTools, FaCube, FaCheckCircle } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const InputMethodStep: React.FC = () => {
  const { inputMethod, setInputMethod, setCurrentStep } = useEstimationStore();
  const { t, isRTL } = useLanguage();

  const handleMethodSelect = (method: 'manual' | 'dwg') => {
    setInputMethod(method);
  };

  const handleNext = () => {
    if (inputMethod) {
      setCurrentStep('property-details');
    }
  };

  const methods = [
    {
      id: 'manual',
      title: t('steps.inputMethod.manual.title'),
      description: t('steps.inputMethod.manual.description'),
      icon: FaEdit,
      features: t('steps.inputMethod.manual.features').split(','),
      time: t('steps.inputMethod.manual.time'),
      complexity: t('steps.inputMethod.manual.complexity'),
      color: 'from-green-500 to-emerald-600',
      recommended: true
    },
    {
      id: 'dwg',
      title: t('steps.inputMethod.dwg.title'),
      description: t('steps.inputMethod.dwg.description'),
      icon: FaUpload,
      features: t('steps.inputMethod.dwg.features').split(','),
      time: t('steps.inputMethod.dwg.time'),
      complexity: t('steps.inputMethod.dwg.complexity'),
      color: 'from-blue-500 to-indigo-600',
      recommended: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-4">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-bold text-white mb-4"
        >
          {t('steps.inputMethod.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/80 max-w-3xl mx-auto"
        >
          {t('steps.inputMethod.subtitle')}
        </motion.p>
      </div>

      {/* Method Selection Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {methods.map((method, index) => {
          const Icon = method.icon;
          const isSelected = inputMethod === method.id;
          
          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300 transform hover:scale-105
                ${isSelected 
                  ? 'ring-4 ring-accent-400 shadow-2xl' 
                  : 'hover:shadow-xl'
                }
              `}
              onClick={() => handleMethodSelect(method.id as 'manual' | 'dwg')}
            >
              {/* Recommended Badge */}
              {/* {method.recommended && (
                <div className={`absolute top-4 z-10 ${isRTL ? 'right-4' : 'left-4'}`}>
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaCheckCircle className="w-3 h-3" />
                    {t('steps.inputMethod.recommended')}
                  </div>
                </div>
              )} */}

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-10`} />
              
              {/* Card Content */}
              <div className="relative bg-white p-8 h-full min-h-[200px] flex flex-col">
                {/* Selection Indicator */}
                {isSelected && (
                  <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-primary-600 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-white text-sm" />
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="text-2xl text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">{method.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{method.description}</p>

                  {/* Method Info */}
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-accent-500" />
                      <span className="text-sm text-gray-500">{method.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTools className="text-accent-500" />
                      <span className="text-sm text-gray-500">{method.complexity}</span>
                    </div>
                  </div>

                  {/* Features */}
                  {/* <div className="space-y-3 pt-4">
                    {method.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div> */}
                </div>

                {/* Bottom Highlight */}
                {isSelected && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${method.color}`} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Next Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inputMethod ? 1 : 0.5, y: 0 }}
        className="text-center"
      >
        <button
          onClick={handleNext}
          disabled={!inputMethod}
          className={`
            text-lg px-8 py-4 inline-flex items-center gap-3 rounded-xl font-semibold transition-all duration-300
            ${inputMethod 
              ? 'bg-gradient-to-r from-primary-900 to-accent-500 text-white hover:shadow-accent-hover hover:-translate-y-1' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${isRTL ? '' : ''}
          `}
        >
          {t('steps.inputMethod.continueWith')} {inputMethod === 'manual' ? t('steps.inputMethod.manualInputShort') : t('steps.inputMethod.floorPlansShort')}
          <FaArrowRight className={isRTL ? 'rotate-180' : ''} />
        </button>
      </motion.div>

      {/* Help Section */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
      >
        <div className="text-center mb-6">
          <FaCube className="text-accent-300 text-3xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">{t('steps.inputMethod.help.title')}</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 text-white/80">
          <div>
            <h4 className="font-semibold text-white mb-3">{t('steps.inputMethod.help.manual.title')}</h4>
            <ul className="space-y-2 text-sm">
              {t('steps.inputMethod.help.manual.features').split(',').map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  {item.trim()}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">{t('steps.inputMethod.help.dwg.title')}</h4>
            <ul className="space-y-2 text-sm">
              {t('steps.inputMethod.help.dwg.features').split(',').map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  {item.trim()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div> */}
    </div>
  );
};

export default InputMethodStep;