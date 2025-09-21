// src/components/Steps/DevicePlacementStep.tsx
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaArrowRight, FaArrowLeft, FaCheckCircle, FaCube, FaEye, FaShoppingCart } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';
import DeviceLibrary from '@/components/DeviceLibrary/DeviceLibrary';
import FloorPlanCanvas from '@/components/FloorPlan/FloorPlanCanvas';
import DeviceSelection from '@/components/DeviceSelection/DeviceSelection';

const DevicePlacementStep: React.FC = () => {
  const { 
    inputMethod, 
    floorPlans, 
    selectedDevices,
    setCurrentStep 
  } = useEstimationStore();

  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  const currentFloor = floorPlans[activeFloorIndex];
  const hasPlacedDevices = floorPlans.some(floor => floor.devices.length > 0) || selectedDevices.length > 0;
  const totalPlacedDevices = floorPlans.reduce((sum, floor) => sum + floor.devices.length, 0);

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
            ? 'Drag and drop devices onto your floor plans for precise placement'
            : 'Choose the smart home devices that best suit your needs'
          }
        </motion.p>
      </div>

      <DndProvider backend={HTML5Backend}>
        {inputMethod === 'dwg' ? (
          /* DWG Mode - Floor Plan with Device Library */
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Device Library Sidebar */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <DeviceLibrary />
            </motion.div>

            {/* Floor Plan Canvas Area */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Floor Tabs */}
                {floorPlans.length > 1 && (
                  <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex space-x-1">
                      {floorPlans.map((floor, index) => (
                        <button
                          key={floor.id}
                          onClick={() => setActiveFloorIndex(index)}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${index === activeFloorIndex
                              ? 'bg-accent-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          {floor.name}
                          {floor.devices.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-accent-600 bg-accent-100 rounded-full">
                              {floor.devices.length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Canvas Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {currentFloor?.name || 'Floor Plan'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Drag devices from the left panel to place them
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FaCube className="text-accent-500" />
                        Devices Placed: {currentFloor?.devices.length || 0}
                      </div>
                      {hasPlacedDevices && (
                        <button className="btn-outline text-sm py-2 px-4 inline-flex items-center gap-2">
                          <FaEye />
                          Preview 3D
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
                        No Floor Plan Available
                      </h3>
                      <p className="text-gray-500">
                        Please upload floor plans first
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Device Placement Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 bg-white rounded-2xl p-6 shadow-lg"
              >
                <h4 className="font-semibold text-gray-800 mb-3">Placement Tips</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Security Devices:</h5>
                    <ul className="space-y-1">
                      <li>• Place cameras at entry points</li>
                      <li>• Motion sensors in hallways</li>
                      <li>• Door locks on all exterior doors</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Smart Lighting:</h5>
                    <ul className="space-y-1">
                      <li>• One smart switch per room</li>
                      <li>• Motion lights in bathrooms</li>
                      <li>• Outdoor lights at entrances</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
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
      {hasPlacedDevices && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaShoppingCart className="text-accent-300 text-xl" />
              <h3 className="text-xl font-semibold text-white">
                {inputMethod === 'dwg' ? 'Placed Devices' : 'Selected Devices'}
              </h3>
            </div>
            <div className="text-accent-200">
              {inputMethod === 'dwg' 
                ? `${totalPlacedDevices} devices placed`
                : `${selectedDevices.length} devices selected`
              }
            </div>
          </div>

          {inputMethod === 'dwg' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {floorPlans.map(floor => (
                floor.devices.length > 0 && (
                  <div key={floor.id} className="bg-white/10 rounded-xl p-4">
                    <h4 className="font-medium text-white mb-2">{floor.name}</h4>
                    <p className="text-accent-200 text-sm">
                      {floor.devices.length} device{floor.devices.length !== 1 ? 's' : ''} placed
                    </p>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDevices.slice(0, 6).map(device => (
                <div key={device.id} className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FaCube className="text-accent-300" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{device.name}</p>
                    <p className="text-accent-200 text-xs">SAR {device.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {selectedDevices.length > 6 && (
                <div className="flex items-center justify-center bg-white/10 rounded-xl p-4">
                  <span className="text-white text-sm">
                    +{selectedDevices.length - 6} more devices
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

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
          Next: {inputMethod === 'dwg' ? 'View 3D Design' : 'Cost Calculation'}
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
          <div className="bg-yellow-500/20 backdrop-blur-md rounded-xl p-4 border border-yellow-400/30">
            <p className="text-yellow-200 text-sm">
              {inputMethod === 'dwg' 
                ? 'Please place at least one device on your floor plan to continue'
                : 'Please select at least one smart device to continue'
              }
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DevicePlacementStep;