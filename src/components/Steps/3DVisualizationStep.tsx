// src/components/Steps/3DVisualizationStep.tsx
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text } from '@react-three/drei';
import { FaArrowRight, FaArrowLeft, FaExpand, FaCompress, FaEye, FaHome } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';

// 3D Floor Component
const Floor3D: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, length]} />
        <meshStandardMaterial color="#f8f9fa" />
      </mesh>
      
      {/* Walls */}
      {/* Front Wall */}
      <mesh position={[0, height/2, length/2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color="#e9ecef" />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[0, height/2, -length/2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color="#e9ecef" />
      </mesh>
      
      {/* Left Wall */}
      <mesh position={[-width/2, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, height, length]} />
        <meshStandardMaterial color="#e9ecef" />
      </mesh>
      
      {/* Right Wall */}
      <mesh position={[width/2, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, height, length]} />
        <meshStandardMaterial color="#e9ecef" />
      </mesh>
    </group>
  );
};

// 3D Device Component
const Device3D: React.FC<{ 
  position: [number, number, number]; 
  color: string; 
  name: string 
}> = ({ position, color, name }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color={hovered ? '#C36BA8' : color} />
      </mesh>
      
      {hovered && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.2}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      )}
    </group>
  );
};

// Main 3D Scene
const Scene3D: React.FC = () => {
  const { floorPlans, propertyDetails } = useEstimationStore();
  
  const floorWidth = 10;
  const floorLength = 8;
  const floorHeight = 3;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Environment */}
      <Environment preset="apartment" />
      
      {/* Grid */}
      <Grid 
        args={[20, 20]} 
        position={[0, -0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#dee2e6"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#adb5bd"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* Multiple Floors */}
      {floorPlans.map((floor, index) => (
        <group key={floor.id} position={[0, index * floorHeight, 0]}>
          <Floor3D width={floorWidth} length={floorLength} height={floorHeight} />
          
          {/* Devices on this floor */}
          {floor.devices.map((device, deviceIndex) => {
            // Convert 2D coordinates to 3D
            const x = (device.x / 100 - floorWidth / 2);
            const z = (device.y / 100 - floorLength / 2);
            const y = 0.2; // Slightly above floor

            return (
              <Device3D
                key={device.id}
                position={[x, y, z]}
                color="#483C8E"
                name={`Device ${deviceIndex + 1}`}
              />
            );
          })}
          
          {/* Floor Label */}
          <Text
            position={[0, floorHeight + 0.5, 0]}
            fontSize={0.5}
            color="#483C8E"
            anchorX="center"
            anchorY="middle"
          >
            {floor.name}
          </Text>
        </group>
      ))}

      {/* Property Type Indicator */}
      <Text
        position={[0, (floorPlans.length * floorHeight) + 1, 0]}
        fontSize={0.8}
        color="#C36BA8"
        anchorX="center"
        anchorY="middle"
      >
        {propertyDetails.type?.charAt(0).toUpperCase()}{propertyDetails.type?.slice(1)} - {propertyDetails.size} sq ft
      </Text>
    </>
  );
};

const ThreeVisualizationStep: React.FC = () => {
  const { floorPlans, setCurrentStep } = useEstimationStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'perspective' | 'top' | 'side'>('perspective');

  const handleNext = () => {
    setCurrentStep('cost-calculation');
  };

  const handleBack = () => {
    setCurrentStep('device-placement');
  };

  const totalDevices = floorPlans.reduce((sum, floor) => sum + floor.devices.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          3D Visualization
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Explore your smart home design in 3D. Rotate, zoom, and inspect device placement.
        </p>
      </div>

      {/* 3D Viewer */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300
        ${isFullscreen ? 'fixed inset-4 z-50' : 'h-96 lg:h-[600px]'}
      `}>
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
              3D
            </button>
            <button
              onClick={() => setViewMode('top')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'top' 
                  ? 'bg-accent-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setViewMode('side')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'side' 
                  ? 'bg-accent-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Side
            </button>
          </div>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-gray-600 hover:text-accent-500 transition-colors"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>

        {/* Device Count */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FaHome className="text-accent-500" />
              {totalDevices} devices placed
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <Canvas
          shadows
          camera={{
            position: viewMode === 'perspective' ? [15, 10, 15] 
                    : viewMode === 'top' ? [0, 20, 0.1]
                    : [20, 5, 0],
            fov: 50
          }}
          style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
        >
          <Suspense fallback={null}>
            <Scene3D />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={viewMode === 'perspective'}
              maxDistance={30}
              minDistance={3}
            />
          </Suspense>
        </Canvas>

        {/* Loading Fallback */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading 3D visualization...</p>
          </div>
        </div>
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
                {index + 1}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Devices Placed:</span>
                <span className="font-medium text-gray-800">{floor.devices.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Floor Size:</span>
                <span className="font-medium text-gray-800">
                  {floor.dimensions.width} × {floor.dimensions.height}
                </span>
              </div>
              {floor.dwgFile && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">DWG File:</span>
                  <span className="font-medium text-gray-800 truncate max-w-24" title={floor.dwgFile.name}>
                    {floor.dwgFile.name}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visualization Tips */}
      <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">3D Viewer Controls</h3>
        <div className="grid md:grid-cols-3 gap-6 text-white/80 text-sm">
          <div>
            <h4 className="font-medium text-white mb-2">Mouse Controls:</h4>
            <ul className="space-y-1">
              <li>• Left click + drag: Rotate view</li>
              <li>• Right click + drag: Pan view</li>
              <li>• Scroll wheel: Zoom in/out</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">View Modes:</h4>
            <ul className="space-y-1">
              <li>• 3D: Full perspective view</li>
              <li>• Top: Overhead floor plan</li>
              <li>• Side: Cross-section view</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Device Info:</h4>
            <ul className="space-y-1">
              <li>• Hover over devices for details</li>
              <li>• Each floor shown at different levels</li>
              <li>• Purple boxes represent devices</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to Device Placement
        </button>
        
        <button
          onClick={handleNext}
          className="btn-primary inline-flex items-center gap-2"
        >
          Next: Cost Calculation
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ThreeVisualizationStep;