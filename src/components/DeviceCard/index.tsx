import { useLanguage } from '@/contexts/LanguageContext';
import { DeviceCardProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { FaCheck, FaInfo, FaMinus, FaPlus, FaStar } from 'react-icons/fa';

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
export default DeviceCard;