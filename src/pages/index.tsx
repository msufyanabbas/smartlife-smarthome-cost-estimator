// src/pages/index.tsx
import React, { useMemo } from 'react';
import Layout from '@/components/Layout/Layout';
import StepProgress from '@/components/StepProgress/StepProgress';
import InputMethodStep from '@/components/Steps/InputMethodStep';
import PropertyDetailsStep from '@/components/Steps/PropertyDetailsStep';
import FloorUploadStep from '@/components/Steps/FloorUploadStep';
import DevicePlacementStep from '@/components/Steps/DevicePlacementStep';
import ThreeVisualizationStep from '@/components/Steps/3DVisualizationStep';
import CostCalculationStep from '@/components/Steps/CostCalculationStep';
import ContactInfoStep from '@/components/Steps/ContactInfoStep';
import QuoteGenerationStep from '@/components/Steps/QuoteGenerationStep';
import { useEstimationStore } from '@/store/estimationStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { EstimationStep } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const Home: React.FC = () => {
  const { currentStep, inputMethod } = useEstimationStore();
  const { t } = useLanguage();

  // Define step order based on input method
  const stepOrder: EstimationStep[] = useMemo(() => {
    const baseSteps: EstimationStep[] = [
      'input-method',
      'property-details',
    ];

    if (inputMethod === 'dwg') {
      return [
        ...baseSteps,
        'floor-upload',
        'device-placement',
        '3d-visualization',
        'cost-calculation',
        'contact-info',
        'quote-generation'
      ];
    } else {
      return [
        ...baseSteps,
        'device-placement',
        'cost-calculation',
        'contact-info',
        'quote-generation'
      ];
    }
  }, [inputMethod]);

  // Determine completed steps based on current step
  const completedSteps: EstimationStep[] = useMemo(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder.slice(0, currentIndex);
  }, [currentStep, stepOrder]);

  const renderCurrentStep = () => {
    const stepComponents = {
      'input-method': InputMethodStep,
      'property-details': PropertyDetailsStep,
      'floor-upload': FloorUploadStep,
      'device-placement': DevicePlacementStep,
      '3d-visualization': ThreeVisualizationStep,
      'cost-calculation': CostCalculationStep,
      'contact-info': ContactInfoStep,
      'quote-generation': QuoteGenerationStep,
    };

    const StepComponent = stepComponents[currentStep];
    
    if (!StepComponent) {
      return <InputMethodStep />;
    }

    return <StepComponent />;
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <Layout
      title={t('pages.home.title')}
      description={t('pages.home.description')}
    >
      <div className="container mx-auto py-8 px-4">
        {/* Step Progress - Always visible */}
        <div className="mb-8">
          <StepProgress 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
          />
        </div>
        
        {/* Current Step Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-[600px]"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Home;