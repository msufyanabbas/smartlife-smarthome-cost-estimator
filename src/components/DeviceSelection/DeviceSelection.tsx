// src/components/DeviceSelection/DeviceSelection.tsx
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { FaCheck, FaPlus, FaMinus, FaInfo, FaShoppingCart, FaStar } from 'react-icons/fa';
import { devices, deviceCategories, getDevicesByCategory } from '@/data/devices';
import { useEstimationStore } from '@/store/estimationStore';
import { Device, DeviceCategory } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeviceCardProps {
  device: Device;
  isSelected: boolean;
  onToggle: (device: Device) => void;
  onQuantityChange: (device: Device, quantity: number) => void;
  quantity: number;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ 
  device, 
  isSelected, 
  onToggle, 
  onQuantityChange, 
  quantity 
}) => {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`
        relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected 
          ? 'border-accent-500 shadow-xl ring-4 ring-accent-100' 
          : 'border-gray-200 hover:border-accent-300 hover:shadow-lg'
        }
      `}
      onClick={() => onToggle(device)}
    >
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-3 right-3 z-10"
          >
            <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center shadow-lg">
              <FaCheck className="text-white text-sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular Badge */}
      {['smart-lock', 'security-camera', 'smart-thermostat'].includes(device.id) && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <FaStar className="w-3 h-3" />
            {t('deviceSelection.popular')}
          </div>
        </div>
      )}

      {/* Device Image */}
      <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <Image
          src={device.image}
          alt={device.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Device Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">{device.name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{device.description}</p>
        </div>

        {/* Price and Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-accent-600">
            SAR {device.price.toLocaleString()}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="p-2 text-gray-400 hover:text-accent-500 transition-colors rounded-full hover:bg-accent-50"
          >
            <FaInfo />
          </button>
        </div>

        {/* Quantity Controls */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">{t('devices.quantity')}:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuantityChange(device, Math.max(1, quantity - 1));
                    }}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <FaMinus className="text-xs text-gray-600" />
                  </button>
                  <span className="font-bold text-gray-800 w-8 text-center text-lg">{quantity}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuantityChange(device, quantity + 1);
                    }}
                    className="w-8 h-8 bg-accent-100 hover:bg-accent-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <FaPlus className="text-xs text-accent-600" />
                  </button>
                </div>
              </div>
              
              {/* Subtotal */}
              <div className="bg-accent-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('devices.subtotal')}:</span>
                  <span className="font-bold text-accent-600 text-lg">
                    SAR {(device.price * quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4 mt-4"
            >
              <h4 className="font-semibold text-gray-800 mb-3">{t('devices.specifications')}</h4>
              <div className="space-y-2">
                {device.specifications && Object.entries(device.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">{key}:</span>
                    <span className="text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const DeviceSelection: React.FC = () => {
  const { t } = useLanguage();
  const { selectedDevices, setSelectedDevices, propertyDetails } = useEstimationStore();
  const [activeCategory, setActiveCategory] = useState<DeviceCategory | 'all'>('all');
  const [deviceQuantities, setDeviceQuantities] = useState<Record<string, number>>({});

  // Calculate recommended quantities based on property details
  const getRecommendedQuantity = (device: Device): number => {
    const rooms = propertyDetails.rooms || 4;
    const bathrooms = propertyDetails.bathrooms || 2;
    const size = propertyDetails.size || 2000;

    switch (device.id) {
      case 'smart-bulb':
      case 'smart-switch':
        return Math.max(rooms + 2, Math.ceil(size / 500)); // One per room plus extras
      case 'motion-light':
        return bathrooms + 1; // Bathrooms plus hallway
      case 'smart-fan':
        return Math.max(2, Math.floor(rooms / 2));
      case 'security-camera':
        return Math.max(2, Math.floor(rooms / 3)) + 1; // Interior + exterior
      case 'motion-sensor':
        return Math.max(rooms, Math.ceil(size / 800));
      case 'smoke-detector':
        return Math.max(3, Math.ceil(rooms * 1.2));
      case 'smart-thermostat':
        return Math.max(1, Math.floor(size / 2000));
      case 'voice-assistant':
        return Math.max(2, Math.floor(rooms / 3));
      default:
        return 1;
    }
  };

  const handleDeviceToggle = (device: Device) => {
    const isCurrentlySelected = selectedDevices.some(d => d.id === device.id);
    
    if (isCurrentlySelected) {
      // Remove device
      setSelectedDevices(selectedDevices.filter(d => d.id !== device.id));
      const newQuantities = { ...deviceQuantities };
      delete newQuantities[device.id];
      setDeviceQuantities(newQuantities);
    } else {
      // Add device
      setSelectedDevices([...selectedDevices, device]);
      const recommendedQty = getRecommendedQuantity(device);
      setDeviceQuantities({
        ...deviceQuantities,
        [device.id]: recommendedQty
      });
    }
  };

  const handleQuantityChange = (device: Device, quantity: number) => {
    setDeviceQuantities({
      ...deviceQuantities,
      [device.id]: Math.max(1, quantity)
    });
  };

  const filteredDevices = useMemo(() => {
    return activeCategory === 'all' 
      ? devices 
      : getDevicesByCategory(activeCategory);
  }, [activeCategory]);

  const totalCost = useMemo(() => {
    return selectedDevices.reduce((sum, device) => {
      const quantity = deviceQuantities[device.id] || 1;
      return sum + (device.price * quantity);
    }, 0);
  }, [selectedDevices, deviceQuantities]);

  const totalDevices = useMemo(() => {
    return selectedDevices.reduce((sum, device) => {
      return sum + (deviceQuantities[device.id] || 1);
    }, 0);
  }, [selectedDevices, deviceQuantities]);

  return (
    <div className="space-y-8">
      {/* Category Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('steps.devicePlacement.deviceCategories')}</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveCategory('all')}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${activeCategory === 'all'
                ? 'bg-accent-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {t('devices.categories.all')} ({devices.length})
          </button>
          {deviceCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as DeviceCategory)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${activeCategory === category.id
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {t(`devices.categories.${category.id}`)} ({getDevicesByCategory(category.id as DeviceCategory).length})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Device Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredDevices.map((device, index) => {
            const isSelected = selectedDevices.some(d => d.id === device.id);
            const quantity = deviceQuantities[device.id] || 1;
            
            return (
              <motion.div
                key={device.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <DeviceCard
                  device={device}
                  isSelected={isSelected}
                  onToggle={handleDeviceToggle}
                  onQuantityChange={handleQuantityChange}
                  quantity={quantity}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Selection Summary */}
      <AnimatePresence>
        {selectedDevices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-accent-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaShoppingCart className="text-accent-500 text-xl" />
                <h3 className="text-xl font-semibold text-gray-800">{t('devices.selectionSummary')}</h3>
                <span className="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm font-medium">
                  {totalDevices} {totalDevices === 1 ? t('deviceSelection.device') : t('deviceSelection.devices')}
                </span>
              </div>
              <div className="text-3xl font-bold text-accent-600">
                SAR {totalCost.toLocaleString()}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {selectedDevices.map(device => {
                const quantity = deviceQuantities[device.id] || 1;
                const subtotal = device.price * quantity;
                
                return (
                  <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg relative overflow-hidden">
                        <Image
                          src={device.image}
                          alt={device.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{device.name}</p>
                        <p className="text-sm text-gray-600">{t('deviceSelection.qty')}: {quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent-600">
                        SAR {subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Smart Recommendations */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">{t('devices.recommendations.title')}</h4>
              <div className="text-sm text-blue-700 space-y-1">
                {selectedDevices.length < 5 && (
                  <p>• {t('devices.recommendations.moreSecurity')}</p>
                )}
                {!selectedDevices.some(d => d.category === 'climate') && (
                  <p>• {t('devices.recommendations.climateControl')}</p>
                )}
                {propertyDetails.rooms && propertyDetails.rooms > 3 && !selectedDevices.some(d => d.id === 'voice-assistant') && (
                  <p>• {t('devices.recommendations.audioSystem')}</p>
                )}
                {selectedDevices.filter(d => d.category === 'security').length >= 3 && (
                  <p>• {t('devices.recommendations.greatSecurity')}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredDevices.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">{t('deviceSelection.noDevicesFound')}</h3>
          <p className="text-gray-500">{t('deviceSelection.tryDifferentCategory')}</p>
        </div>
      )}
    </div>
  );
};

export default DeviceSelection;