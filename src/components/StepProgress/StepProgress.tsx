// src/components/StepProgress/StepProgress.tsx
import React from 'react';
import { FaCheck, FaHome, FaUpload, FaCube, FaEye, FaCalculator, FaUser, FaFileInvoice, FaEdit } from 'react-icons/fa';
import { EstimationStep } from '@/types';
import { useEstimationStore } from '@/store/estimationStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface StepProgressProps {
  currentStep: EstimationStep;
  completedSteps: EstimationStep[];
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, completedSteps }) => {
  const { inputMethod } = useEstimationStore();
  const { t, isRTL } = useLanguage();

  // Convert numbers to Arabic-Indic numerals
  const toArabicNumerals = (num: number): string => {
    if (!isRTL) return num.toString();
    
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
  };

  // Define steps based on input method
  const getStepConfig = () => {
    const baseSteps = [
      {
        key: 'input-method' as EstimationStep,
        title: t('stepProgress.inputMethod.title'),
        description: t('stepProgress.inputMethod.description'),
        icon: FaHome,
      },
      {
        key: 'property-details' as EstimationStep,
        title: t('stepProgress.propertyDetails.title'),
        description: t('stepProgress.propertyDetails.description'),
        icon: FaHome,
      },
    ];

    if (inputMethod === 'dwg') {
      return [
        ...baseSteps,
        {
          key: 'floor-upload' as EstimationStep,
          title: t('stepProgress.floorUpload.title'),
          description: t('stepProgress.floorUpload.description'),
          icon: FaUpload,
        },
        {
          key: 'device-placement' as EstimationStep,
          title: t('stepProgress.devicePlacement.titleDwg'),
          description: t('stepProgress.devicePlacement.descriptionDwg'),
          icon: FaCube,
        },
        {
          key: '3d-visualization' as EstimationStep,
          title: t('stepProgress.3dVisualization.title'),
          description: t('stepProgress.3dVisualization.description'),
          icon: FaEye,
        },
        {
          key: 'cost-calculation' as EstimationStep,
          title: t('stepProgress.costCalculation.title'),
          description: t('stepProgress.costCalculation.description'),
          icon: FaCalculator,
        },
        {
          key: 'contact-info' as EstimationStep,
          title: t('stepProgress.contactInfo.title'),
          description: t('stepProgress.contactInfo.description'),
          icon: FaUser,
        },
        {
          key: 'quote-generation' as EstimationStep,
          title: t('stepProgress.quoteGeneration.title'),
          description: t('stepProgress.quoteGeneration.description'),
          icon: FaFileInvoice,
        },
      ];
    } else {
      return [
        ...baseSteps,
        {
          key: 'device-placement' as EstimationStep,
          title: t('stepProgress.devicePlacement.title'),
          description: t('stepProgress.devicePlacement.description'),
          icon: FaEdit,
        },
        {
          key: 'cost-calculation' as EstimationStep,
          title: t('stepProgress.costCalculation.title'),
          description: t('stepProgress.costCalculation.description'),
          icon: FaCalculator,
        },
        {
          key: 'contact-info' as EstimationStep,
          title: t('stepProgress.contactInfo.title'),
          description: t('stepProgress.contactInfo.description'),
          icon: FaUser,
        },
        {
          key: 'quote-generation' as EstimationStep,
          title: t('stepProgress.quoteGeneration.title'),
          description: t('stepProgress.quoteGeneration.description'),
          icon: FaFileInvoice,
        },
      ];
    }
  };

  const stepConfig = getStepConfig();

  const getCurrentStepIndex = () => {
    return stepConfig.findIndex(step => step.key === currentStep);
  };

  const isStepCompleted = (stepKey: EstimationStep) => {
    return completedSteps.includes(stepKey);
  };

  const isStepActive = (stepKey: EstimationStep) => {
    return stepKey === currentStep;
  };

  const currentStepIndex = getCurrentStepIndex();
  const progressPercentage = currentStepIndex >= 0 ? (currentStepIndex / (stepConfig.length - 1)) * 100 : 0;

  // Format step count with proper numerals
  const formatStepCount = () => {
    const current = toArabicNumerals(currentStepIndex + 1);
    const total = toArabicNumerals(stepConfig.length);
    return t('stepProgress.stepCount').replace('{{current}}', current).replace('{{total}}', total);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 mb-8">
      <div className={`flex items-center justify-between mb-6 ${isRTL ? '' : ''}`}>
        <h3 className={`text-xl font-semibold text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>
          {t('stepProgress.yourProgress')}
        </h3>
        <div className={`text-sm text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
          {formatStepCount()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2" />
        <motion.div 
          className={`absolute top-1/2 h-2 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transform -translate-y-1/2 transition-all duration-500 ${isRTL ? 'flex-row-reverse' : 'left-0'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Steps */}
      <div className={`grid gap-4 ${stepConfig.length <= 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-4'}`}>
        {stepConfig.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = isStepCompleted(step.key);
          const isActive = isStepActive(step.key);
          const isPast = index < currentStepIndex;

          return (
            <motion.div 
              key={step.key} 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step Circle */}
              <motion.div 
                className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg' 
                    : isActive 
                      ? 'bg-accent-100 text-accent-600 border-2 border-accent-500 shadow-lg' 
                      : isPast
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-gray-100 text-gray-400'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FaCheck className="text-sm" />
                  </motion.div>
                ) : (
                  <Icon className="text-sm" />
                )}
                
                {/* Active Step Pulse */}
                {isActive && (
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-accent-500 opacity-25"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </motion.div>

              {/* Step Info */}
              <div className="space-y-1">
                <p className={`text-xs font-medium transition-colors duration-300 ${
                  isActive ? 'text-accent-600' : 
                  isCompleted ? 'text-primary-600' : 
                  'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 hidden lg:block">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current Step Info */}
      <motion.div 
        className="mt-6 p-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={`flex items-center gap-3 ${isRTL ? '' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
            {React.createElement(stepConfig[currentStepIndex]?.icon || FaHome, {
              className: "text-white text-sm"
            })}
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="font-medium text-gray-800">
              {stepConfig[currentStepIndex]?.title}
            </p>
            <p className="text-sm text-gray-600">
              {stepConfig[currentStepIndex]?.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input Method Badge */}
      <div className="mt-4 flex justify-center">
        <div className={`inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
          {inputMethod === 'dwg' ? t('stepProgress.professionalMode') : t('stepProgress.quickMode')}
        </div>
      </div>
    </div>
  );
};

export default StepProgress;