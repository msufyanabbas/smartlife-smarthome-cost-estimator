// src/components/Steps/DevicePlacementStep.tsx
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaArrowRight, FaArrowLeft, FaCheckCircle, FaCube, FaEye, FaShoppingCart, FaLayerGroup, FaTools, FaExpand, FaCompress } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion, AnimatePresence } from 'framer-motion';
import DeviceLibrary from '@/components/DeviceLibrary/DeviceLibrary';
import FloorPlanCanvas from '@/components/FloorPlan/FloorPlanCanvas';
import DeviceSelection from '@/components/DeviceSelection/DeviceSelection';
import { useLanguage } from '@/contexts/LanguageContext';

const DevicePlacementStep: React.FC = () => {
  const { 
    inputMethod, 
    floorPlans, 
    selectedDevices,
    setCurrentStep 
  } = useEstimationStore();

  const { t } = useLanguage();
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [showPreview3D, setShowPreview3D] = useState(false);
  const [isDeviceLibraryExpanded, setIsDeviceLibraryExpanded] = useState(false);

  const currentFloor = floorPlans[activeFloorIndex];
  const hasPlacedDevices = floorPlans.some(floor => (floor.devices || []).length > 0) || selectedDevices.length > 0;
  const totalPlacedDevices = floorPlans.reduce((sum, floor) => sum + (floor.devices || []).length, 0);

  // Sort floor plans by floor number for proper display
  const sortedFloorPlans = [...floorPlans].sort((a, b) => (a.floorNumber || 0) - (b.floorNumber || 0));

  const handleNext = () => {
    if (inputMethod === 'dwg') {
      setCurrentStep('3d-visualization');
    } else {
      setCurrentStep('cost-calculation');
    }
  };

  const handleBack = () => {
    if (inputMethod === 'dwg') {
      setCurrentStep('floor-upload');
    } else {
      setCurrentStep('property-details');
    }
  };

  const handlePreview3D = () => {
    if (inputMethod === 'dwg' && totalPlacedDevices > 0) {
      setCurrentStep('3d-visualization');
    }
  };

  // Debug logging for floor switching
  const handleFloorSwitch = (floorIndex: number) => {
    console.log('Switching to floor:', {
      oldIndex: activeFloorIndex,
      newIndex: floorIndex,
      floorId: floorPlans[floorIndex]?.id,
      floorName: floorPlans[floorIndex]?.name,
      deviceCount: floorPlans[floorIndex]?.devices?.length || 0
    });
    setActiveFloorIndex(floorIndex);
  };

  const toggleDeviceLibrarySize = () => {
    setIsDeviceLibraryExpanded(!isDeviceLibraryExpanded);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-bold text-white mb-4"
        >
          {inputMethod === 'dwg' ? 'Place Smart Devices' : 'Select Smart Devices'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/80 max-w-3xl mx-auto"
        >
          {inputMethod === 'dwg' 
            ? 'Drag and drop devices onto your floor plans to create the perfect smart home layout'
            : 'Choose the smart devices you want for your home and customize quantities'
          }
        </motion.p>
      </div>

      <DndProvider backend={HTML5Backend}>
        {inputMethod === 'dwg' ? (
          /* DWG Mode - Floor Plan with Device Library */
          <div className={`grid gap-6 transition-all duration-300 ${
            isDeviceLibraryExpanded ? 'lg:grid-cols-2' : 'lg:grid-cols-4'
          }`}>
            {/* Device Library Sidebar - Fixed Height with Scrollable Content */}
            <motion.div 
              className={`transition-all duration-300 ${
                isDeviceLibraryExpanded ? 'lg:col-span-1' : 'lg:col-span-1'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '600px', maxHeight: '670px' }}>
                {/* Device Library Header - Fixed */}
                <div className="px-6 py-4 bg-gradient-to-r bg-primary-800 to-accent-500 text-white flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaCube className="text-xl" />
                      <div>
                        <h3 className="text-lg font-semibold">Device Library</h3>
                        <p className="text-xs text-white/80">Drag to place on floor plan</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDeviceLibrarySize}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title={isDeviceLibraryExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isDeviceLibraryExpanded ? <FaCompress /> : <FaExpand />}
                    </button>
                  </div>
                </div>

                {/* Device Library Content - Scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  <div className="p-6">
                    <DeviceLibrary />
                  </div>
                </div>

                {/* Device Library Footer - Fixed */}
                <div className="px-6 py-3 bg-gray-50 border-t flex-shrink-0">
                  <div className="text-sm text-gray-600 text-center">
                    <span className="font-medium">{totalPlacedDevices}</span> devices placed
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floor Plan Canvas Area */}
            <motion.div 
              className={`transition-all duration-300 ${
                isDeviceLibraryExpanded ? 'lg:col-span-1' : 'lg:col-span-3'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Floor Tabs */}
                {sortedFloorPlans.length > 1 && (
                  <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex space-x-1 overflow-x-auto">
                      {sortedFloorPlans.map((floor, index) => {
                        const originalIndex = floorPlans.findIndex(f => f.id === floor.id);
                        return (
                          <button
                            key={floor.id}
                            onClick={() => handleFloorSwitch(originalIndex)}
                            className={`
                              flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                              ${originalIndex === activeFloorIndex
                                ? 'bg-accent-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                              }
                            `}
                          >
                            <FaLayerGroup className="text-xs" />
                            {floor.name}
                            {(floor.devices || []).length > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-accent-600 bg-accent-100 rounded-full">
                                {floor.devices.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Canvas Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaTools className="text-accent-500" />
                        {currentFloor?.name || 'Floor Plan'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Drag devices from the library to place them on your floor plan
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FaCube className="text-accent-500" />
                        <span className="font-medium">{currentFloor?.devices.length || 0}</span> devices on this floor
                      </div>
                      {hasPlacedDevices && totalPlacedDevices > 0 && (
                        <button 
                          onClick={handlePreview3D}
                          className="bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center gap-2"
                        >
                          <FaEye />
                          Preview in 3D
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Floor Plan Canvas */}
                <div className="p-6">
                  {currentFloor ? (
                    <FloorPlanCanvas floor={currentFloor} />
                  ) : (
                    <div className="text-center py-16">
                      <FaCube className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-600 mb-2">
                        No Floor Plan Selected
                      </h3>
                      <p className="text-gray-500">
                        Please upload floor plans first to start placing devices
                      </p>
                      <button
                        onClick={() => setCurrentStep('floor-upload')}
                        className="mt-4 btn-outline inline-flex items-center gap-2"
                      >
                        <FaArrowLeft />
                        Go Back to Upload
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Device Placement Tips */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 bg-white rounded-2xl p-6 shadow-lg"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Device Placement Tips
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Security Devices:</h5>
                    <ul className="space-y-1">
                      <li>• Place cameras at entry points and corners</li>
                      <li>• Position motion sensors in hallways</li>
                      <li>• Install smart locks on main doors</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Smart Lighting:</h5>
                    <ul className="space-y-1">
                      <li>• Place smart switches near room entrances</li>
                      <li>• Add motion lights in bathrooms and closets</li>
                      <li>• Consider smart bulbs for main living areas</li>
                    </ul>
                  </div>
                </div>
              </motion.div> */}
            </motion.div>
          </div>
        ) : (
          /* Manual Mode - Device Selection */
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DeviceSelection />
          </motion.div>
        )}
      </DndProvider>

      {/* Device Summary */}
     

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="bg-gray-100 text-gray-800 border-2 border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 hover:border-accent-500 inline-flex items-center gap-2"
        >
          <FaArrowLeft />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!hasPlacedDevices}
          className={`
            font-semibold py-3 px-6 rounded-xl transition-all duration-300 inline-flex items-center gap-2
            ${hasPlacedDevices
              ? 'bg-gradient-to-r from-primary-900 to-accent-500 text-white hover:shadow-accent-hover hover:-translate-y-1'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {inputMethod === 'dwg' ? 'View in 3D' : 'Calculate Costs'}
          <FaArrowRight />
        </button>
      </div>

      {/* Help Message */}
      {!hasPlacedDevices && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          {/* <div className="bg-yellow-500/20 backdrop-blur-md rounded-xl p-4 border border-yellow-400/30">
            <p className="text-yellow-200 text-sm">
              {inputMethod === 'dwg' 
                ? 'Start by dragging devices from the library onto your floor plan to continue'
                : 'Select at least one smart device to proceed to cost calculation'
              }
            </p>
          </div> */}
        </motion.div>
      )}
    </div>
  );
};

export default DevicePlacementStep;