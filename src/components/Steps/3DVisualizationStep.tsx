// src/components/Steps/3DVisualizationStep.tsx
import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text } from '@react-three/drei';
import { FaArrowRight, FaArrowLeft, FaExpand, FaCompress, FaEye, FaHome, FaCube, FaPlay } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDeviceById } from '@/data/devices';
import * as THREE from 'three';

// 3D Floor Component
const Floor3D: React.FC<{ 
  width: number; 
  length: number; 
  height: number; 
  position: [number, number, number];
  floorNumber: number;
}> = ({ width, length, height, position, floorNumber }) => {
  return (
    <group position={position}>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[width, 0.2, length]} />
        <meshStandardMaterial color="#f1f3f4" />
      </mesh>
      
      {/* Walls */}
      {/* Front Wall */}
      <mesh position={[0, height/2, length/2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color="#e8eaed" transparent opacity={0.8} />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[0, height/2, -length/2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color="#e8eaed" transparent opacity={0.8} />
      </mesh>
      
      {/* Left Wall */}
      <mesh position={[-width/2, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, height, length]} />
        <meshStandardMaterial color="#e8eaed" transparent opacity={0.8} />
      </mesh>
      
      {/* Right Wall */}
      <mesh position={[width/2, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, height, length]} />
        <meshStandardMaterial color="#e8eaed" transparent opacity={0.8} />
      </mesh>

      {/* Floor Number Label */}
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.8}
        color="#483C8E"
        anchorX="center"
        anchorY="middle"
      >
        Floor {floorNumber}
      </Text>
    </group>
  );
};

// 3D Device Component
const Device3D: React.FC<{ 
  position: [number, number, number]; 
  deviceId: string;
  placedDeviceId: string;
}> = ({ position, deviceId, placedDeviceId }) => {
  const [hovered, setHovered] = useState(false);
  const device = getDeviceById(deviceId);

  if (!device) return null;

  // Device colors based on category
  const getDeviceColor = (category: string) => {
    switch (category) {
      case 'security': return '#ff6b6b';
      case 'lighting': return '#ffd93d';
      case 'climate': return '#6bcf7f';
      case 'entertainment': return '#4ecdc4';
      case 'kitchen': return '#45b7d1';
      case 'bathroom': return '#96ceb4';
      case 'outdoor': return '#fdcb6e';
      default: return '#483C8E';
    }
  };

  const deviceColor = getDeviceColor(device.category);

  return (
    <group position={position}>
      <mesh
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial 
          color={hovered ? '#C36BA8' : deviceColor}
          emissive={hovered ? '#C36BA8' : deviceColor}
          emissiveIntensity={hovered ? 0.2 : 0.1}
        />
      </mesh>
      
      {/* Device indicator light */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00" 
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {hovered && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.9}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          {device.name}
        </Text>
      )}
    </group>
  );
};

// Main 3D Scene
const Scene3D: React.FC<{ viewMode: string }> = ({ viewMode }) => {
  const { floorPlans, propertyDetails } = useEstimationStore();
  
  const floorWidth = 12;
  const floorLength = 10;
  const floorHeight = 3;

  const totalDevices = useMemo(() => {
    return floorPlans.reduce((sum, floor) => sum + (floor.devices || []).length, 0);
  }, [floorPlans]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[15, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 5, -5]} intensity={0.3} />

      {/* Environment */}
      <Environment preset="apartment" />
      
      {/* Grid */}
      <Grid 
        args={[30, 30]} 
        position={[0, -0.1, 0]}
        cellSize={1}
        cellThickness={0.8}
        cellColor="#dee2e6"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#adb5bd"
        fadeDistance={40}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* Multiple Floors */}
      // Fixed Device positioning section in Scene3D component
{floorPlans.map((floor, index) => {
  const floorPosition: [number, number, number] = [0, index * (floorHeight + 0.5), 0];
  
  return (
    <group key={floor.id}>
      <Floor3D 
        width={floorWidth} 
        length={floorLength} 
        height={floorHeight}
        position={floorPosition}
        floorNumber={floor.floorNumber || index + 1}
      />
      
      {/* Devices on this floor */}
      {(floor.devices || []).map((placedDevice, deviceIndex) => {
        // Get actual floor dimensions from the floor plan
        const canvasWidth = floor.dimensions.width;
        const canvasHeight = floor.dimensions.height;
        
        // Convert canvas coordinates (0,0 top-left) to centered coordinates
        const centeredX = placedDevice.x - (canvasWidth / 2);
        const centeredZ = placedDevice.y - (canvasHeight / 2);
        
        // Normalize to -1 to 1 range based on actual canvas dimensions
        const normalizedX = centeredX / (canvasWidth / 2);
        const normalizedZ = centeredZ / (canvasHeight / 2);
        
        // Clamp values to ensure they stay within bounds
        const clampedX = Math.max(-1, Math.min(1, normalizedX));
        const clampedZ = Math.max(-1, Math.min(1, normalizedZ));
        
        // Scale to floor size with margin (0.9 instead of 0.8 for better utilization)
        const x = clampedX * (floorWidth * 0.45); // Half width * margin
        const z = clampedZ * (floorLength * 0.45); // Half length * margin
        const y = index * (floorHeight + 0.5) + 0.4; // Position above floor
        
        return (
          <Device3D
            key={placedDevice.id}
            position={[x, y, z]}
            deviceId={placedDevice.deviceId}
            placedDeviceId={placedDevice.id}
          />
        );
      })}
    </group>
  );
})}

      {/* Property Information Display */}
      <Text
        position={[0, (floorPlans.length * (floorHeight + 0.5)) + 2, 0]}
        fontSize={1}
        color="#C36BA8"
        anchorX="center"
        anchorY="middle"
      >
        {propertyDetails.type?.charAt(0).toUpperCase()}{propertyDetails.type?.slice(1)} Property
      </Text>

      <Text
        position={[0, (floorPlans.length * (floorHeight + 0.5)) + 1, 0]}
        fontSize={0.6}
        color="#483C8E"
        anchorX="center"
        anchorY="middle"
      >
        {propertyDetails.size} sq ft • {totalDevices} Smart Devices
      </Text>
    </>
  );
};

