// src/components/Steps/CostCalculationStep.tsx
import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaArrowLeft, FaCalculator, FaTools, FaTruck, FaShieldAlt, FaEdit, FaCheckCircle } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';
import { CostBreakdown, DeviceCost } from '@/types';
import { getDeviceById } from '@/data/devices';
import { useLanguage } from '@/contexts/LanguageContext';

const CostCalculationStep: React.FC = () => {
  const { 
    propertyDetails, 
    floorPlans, 
    selectedDevices, 
    costBreakdown,
    setCostBreakdown,
    setCurrentStep,
    inputMethod 
  } = useEstimationStore();

  const { t } = useLanguage();
  const [isCalculating, setIsCalculating] = useState(false);
  const [deviceQuantities, setDeviceQuantities] = useState<Record<string, number>>({});

  const basePrices = {
    apartment: 500,
    villa: 800,
    townhouse: 650,
    mansion: 1500
  };

  const calculateCosts = () => {
    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      let deviceCosts: DeviceCost[] = [];
      let totalDeviceCost = 0;

      if (inputMethod === 'dwg') {
        // Calculate costs from placed devices on floor plans
        const deviceCounts: Record<string, number> = {};
        
        floorPlans.forEach(floor => {
          floor.devices.forEach(placedDevice => {
            deviceCounts[placedDevice.deviceId] = (deviceCounts[placedDevice.deviceId] || 0) + 1;
          });
        });

        deviceCosts = Object.entries(deviceCounts).map(([deviceId, quantity]) => {
          const device = getDeviceById(deviceId);
          const unitPrice = device?.price || 0;
          const totalPrice = unitPrice * quantity;
          totalDeviceCost += totalPrice;

          return {
            deviceId,
            name: device?.name || t('costCalculation.unknownDevice'),
            quantity,
            unitPrice,
            totalPrice
          };
        });
      } else {
        // Calculate costs from selected devices (manual mode)
        deviceCosts = selectedDevices.map(device => {
          const quantity = deviceQuantities[device.id] || 1;
          const totalPrice = device.price * quantity;
          totalDeviceCost += totalPrice;

          return {
            deviceId: device.id,
            name: device.name,
            quantity,
            unitPrice: device.price,
            totalPrice
          };
        });
      }

      // Calculate base installation cost
      const propertyType = propertyDetails.type || 'villa';
      const size = propertyDetails.size || 2000;
      const sizeMultiplier = Math.max(1, size / 2000);
      const baseInstallation = Math.round(basePrices[propertyType] * sizeMultiplier);

      // Calculate labor cost (20% of device costs + base installation)
      const labor = Math.round((totalDeviceCost + baseInstallation) * 0.20);

      // Calculate tax (15% VAT in Saudi Arabia)
      const subtotal = baseInstallation + totalDeviceCost + labor;
      const tax = Math.round(subtotal * 0.15);

      // Calculate total
      const total = subtotal + tax;

      const breakdown: CostBreakdown = {
        baseInstallation,
        devices: deviceCosts,
        labor,
        tax,
        total
      };

      setCostBreakdown(breakdown);
      setIsCalculating(false);
    }, 2000);
  };

  useEffect(() => {
    // Initialize device quantities for manual mode
    if (inputMethod === 'manual' && selectedDevices.length > 0) {
      const quantities: Record<string, number> = {};
      selectedDevices.forEach(device => {
        quantities[device.id] = 1; // Default quantity
      });
      setDeviceQuantities(quantities);
    }
  }, [selectedDevices, inputMethod]);

  useEffect(() => {
    calculateCosts();
  }, [deviceQuantities]);

  const handleNext = () => {
    setCurrentStep('contact-info');
  };

  const handleBack = () => {
    if (inputMethod === 'dwg') {
      setCurrentStep('3d-visualization');
    } else {
      setCurrentStep('device-placement');
    }
  };

  const handleRecalculate = () => {
    calculateCosts();
  };

  const handleQuantityChange = (deviceId: string, newQuantity: number) => {
    setDeviceQuantities(prev => ({
      ...prev,
      [deviceId]: Math.max(1, newQuantity)
    }));
  };

  if (isCalculating) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-8"
          >
            {t('steps.costCalculation.calculating')}
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-12"
          >
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-accent-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-accent-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('costCalculation.creatingQuote')}</h3>
            
            <div className="space-y-3 text-gray-600">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('steps.costCalculation.processingSteps.0')}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                {t('steps.costCalculation.processingSteps.1')}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {t('steps.costCalculation.processingSteps.2')}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!costBreakdown) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            {t('steps.costCalculation.unableToCalculate')}
          </h2>
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <p className="text-gray-600 mb-6">{t('steps.costCalculation.calculationError')}</p>
            <button onClick={handleRecalculate} className="btn-primary">
              {t('steps.costCalculation.recalculate')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalDevices = costBreakdown.devices.reduce((sum, device) => sum + device.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-bold text-white mb-4"
        >
          {t('steps.costCalculation.title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/80 max-w-3xl mx-auto"
        >
          {t('steps.costCalculation.subtitle')}
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cost Breakdown */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-900 to-accent-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <FaCalculator className="text-2xl" />
                <h3 className="text-xl font-semibold">{t('steps.costCalculation.costBreakdown')}</h3>
              </div>
            </div>

            {/* Base Installation */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaTools className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t('steps.costCalculation.baseInstallation')}</h4>
                    <p className="text-sm text-gray-600">
                      {t(`steps.propertyDetails.types.${propertyDetails.type}`)} - {propertyDetails.size?.toLocaleString()} {t('costCalculation.sqft')}
                    </p>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-800">
                  SAR {costBreakdown.baseInstallation.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Device Costs */}
            <div className="p-6 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>{t('steps.costCalculation.smartDevices')}</span>
                <span className="text-sm bg-accent-100 text-accent-700 px-2 py-1 rounded-full">
                  {totalDevices} {t('steps.costCalculation.items')}
                </span>
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {costBreakdown.devices.map(device => (
                  <div key={device.deviceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{device.name}</p>
                      <p className="text-sm text-gray-600">
                        {device.quantity} × SAR {device.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    {inputMethod === 'manual' && (
                      <div className="flex items-center gap-2 mr-4">
                        <button
                          onClick={() => handleQuantityChange(device.deviceId, device.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{device.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(device.deviceId, device.quantity + 1)}
                          className="w-6 h-6 bg-accent-200 hover:bg-accent-300 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="font-bold text-accent-600">
                        SAR {device.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Labor Costs */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FaTruck className="text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t('steps.costCalculation.professionalInstallation')}</h4>
                    <p className="text-sm text-gray-600">{t('costCalculation.installationDescription')}</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-800">
                  SAR {costBreakdown.labor.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Tax */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">VAT</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t('steps.costCalculation.vat')}</h4>
                    <p className="text-sm text-gray-600">{t('costCalculation.taxDescription')}</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-800">
                  SAR {costBreakdown.tax.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="p-6 bg-gradient-to-r from-accent-50 to-primary-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-gray-800">{t('steps.costCalculation.totalInvestment')}</h4>
                  <p className="text-sm text-gray-600">{t('costCalculation.allInclusive')}</p>
                </div>
                <div className="text-4xl font-bold text-accent-600">
                  SAR {costBreakdown.total.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              {t('steps.costCalculation.projectSummary')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('steps.costCalculation.propertyInfo.propertyType')}</span>
                <span className="font-medium text-gray-800 capitalize">{t(`steps.propertyDetails.types.${propertyDetails.type}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('steps.costCalculation.propertyInfo.totalArea')}</span>
                <span className="font-medium text-gray-800">{propertyDetails.size?.toLocaleString()} {t('costCalculation.sqft')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('steps.costCalculation.propertyInfo.smartDevices')}</span>
                <span className="font-medium text-gray-800">{totalDevices} {t('steps.costCalculation.items')}</span>
              </div>
              {inputMethod === 'dwg' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('steps.costCalculation.propertyInfo.floorPlans')}</span>
                  <span className="font-medium text-gray-800">{floorPlans.length} floors</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* What's Included */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-accent-500" />
              {t('steps.costCalculation.whatsIncluded')}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800">{t('steps.costCalculation.includedServices.0')}</p>
                  <p className="text-gray-600">{t('steps.costCalculation.serviceDescriptions.0')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800">{t('steps.costCalculation.includedServices.1')}</p>
                  <p className="text-gray-600">{t('steps.costCalculation.serviceDescriptions.1')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800">{t('steps.costCalculation.includedServices.2')}</p>
                  <p className="text-gray-600">{t('steps.costCalculation.serviceDescriptions.2')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800">{t('steps.costCalculation.includedServices.3')}</p>
                  <p className="text-gray-600">{t('steps.costCalculation.serviceDescriptions.3')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRecalculate}
              className="w-full border-2 border-accent-500 text-accent-500 bg-transparent font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-accent-500 hover:text-white inline-flex items-center justify-center gap-2"
            >
              <FaEdit />
              {t('steps.costCalculation.recalculate')}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-12">
        <button
          onClick={handleBack}
          className="bg-gray-100 text-gray-800 border-2 border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 hover:border-accent-500 inline-flex items-center gap-2"
        >
          <FaArrowLeft />
          {t('navigation.back')}
        </button>
        
        <button
          onClick={handleNext}
          className="bg-gradient-to-r from-primary-900 to-accent-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-accent-hover hover:-translate-y-1 inline-flex items-center gap-2 text-lg"
        >
          {t('steps.costCalculation.nextStep')}
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default CostCalculationStep;