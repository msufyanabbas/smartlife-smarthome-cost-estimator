import React, { Suspense, useState, useMemo, useRef} from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Box} from '@react-three/drei';
import { FaArrowRight, FaArrowLeft, FaExpand, FaCompress, FaCube, FaLightbulb, FaDoorOpen } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDeviceById } from '@/data/devices';
import { DeviceState } from '@/types';
import DeviceControlPanel from '../DeviceControlPanel';
import Enhanced3DScene from '../Scene3D';

// Main Component
const EnhancedThreeVisualizationStep: React.FC = () => {
  const { floorPlans, setCurrentStep, propertyDetails } = useEstimationStore();
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'perspective' | 'top' | 'side'>('perspective');
  const [isLoading, setIsLoading] = useState(true);
  const [deviceStates, setDeviceStates] = useState<DeviceState>({});

  // Initialize device states
  React.useEffect(() => {
    const initialStates: DeviceState = {};
    floorPlans.forEach(floor => {
      (floor.devices || []).forEach(device => {
        const deviceInfo = getDeviceById(device.deviceId);
        initialStates[device.id] = {
          isOn: false,
          animationProgress: 0,
          intensity: 2,
          doorOpen: false,
          rotation: 0,
          lastToggled: 0,
          // New states for particle effects
          isAlarming: false, // For smoke detectors
          temperature: 22, // For AC units
          fanSpeed: 'medium' // For AC units
        };
      });
    });
    setDeviceStates(initialStates);
  }, [floorPlans]);

  const handleDeviceClick = (deviceId: string) => {
    setDeviceStates(prev => {
      const currentState = prev[deviceId];
      const device = floorPlans
        .flatMap(floor => floor.devices || [])
        .find(d => d.id === deviceId);
      
      if (!device) return prev;
      
      const deviceInfo = getDeviceById(device.deviceId);
      
      let newState = {
        ...currentState,
        lastToggled: Date.now()
      };

      // Handle different device types
      if (deviceInfo?.category === 'lighting') {
        newState.isOn = !currentState.isOn;
        newState.intensity = newState.isOn ? 2 + Math.random() : 0;
      } else if (deviceInfo?.name.toLowerCase().includes('door')) {
        newState.doorOpen = !currentState.doorOpen;
        newState.isOn = true; // Door is "active" when operated
      } else {
        // Generic toggle
        newState.isOn = !currentState.isOn;
      }

      return {
        ...prev,
        [deviceId]: newState
      };
    });
  };

  const handleNext = () => {
    setCurrentStep('cost-calculation');
  };

  const handleBack = () => {
    setCurrentStep('device-placement');
  };

  const totalDevices = useMemo(() => {
    return floorPlans.reduce((sum, floor) => sum + (floor.devices || []).length, 0);
  }, [floorPlans]);

  const activeDevices = useMemo(() => {
    return Object.values(deviceStates).filter(state => state.isOn).length;
  }, [deviceStates]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Camera positions based on view mode
  const getCameraPosition = (): [number, number, number] => {
    const floorCount = floorPlans.length;
    const buildingHeight = floorCount * 3.5;
    
    switch (viewMode) {
      case 'top':
        return [0, buildingHeight + 15, 0];
      case 'side':
        return [30, buildingHeight / 2, 0];
      case 'perspective':
      default:
        return [18, buildingHeight / 2 + 8, 18];
    }
  };

  const getCameraTarget = (): [number, number, number] => {
    const floorCount = floorPlans.length;
    const buildingCenter = (floorCount * 3.5) / 2;
    return [0, buildingCenter, 0];
  };

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-full mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Interactive 3D Smart Home
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Click on devices to see real-time simulations and interactions
        </p>
      </div>

      {/* Main Layout with Control Panel and 3D Viewer */}
      <div className="flex gap-6 h-[600px]">
        {/* Left Control Panel */}
        <div className="flex-shrink-0">
          <DeviceControlPanel
            deviceStates={deviceStates}
            onDeviceToggle={handleDeviceClick}
            floorPlans={floorPlans}
          />
        </div>

        {/* 3D Viewer */}
        <div className={`
          flex-1 relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300
          ${isFullscreen 
            ? 'fixed inset-0 z-50 rounded-none' 
            : ''
          }
        `}>
          {isFullscreen && (
            <div className="absolute inset-0 bg-black/5 pointer-events-none z-0" />
          )}
          
          {/* Viewer Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 flex gap-2">
              <button
                onClick={() => setViewMode('perspective')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'perspective' 
                    ? 'bg-accent-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                3D View
              </button>
              <button
                onClick={() => setViewMode('top')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'top' 
                    ? 'bg-accent-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Top View
              </button>
              <button
                onClick={() => setViewMode('side')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'side' 
                    ? 'bg-accent-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Side View
              </button>
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-gray-600 hover:text-accent-500 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>

          {/* Device Status Panel */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                <FaCube className="text-accent-500" />
                {totalDevices} Devices • {activeDevices} Active
              </div>
              <div className="text-xs text-gray-500">
                Click devices to interact
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">Loading Interactive 3D Scene...</p>
                <p className="text-gray-500 text-sm mt-2">
                  Preparing {floorPlans.length} floor{floorPlans.length > 1 ? 's' : ''} with {totalDevices} interactive devices
                </p>
              </div>
            </div>
          ) : (
            <Canvas
              key={viewMode}
              shadows
              camera={{
                position: getCameraPosition(),
                fov: viewMode === 'top' ? 75 : 60,
                near: 0.1,
                far: 1000
              }}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <Suspense fallback={null}>
                <Enhanced3DScene 
                  viewMode={viewMode} 
                  deviceStates={deviceStates}
                  onDeviceClick={handleDeviceClick}
                />
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={viewMode === 'perspective'}
                  maxDistance={60}
                  minDistance={3}
                  target={getCameraTarget()}
                  enableDamping={true}
                  dampingFactor={0.05}
                  maxPolarAngle={viewMode === 'top' ? Math.PI / 6 : Math.PI}
                  minPolarAngle={viewMode === 'top' ? 0 : 0}
                />
              </Suspense>
            </Canvas>
          )}
        </div>
      </div>

      {/* Device Control Instructions */}
      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <FaLightbulb className="text-yellow-300 text-xl" />
            <h3 className="text-white font-semibold">Lighting Control</h3>
          </div>
          <p className="text-white/80 text-sm">
            Click light devices to toggle them on/off. Watch realistic light spread and glow effects.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <FaDoorOpen className="text-green-300 text-xl" />
            <h3 className="text-white font-semibold">Door Control</h3>
          </div>
          <p className="text-white/80 text-sm">
            Click door devices to open/close them. See animated door movements in real-time.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-gray-300 text-xl">💨</div>
            <h3 className="text-white font-semibold">Climate Control</h3>
          </div>
          <p className="text-white/80 text-sm">
            Activate AC units to see wind particle effects and rotating fan blades.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-red-300 text-xl">🔥</div>
            <h3 className="text-white font-semibold">Smoke Detection</h3>
          </div>
          <p className="text-white/80 text-sm">
            Click smoke detectors to activate and see realistic smoke particle simulation.
          </p>
        </div>
      </div>

      {/* Device Status Summary */}
      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floorPlans.map((floor, index) => {
          const floorDevices = floor.devices || [];
          const activeFloorDevices = floorDevices.filter(device => 
            deviceStates[device.id]?.isOn
          ).length;

          return (
            <motion.div
              key={floor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{floor.name}</h3>
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {floor.floorNumber || index + 1}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Devices:</span>
                  <span className="font-medium text-gray-800">{floorDevices.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Devices:</span>
                  <span className="font-medium text-green-600">{activeFloorDevices}</span>
                </div>
                
                {/* Device type breakdown */}
                {floorDevices.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Device Status:</h4>
                    <div className="space-y-1">
                      {floorDevices.map(device => {
                        const deviceInfo = getDeviceById(device.deviceId);
                        const state = deviceStates[device.id];
                        return (
                          <div key={device.id} className="flex justify-between text-xs">
                            <span className="text-gray-600 truncate mr-2">
                              {deviceInfo?.name || 'Unknown Device'}:
                            </span>
                            <span className={`font-medium ${
                              state?.isOn ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {state?.isOn ? 'ON' : 'OFF'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="bg-gray-100 text-gray-800 border-2 border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 hover:border-accent-500 inline-flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to Device Placement
        </button>
        
        <button
          onClick={handleNext}
          className="bg-gradient-to-r from-primary-900 to-accent-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-accent-hover hover:-translate-y-1 inline-flex items-center gap-2"
        >
          Continue to Cost Calculation
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default EnhancedThreeVisualizationStep;