const ThreeVisualizationStep: React.FC = () => {
  const { floorPlans, setCurrentStep, propertyDetails } = useEstimationStore();
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'perspective' | 'top' | 'side'>('perspective');
  const [isLoading, setIsLoading] = useState(true);

  const handleNext = () => {
    setCurrentStep('cost-calculation');
  };

  const handleBack = () => {
    setCurrentStep('device-placement');
  };

  const totalDevices = useMemo(() => {
    return floorPlans.reduce((sum, floor) => sum + (floor.devices || []).length, 0);
  }, [floorPlans]);

  // Handle fullscreen functionality
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key for fullscreen
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const getCameraPosition = (): [number, number, number] => {
    const floorCount = floorPlans.length;
    const buildingHeight = floorCount * 3.5; // floorHeight + gap
    
    switch (viewMode) {
      case 'top':
        return [0, buildingHeight + 15, 0]; // Higher position for top view
      case 'side':
        return [30, buildingHeight / 2, 0]; // Side view from the side
      case 'perspective':
      default:
        return [18, buildingHeight / 2 + 8, 18]; // Perspective view
    }
  };

  const getCameraTarget = (): [number, number, number] => {
    const floorCount = floorPlans.length;
    const buildingCenter = (floorCount * 3.5) / 2;
    
    switch (viewMode) {
      case 'top':
        return [0, buildingCenter, 0];
      case 'side':
        return [0, buildingCenter, 0];
      case 'perspective':
      default:
        return [0, buildingCenter, 0];
    }
  };

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          3D Smart Home Visualization
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          View your smart home setup in 3D and see how devices are positioned across your floors
        </p>
      </div>

      {/* 3D Viewer */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300
        ${isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none' 
          : 'h-96 lg:h-[600px]'
        }
      `}>
        {/* Fullscreen overlay for better visibility */}
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

        {/* Device Count */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FaCube className="text-accent-500" />
              {totalDevices} Devices Placed
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Preparing 3D Visualization...</p>
              <p className="text-gray-500 text-sm mt-2">Loading {floorPlans.length} floor{floorPlans.length > 1 ? 's' : ''} with {totalDevices} devices</p>
            </div>
          </div>
        ) : (
          <Canvas
            key={viewMode} // Force re-render when view mode changes
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
              <Scene3D viewMode={viewMode} />
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={viewMode === 'perspective'}
                maxDistance={60}
                minDistance={3}
                target={getCameraTarget()}
                enableDamping={true}
                dampingFactor={0.05}
                // Restrict rotation for specific views
                maxPolarAngle={viewMode === 'top' ? Math.PI / 6 : Math.PI} // Limit top view rotation
                minPolarAngle={viewMode === 'top' ? 0 : 0}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Floor Information */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {floorPlans.map((floor, index) => (
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
                <span className="text-gray-600">Devices Placed:</span>
                <span className="font-medium text-gray-800">{(floor.devices || []).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Floor Size:</span>
                <span className="font-medium text-gray-800">
                  {floor.dimensions.width} × {floor.dimensions.height}px
                </span>
              </div>
              {floor.dwgFile && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Floor Plan:</span>
                  <span className="font-medium text-gray-800 truncate max-w-24" title={floor.dwgFile.name}>
                    {floor.dwgFile.name}
                  </span>
                </div>
              )}
              
              {/* Device breakdown */}
              {(floor.devices || []).length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Device Types:</h4>
                  <div className="space-y-1">
                    {Object.entries(
                      (floor.devices || []).reduce((acc, device) => {
                        const deviceInfo = getDeviceById(device.deviceId);
                        if (deviceInfo) {
                          acc[deviceInfo.category] = (acc[deviceInfo.category] || 0) + 1;
                        }
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
                      <div key={category} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">{category}:</span>
                        <span className="font-medium text-gray-800">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visualization Tips */}
      <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">3D Visualization Controls</h3>
        <div className="grid md:grid-cols-3 gap-6 text-white/80 text-sm">
          <div>
            <h4 className="font-medium text-white mb-2">Mouse Controls:</h4>
            <ul className="space-y-1">
              <li>• Left click + drag to rotate view</li>
              <li>• Right click + drag to pan around</li>
              <li>• Scroll wheel to zoom in/out</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">View Modes:</h4>
            <ul className="space-y-1">
              <li>• 3D View: Full perspective visualization</li>
              <li>• Top View: Overhead floor plan view</li>
              <li>• Side View: Profile view of all floors</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Device Interaction:</h4>
            <ul className="space-y-1">
              <li>• Hover over devices to see names</li>
              <li>• Different colors show device categories</li>
              <li>• Green lights indicate active devices</li>
            </ul>
          </div>
        </div>
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

export default ThreeVisualizationStep;