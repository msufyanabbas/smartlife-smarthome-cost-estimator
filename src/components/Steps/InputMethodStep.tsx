// src/components/Steps/InputMethodStep.tsx
import React from 'react';
import { FaEdit, FaUpload, FaArrowRight, FaClock, FaTools, FaCube, FaCheckCircle } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';

const InputMethodStep: React.FC = () => {
  const { inputMethod, setInputMethod, setCurrentStep } = useEstimationStore();

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
      title: 'Manual Input',
      description: 'Fill out a simple form to describe your property and select smart devices',
      icon: FaEdit,
      features: [
        'Quick and easy setup',
        'Guided device selection',
        'No technical files needed',
        'Instant cost estimation'
      ],
      time: '5-10 minutes',
      complexity: 'Beginner Friendly',
      color: 'from-green-500 to-emerald-600',
      // recommended: true
    },
    {
      id: 'dwg',
      title: 'Upload Floor Plans',
      description: 'Upload your architectural drawings for precise device placement and 3D visualization',
      icon: FaUpload,
      features: [
        'Precise floor plan integration',
        'Drag & drop device placement',
        '3D visualization preview',
        'Professional accuracy'
      ],
      time: '15-20 minutes',
      complexity: 'Professional',
      color: 'from-blue-500 to-indigo-600',
      recommended: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-bold text-white mb-4"
        >
          How would you like to design your smart home?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/80 max-w-3xl mx-auto"
        >
          Choose the method that works best for you. Both options will give you a comprehensive cost estimate.
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
              {method.recommended && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaCheckCircle className="w-3 h-3" />
                    Recommended
                  </div>
                </div>
              )}

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-10`} />
              
              {/* Card Content */}
              <div className="relative bg-white p-8 h-full min-h-[400px] flex flex-col">
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
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
                  <div className="space-y-3 pt-4">
                    {method.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
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
          `}
        >
          Continue with {inputMethod === 'manual' ? 'Manual Input' : 'Floor Plans'}
          <FaArrowRight />
        </button>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
      >
        <div className="text-center mb-6">
          <FaCube className="text-accent-300 text-3xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Need Help Deciding?</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 text-white/80">
          <div>
            <h4 className="font-semibold text-white mb-3">Choose Manual Input if:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                You want a quick estimate
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                You don't have architectural drawings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                You're in the early planning stages
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                You prefer a guided experience
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Choose Floor Plans if:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">✓</span>
                You have architectural drawings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">✓</span>
                You want precise device placement
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">✓</span>
                You need professional-grade accuracy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">✓</span>
                You want 3D visualization
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InputMethodStep;