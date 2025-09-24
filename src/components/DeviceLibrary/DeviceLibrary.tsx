// src/components/DeviceLibrary/DeviceLibrary.tsx
import React, { useState, useMemo } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { 
  getDevicesWithFallback, 
  getDeviceCategories, 
  devices as staticDevices 
} from '@/data/devices';
import { Device, DeviceCategory } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import DraggableDevice from '../DraggableDevice';

const DeviceLibrary: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get translated devices and categories
  const translatedDevices = useMemo(() => {
    try {
      return getDevicesWithFallback(t);
    } catch (error) {
      console.warn('Failed to get translated devices, using static fallback:', error);
      return staticDevices;
    }
  }, [t]);

  const translatedCategories = useMemo(() => {
    try {
      return getDeviceCategories(t);
    } catch (error) {
      console.warn('Failed to get translated categories, using static fallback:', error);
      // Fallback to static categories with basic translation attempt
      return [
        { id: 'security', name: t('devices.categories.security') || 'Security & Safety', icon: 'shield-alt' },
        { id: 'lighting', name: t('devices.categories.lighting') || 'Lighting & Climate', icon: 'lightbulb' },
        { id: 'climate', name: t('devices.categories.climate') || 'Climate Control', icon: 'thermometer-half' },
        { id: 'entertainment', name: t('devices.categories.entertainment') || 'Entertainment', icon: 'tv' },
        { id: 'kitchen', name: t('devices.categories.kitchen') || 'Kitchen & Appliances', icon: 'utensils' },
        { id: 'bathroom', name: t('devices.categories.bathroom') || 'Bathroom', icon: 'bath' },
        { id: 'outdoor', name: t('devices.categories.outdoor') || 'Outdoor', icon: 'tree' },
      ];
    }
  }, [t]);

  // Helper function to get devices by category from translated devices
  const getTranslatedDevicesByCategory = (category: DeviceCategory): Device[] => {
    return translatedDevices.filter(device => device.category === category);
  };

  const filteredDevices = useMemo(() => {
    return translatedDevices.filter(device => {
      const matchesCategory = selectedCategory === 'all' || device.category === selectedCategory;
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [translatedDevices, selectedCategory, searchTerm]);

  return (
    <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('deviceLibrary.title')}
        </h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('deviceLibrary.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
              ${selectedCategory === 'all' 
                ? 'bg-accent-100 text-accent-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {t('devices.categories.all')} ({translatedDevices.length})
          </button>
          {translatedCategories.map(category => {
            const categoryDevices = getTranslatedDevicesByCategory(category.id as DeviceCategory);
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as DeviceCategory)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${selectedCategory === category.id 
                    ? 'bg-accent-100 text-accent-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {category.name} ({categoryDevices.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredDevices.length > 0 ? (
          <div className="grid gap-4">
            {filteredDevices.map(device => (
              <DraggableDevice key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaFilter className="text-4xl text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              {t('deviceLibrary.noDevicesFound')}
            </h4>
            <p className="text-gray-500 text-sm">
              {t('deviceLibrary.adjustFilters')}
            </p>
          </div>
        )}
      </div>

    
    </div>
  );
};

export default DeviceLibrary;