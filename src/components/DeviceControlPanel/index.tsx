import { DeviceState } from "@/types";
import { useState } from "react";
import { getDeviceById } from "@/data/devices";
import { FaCog } from "react-icons/fa";
import ModernToggleSwitch from "../ModernToggleSwitch";

// Device Control Panel Component
const DeviceControlPanel: React.FC<{
  deviceStates: DeviceState;
  onDeviceToggle: (deviceId: string) => void;
  floorPlans: any[];
}> = ({ deviceStates, onDeviceToggle, floorPlans }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get all devices across floors
  const allDevices = floorPlans.flatMap(floor => 
    (floor.devices || []).map((placedDevice: any) => ({
      placedDeviceId: placedDevice.id,
      deviceInfo: getDeviceById(placedDevice.deviceId),
      floorName: floor.name,
      floorNumber: floor.floorNumber || 1
    }))
  ).filter(item => item.deviceInfo);

  // Get unique categories
  const categories = ['all', ...new Set(allDevices.map(item => item.deviceInfo.category))];

  // Filter devices by category
  const filteredDevices = filterCategory === 'all' 
    ? allDevices 
    : allDevices.filter(item => item.deviceInfo.category === filterCategory);

  // Get device icon
  const getDeviceIcon = (category: string) => {
    const icons = {
      lighting: '💡',
      security: '🔒',
      climate: '❄️',
      entertainment: '📺',
      kitchen: '🍽️',
      bathroom: '🚿',
      outdoor: '🌳',
      default: '📱'
    };
    return icons[category as keyof typeof icons] || icons.default;
  };

  // Get device active state - fixed for door locks
  const getDeviceActiveState = (deviceId: string, deviceInfo: any) => {
    const state = deviceStates[deviceId];
    if (!state) return false;
    
    // For door locks, use doorOpen state instead of isOn
    if (deviceInfo.name.toLowerCase().includes('door') && deviceInfo.category === 'security') {
      return state.doorOpen || false;
    }
    
    // For other devices, use isOn
    return state.isOn || false;
  };

  // Get status text
  const getDeviceStatus = (deviceId: string, deviceInfo: any) => {
    const state = deviceStates[deviceId];
    if (!state) return 'Unknown';
    
    if (deviceInfo.name.toLowerCase().includes('smoke') || deviceInfo.name.toLowerCase().includes('detector')) {
      if (!state.isOn) return 'Standby';
      return state.isAlarming ? 'ALARM!' : 'Active';
    }
    
    if (deviceInfo.name.toLowerCase().includes('door')) {
      return state.doorOpen ? 'Unlocked' : 'Locked';
    }
    
    if (deviceInfo.category === 'climate') {
      return state.isOn ? `${state.temperature || 22}°C` : 'Off';
    }
    
    return state.isOn ? 'ON' : 'OFF';
  };

  const activeDevicesCount = Object.values(deviceStates).filter(state => state.isOn).length;

  return (
    <div className={`
      bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 transition-all duration-300
      ${isExpanded ? 'w-80' : 'w-16'}
      h-full flex flex-col
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {isExpanded && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Device Control</h3>
            <p className="text-sm text-gray-500">
              {allDevices.length} devices • {activeDevicesCount} active
            </p>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isExpanded ? 'Collapse Panel' : 'Expand Panel'}
        >
          <FaCog className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Category Filter */}
          <div className="p-4 border-b border-gray-200">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Device List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredDevices.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-500">No devices found</p>
              </div>
            ) : (
              filteredDevices.map(({ placedDeviceId, deviceInfo, floorName, floorNumber }) => {
                const state = deviceStates[placedDeviceId];
                const isActive = getDeviceActiveState(placedDeviceId, deviceInfo);
                
                return (
                  <div
                    key={placedDeviceId}
                    className={`
                      p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md
                      ${isActive 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getDeviceIcon(deviceInfo.category)}</span>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">{deviceInfo.name}</h4>
                          <p className="text-xs text-gray-500">{floorName}</p>
                        </div>
                      </div>
                      <ModernToggleSwitch
                        isOn={isActive}
                        onToggle={() => onDeviceToggle(placedDeviceId)}
                        size="md"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        isActive ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {getDeviceStatus(placedDeviceId, deviceInfo)}
                      </span>
                    </div>
                    
                    {/* Special controls for different device types */}
                    {deviceInfo.category === 'climate' && isActive && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Temperature:</span>
                          <span>{state?.temperature || 22}°C</span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="30"
                          value={state?.temperature || 22}
                          onChange={(e) => {
                            // Update temperature in device state
                            const newTemp = parseInt(e.target.value);
                            // This would need to be implemented in the parent component
                          }}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                    
                    {deviceInfo.category === 'lighting' && isActive && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <span>Brightness:</span>
                          <span>{Math.round((state?.intensity || 2) / 3 * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                // Turn on all lights
                filteredDevices.forEach(({ placedDeviceId, deviceInfo }) => {
                  if (deviceInfo.category === 'lighting') {
                    onDeviceToggle(placedDeviceId);
                  }
                });
              }}
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              💡 Toggle All Lights
            </button>
            
            <button
              onClick={() => {
                // Turn off all devices
                filteredDevices.forEach(({ placedDeviceId }) => {
                  if (deviceStates[placedDeviceId]?.isOn) {
                    onDeviceToggle(placedDeviceId);
                  }
                });
              }}
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Turn Off All
            </button>
          </div>
        </>
      )}

      {/* Collapsed state indicator */}
      {!isExpanded && (
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <div className="text-2xl mb-2">🎛️</div>
          <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
          <span className="text-xs text-gray-600 transform -rotate-90 whitespace-nowrap">
            {activeDevicesCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default DeviceControlPanel;