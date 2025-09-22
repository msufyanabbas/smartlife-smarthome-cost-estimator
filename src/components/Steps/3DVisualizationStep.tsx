import React, { Suspense, useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Box, Sphere } from '@react-three/drei';
import { FaArrowRight, FaArrowLeft, FaExpand, FaCompress, FaEye, FaHome, FaCube, FaPlay, FaLightbulb, FaDoorOpen, FaDoorClosed, FaVideo, FaCog } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDeviceById } from '@/data/devices';
import * as THREE from 'three';

// Particle system for smoke effect
class SmokeParticleSystem {
  particles: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  positions: Float32Array;
  velocities: Float32Array;
  ages: Float32Array;
  maxAge: number = 3.0;
  particleCount: number = 50;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      vertexColors: false
    });

    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.ages = new Float32Array(this.particleCount);

    this.initializeParticles();

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particles = new THREE.Points(this.geometry, this.material);
  }

  initializeParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      // Start particles at origin
      this.positions[i3] = (Math.random() - 0.5) * 0.2;
      this.positions[i3 + 1] = 0;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 0.2;

      // Random upward velocity with slight horizontal drift
      this.velocities[i3] = (Math.random() - 0.5) * 0.1;
      this.velocities[i3 + 1] = Math.random() * 0.5 + 0.2;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      this.ages[i] = Math.random() * this.maxAge;
    }
  }

  update(deltaTime: number) {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Update age
      this.ages[i] += deltaTime;
      
      if (this.ages[i] > this.maxAge) {
        // Reset particle
        this.positions[i3] = (Math.random() - 0.5) * 0.2;
        this.positions[i3 + 1] = 0;
        this.positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
        
        this.velocities[i3] = (Math.random() - 0.5) * 0.1;
        this.velocities[i3 + 1] = Math.random() * 0.5 + 0.2;
        this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
        
        this.ages[i] = 0;
      }
      
      // Update position
      this.positions[i3] += this.velocities[i3] * deltaTime;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;
      
      // Add some turbulence
      this.velocities[i3] += (Math.random() - 0.5) * 0.01;
      this.velocities[i3 + 2] += (Math.random() - 0.5) * 0.01;
    }
    
    this.geometry.attributes.position.needsUpdate = true;
    
    // Fade opacity based on age
    const avgAge = this.ages.reduce((sum, age) => sum + age, 0) / this.particleCount;
    this.material.opacity = Math.max(0.1, 0.6 * (1 - avgAge / this.maxAge));
  }
}

// Smoke Detector Component with Particle Smoke Effect
const SmokeDetector: React.FC<{ 
  position: [number, number, number];
  isActive: boolean;
  isAlarming?: boolean;
}> = ({ position, isActive, isAlarming = false }) => {
  const smokeSystemRef = useRef<SmokeParticleSystem | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.Mesh>(null);

  // Initialize smoke particle system
  useEffect(() => {
    if (isActive && !smokeSystemRef.current) {
      smokeSystemRef.current = new SmokeParticleSystem();
    }
  }, [isActive]);

  useFrame((state, delta) => {
    // Update smoke particles
    if (isActive && smokeSystemRef.current) {
      smokeSystemRef.current.update(delta);
    }

    // Blinking LED for alarm state
    if (ledRef.current) {
      const time = state.clock.getElapsedTime();
      if (isAlarming) {
        const blink = Math.sin(time * 15) > 0 ? 1 : 0.2;
        (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink * 0.8;
      } else if (isActive) {
        const slowBlink = Math.sin(time * 2) > 0 ? 0.5 : 0.2;
        (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = slowBlink;
      } else {
        (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
    }
  });

  useEffect(() => {
    // Add smoke particles to the scene
    if (groupRef.current && smokeSystemRef.current && isActive) {
      groupRef.current.add(smokeSystemRef.current.particles);
    }

    return () => {
      // Cleanup
      if (groupRef.current && smokeSystemRef.current) {
        groupRef.current.remove(smokeSystemRef.current.particles);
      }
    };
  }, [isActive]);

  return (
    <group ref={groupRef} position={position}>
      {/* Smoke Detector Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      
      {/* Detector Grill */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* LED Indicator */}
      <mesh ref={ledRef} position={[0.1, 0.03, 0]}>
        <sphereGeometry args={[0.015]} />
        <meshStandardMaterial
          color={isAlarming ? "#FF0000" : "#00FF00"}
          emissive={isAlarming ? "#FF0000" : "#00FF00"}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>

      {/* Test Button */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01]} />
        <meshStandardMaterial color="#FF4444" />
      </mesh>
    </group>
  );
};

// Air Conditioner Component with Wind Particle Effect
const AirConditioner: React.FC<{ 
  position: [number, number, number];
  isActive: boolean;
  windDirection?: [number, number, number];
}> = ({ position, isActive, windDirection = [1, -0.3, 0] }) => {
  const windSystemRef = useRef<WindParticleSystem | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const fanRef = useRef<THREE.Group>(null);

  // Initialize wind particle system
  useEffect(() => {
    if (isActive && !windSystemRef.current) {
      const direction = new THREE.Vector3(...windDirection);
      windSystemRef.current = new WindParticleSystem(direction);
    }
  }, [isActive, windDirection]);

  useFrame((state, delta) => {
    // Update wind particles
    if (isActive && windSystemRef.current) {
      windSystemRef.current.update(delta);
    }

    // Rotate fan blades when active
    if (fanRef.current && isActive) {
      fanRef.current.rotation.z += delta * 20; // Fast rotation
    }
  });

  useEffect(() => {
    // Add wind particles to the scene
    if (groupRef.current && windSystemRef.current && isActive) {
      groupRef.current.add(windSystemRef.current.particles);
    }

    return () => {
      // Cleanup
      if (groupRef.current && windSystemRef.current) {
        groupRef.current.remove(windSystemRef.current.particles);
      }
    };
  }, [isActive]);

  return (
    <group ref={groupRef} position={position}>
      {/* AC Unit Main Body */}
      <Box position={[0, 0, 0]} args={[1.2, 0.4, 0.3]} castShadow>
        <meshStandardMaterial color="#E0E0E0" />
      </Box>
      
      {/* AC Grille */}
      <Box position={[0.6, 0, 0.16]} args={[0.1, 0.3, 0.02]} castShadow>
        <meshStandardMaterial color="#333333" />
      </Box>
      
      {/* Fan Blades (visible through grille) */}
      <group ref={fanRef} position={[0.55, 0, 0.16]}>
        <mesh>
          <boxGeometry args={[0.02, 0.15, 0.01]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.02, 0.15, 0.01]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.02, 0.15, 0.01]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.02, 0.15, 0.01]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </group>

      {/* Status LED */}
      <mesh position={[-0.4, 0.15, 0.16]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial
          color={isActive ? "#00FF00" : "#FF0000"}
          emissive={isActive ? "#00FF00" : "#FF0000"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Control Panel */}
      <Box position={[-0.3, 0, 0.16]} args={[0.2, 0.15, 0.02]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
    </group>
  );
};

// Particle system for wind effect
class WindParticleSystem {
  particles: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  positions: Float32Array;
  velocities: Float32Array;
  ages: Float32Array;
  maxAge: number = 2.0;
  particleCount: number = 100;
  windDirection: THREE.Vector3;

  constructor(direction: THREE.Vector3 = new THREE.Vector3(1, 0, 0)) {
    this.windDirection = direction.normalize();
    
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      color: 0xaaaaff,
      size: 0.2,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.ages = new Float32Array(this.particleCount);

    this.initializeParticles();

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particles = new THREE.Points(this.geometry, this.material);
  }

  initializeParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Start particles from AC unit area
      this.positions[i3] = (Math.random() - 0.5) * 0.5;
      this.positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 0.5;

      // Wind velocity in the specified direction
      const speed = Math.random() * 2 + 1;
      this.velocities[i3] = this.windDirection.x * speed;
      this.velocities[i3 + 1] = this.windDirection.y * speed * 0.3;
      this.velocities[i3 + 2] = this.windDirection.z * speed;

      this.ages[i] = Math.random() * this.maxAge;
    }
  }

  update(deltaTime: number) {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      this.ages[i] += deltaTime;
      
      if (this.ages[i] > this.maxAge) {
        // Reset particle
        this.positions[i3] = (Math.random() - 0.5) * 0.5;
        this.positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
        this.positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
        
        const speed = Math.random() * 2 + 1;
        this.velocities[i3] = this.windDirection.x * speed;
        this.velocities[i3 + 1] = this.windDirection.y * speed * 0.3;
        this.velocities[i3 + 2] = this.windDirection.z * speed;
        
        this.ages[i] = 0;
      }
      
      // Update position
      this.positions[i3] += this.velocities[i3] * deltaTime;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }
}

// Device States Interface
interface DeviceState {
  [deviceId: string]: {
    isOn: boolean;
    animationProgress: number;
    intensity?: number;
    doorOpen?: boolean;
    rotation?: number;
    lastToggled?: number;
    isAlarming?: boolean;
    temperature?: number;
    fanSpeed?: string;
  };
}

// Modern Toggle Switch Component
const ModernToggleSwitch: React.FC<{
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isOn, onToggle, disabled = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-12 h-6',
    lg: 'w-16 h-8'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
        ${sizeClasses[size]}
        ${isOn 
          ? 'bg-gradient-to-r from-green-400 to-green-600' 
          : 'bg-gray-300'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
          ${isOn ? 'translate-x-full' : 'translate-x-0'}
        `}
      />
    </button>
  );
};

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

  // Get status text
  const getDeviceStatus = (deviceId: string, deviceInfo: any) => {
    const state = deviceStates[deviceId];
    if (!state) return 'Unknown';
    
    if (deviceInfo.name.toLowerCase().includes('smoke') || deviceInfo.name.toLowerCase().includes('detector')) {
      if (!state.isOn) return 'Standby';
      return state.isAlarming ? 'ALARM!' : 'Active';
    }
    
    if (deviceInfo.name.toLowerCase().includes('door')) {
      return state.doorOpen ? 'Open' : 'Closed';
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
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
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
                const isActive = state?.isOn || false;
                
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

// Light Effect Component
const LightEffect: React.FC<{ 
  position: [number, number, number]; 
  intensity: number; 
  isOn: boolean;
  color?: string;
}> = ({ position, intensity, isOn, color = '#ffd93d' }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lightRef.current && sphereRef.current) {
      const time = state.clock.getElapsedTime();
      
      if (isOn) {
        // Animate light intensity with slight flicker
        const flickerIntensity = intensity + Math.sin(time * 10) * 0.1;
        lightRef.current.intensity = Math.max(0, flickerIntensity);
        
        // Glow effect on sphere
        const glowIntensity = 0.3 + Math.sin(time * 5) * 0.1;
        (sphereRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity;
      } else {
        lightRef.current.intensity = 0;
        (sphereRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={position}>
      {/* Point Light */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={isOn ? intensity : 0}
        distance={8}
        decay={2}
        castShadow
      />
      
      {/* Light Bulb Representation */}
      <mesh ref={sphereRef} position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isOn ? 0.3 : 0}
          transparent
          opacity={isOn ? 0.8 : 0.3}
        />
      </mesh>
      
      {/* Light Spread Effect */}
      {isOn && (
        <mesh position={[0, -0.5, 0]}>
          <coneGeometry args={[2, 0.1, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  );
};

// Animated Door Component
const AnimatedDoor: React.FC<{ 
  position: [number, number, number];
  isOpen: boolean;
  width?: number;
  height?: number;
}> = ({ position, isOpen, width = 1.5, height = 2.5 }) => {
  const doorRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (doorRef.current) {
      const targetRotation = isOpen ? Math.PI / 2 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        targetRotation,
        0.1
      );
    }
  });

  return (
    <group position={position}>
      {/* Door Frame */}
      <group>
        {/* Left Frame */}
        <Box position={[-width/2 - 0.05, height/2, 0]} args={[0.1, height, 0.2]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        
        {/* Right Frame */}
        <Box position={[width/2 + 0.05, height/2, 0]} args={[0.1, height, 0.2]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        
        {/* Top Frame */}
        <Box position={[0, height + 0.05, 0]} args={[width + 0.2, 0.1, 0.2]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
      </group>

      {/* Animated Door */}
      <group ref={doorRef} position={[-width/2, 0, 0]}>
        <Box position={[width/2, height/2, 0]} args={[width, height, 0.1]} castShadow>
          <meshStandardMaterial color="#D2B48C" />
        </Box>
        
        {/* Door Handle */}
        <Sphere position={[width - 0.2, height/2, 0.1]} args={[0.05]} castShadow>
          <meshStandardMaterial color="#FFD700" />
        </Sphere>
      </group>
    </group>
  );
};

// Security Camera Component
const SecurityCamera: React.FC<{ 
  position: [number, number, number];
  isActive: boolean;
  scanMode?: boolean;
}> = ({ position, isActive, scanMode = true }) => {
  const cameraRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (cameraRef.current && scanMode && isActive) {
      const time = state.clock.getElapsedTime();
      cameraRef.current.rotation.y = Math.sin(time * 0.5) * 0.5;
    }

    if (ledRef.current) {
      const time = state.clock.getElapsedTime();
      if (isActive) {
        const blink = Math.sin(time * 8) > 0 ? 1 : 0.2;
        (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink * 0.8;
      } else {
        (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={position}>
      <group ref={cameraRef}>
        {/* Camera Body */}
        <Box position={[0, 0, 0]} args={[0.3, 0.2, 0.4]} castShadow>
          <meshStandardMaterial color="#2C2C2C" />
        </Box>
        
        {/* Camera Lens */}
        <mesh position={[0, 0, 0.25]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.1]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* LED Indicator */}
        <mesh ref={ledRef} position={[0.1, 0.05, 0.2]}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={isActive ? 0.8 : 0}
          />
        </mesh>
      </group>
    </group>
  );
};

// Enhanced Room Component with proper walls, doors, and windows
const Room3D: React.FC<{
  room: any;
  floorY: number;
  wallHeight: number;
}> = ({ room, floorY, wallHeight }) => {
  const bounds = room.bounds;
  const width = bounds.maxX - bounds.minX;
  const length = bounds.maxY - bounds.minY;
  const centerX = bounds.minX + width / 2;
  const centerY = bounds.minY + length / 2;

  // Room type colors
  const getRoomColor = (type: string) => {
    switch (type) {
      case 'living': return '#F5F5DC';
      case 'bedroom': return '#E6E6FA';
      case 'kitchen': return '#FFF8DC';
      case 'bathroom': return '#F0F8FF';
      case 'hallway': return '#F8F8FF';
      default: return '#F5F5F5';
    }
  };

  return (
    <group position={[centerX, floorY, centerY]}>
      {/* Room Floor */}
      <Box position={[0, 0, 0]} args={[width, 0.1, length]} receiveShadow>
        <meshStandardMaterial color={getRoomColor(room.type)} />
      </Box>

      {/* Room Walls */}
      {room.walls.map((wall: any, index: number) => {
        const wallLength = Math.sqrt(
          Math.pow(wall.end.x - wall.start.x, 2) + 
          Math.pow(wall.end.y - wall.start.y, 2)
        );
        const wallCenterX = (wall.start.x + wall.end.x) / 2 - centerX;
        const wallCenterY = (wall.start.y + wall.end.y) / 2 - centerY;
        const wallAngle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);

        return (
          <Box
            key={index}
            position={[wallCenterX, wallHeight / 2, wallCenterY]}
            args={[wallLength, wallHeight, 0.2]}
            rotation={[0, wallAngle, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#E8EAED" transparent opacity={0.8} />
          </Box>
        );
      })}

      {/* Room Label */}
      <Text
        position={[0, wallHeight + 0.5, 0]}
        fontSize={0.6}
        color="#483C8E"
        anchorX="center"
        anchorY="middle"
      >
        {room.name}
      </Text>
    </group>
  );
};

// Enhanced 3D Device Component with New Particle Effects
const InteractiveDevice3D: React.FC<{ 
  position: [number, number, number]; 
  deviceId: string;
  placedDeviceId: string;
  deviceState: any;
  onDeviceClick: (deviceId: string) => void;
}> = ({ position, deviceId, placedDeviceId, deviceState, onDeviceClick }) => {
  const [hovered, setHovered] = useState(false);
  const device = getDeviceById(deviceId);
  const meshRef = useRef<THREE.Mesh>(null);

  if (!device) return null;

  const getDeviceColor = (category: string, isOn: boolean = false) => {
    const colors = {
      security: isOn ? '#ff8a80' : '#ff6b6b',
      lighting: isOn ? '#ffeb3b' : '#ffd93d',
      climate: isOn ? '#81c784' : '#6bcf7f',
      entertainment: isOn ? '#4dd0e1' : '#4ecdc4',
      kitchen: isOn ? '#64b5f6' : '#45b7d1',
      bathroom: isOn ? '#a5d6a7' : '#96ceb4',
      outdoor: isOn ? '#ffb74d' : '#fdcb6e',
      default: isOn ? '#7e57c2' : '#483C8E'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const deviceColor = getDeviceColor(device.category, deviceState?.isOn);

  useFrame((state) => {
    if (meshRef.current && deviceState?.isOn) {
      const time = state.clock.getElapsedTime();
      // Subtle pulsing animation for active devices
      const scale = 1 + Math.sin(time * 4) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  // Handle different device types with specific components
  if (device.category === 'lighting') {
    return (
      <LightEffect
        position={position}
        intensity={deviceState?.intensity || 2}
        isOn={deviceState?.isOn || false}
      />
    );
  }

  // Smoke Detector Effect
  if (device.name.toLowerCase().includes('smoke') || 
      device.name.toLowerCase().includes('detector') ||
      device.id === 'smoke-detector') {
    return (
      <group 
        position={position}
        onClick={() => onDeviceClick(placedDeviceId)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <SmokeDetector
          position={[0, 0, 0]}
          isActive={deviceState?.isOn || false}
          isAlarming={deviceState?.isAlarming || false}
        />
        {hovered && (
          <Text
            position={[0, 1, 0]}
            fontSize={0.4}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            {device.name} - {deviceState?.isOn ? (deviceState?.isAlarming ? 'ALARM!' : 'Active') : 'Standby'}
          </Text>
        )}
      </group>
    );
  }

  // Air Conditioner / Climate Control Effect
  if (device.category === 'climate' || 
      device.name.toLowerCase().includes('ac') ||
      device.name.toLowerCase().includes('air') ||
      device.name.toLowerCase().includes('thermostat') ||
      device.id.includes('thermostat') ||
      device.id.includes('ac')) {
    return (
      <group 
        position={position}
        onClick={() => onDeviceClick(placedDeviceId)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <AirConditioner
          position={[0, 0, 0]}
          isActive={deviceState?.isOn || false}
          windDirection={[1, -0.3, 0]} // Default wind direction
        />
        {hovered && (
          <Text
            position={[0, 1, 0]}
            fontSize={0.4}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            {device.name} - {deviceState?.isOn ? `${deviceState?.temperature || 22}°C` : 'Off'}
          </Text>
        )}
      </group>
    );
  }

  if (device.id === 'smart-door-lock' || device.name.toLowerCase().includes('door')) {
    return (
      <group 
        position={position}
        onClick={() => onDeviceClick(placedDeviceId)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <AnimatedDoor
          position={[0, 0, 0]}
          isOpen={deviceState?.doorOpen || false}
        />
        {hovered && (
          <Text
            position={[0, 3, 0]}
            fontSize={0.4}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            {device.name} - {deviceState?.doorOpen ? 'Open' : 'Closed'}
          </Text>
        )}
      </group>
    );
  }

  if (device.category === 'security' && device.name.toLowerCase().includes('camera')) {
    return (
      <group onClick={() => onDeviceClick(placedDeviceId)}>
        <SecurityCamera
          position={position}
          isActive={deviceState?.isOn || false}
          scanMode={true}
        />
        {hovered && (
          <Text
            position={[position[0], position[1] + 1, position[2]]}
            fontSize={0.4}
            color="#2c3e50"
            anchorX="center"
            anchorY="middle"
          >
            {device.name} - {deviceState?.isOn ? 'Recording' : 'Off'}
          </Text>
        )}
      </group>
    );
  }

  // Default device representation
  return (
    <group position={position} onClick={() => onDeviceClick(placedDeviceId)}>
      <mesh
        ref={meshRef}
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
          emissiveIntensity={deviceState?.isOn ? 0.3 : (hovered ? 0.2 : 0.1)}
        />
      </mesh>
      
      {/* Device Status Indicator */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color={deviceState?.isOn ? "#00ff00" : "#ff0000"} 
          emissive={deviceState?.isOn ? "#00ff00" : "#ff0000"} 
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {hovered && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.4}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          {device.name} - {deviceState?.isOn ? 'ON' : 'OFF'}
        </Text>
      )}
    </group>
  );
};

// Main Enhanced 3D Scene with Room Structure
const Enhanced3DScene: React.FC<{ 
  viewMode: string; 
  deviceStates: DeviceState;
  onDeviceClick: (deviceId: string) => void;
}> = ({ viewMode, deviceStates, onDeviceClick }) => {
  const { floorPlans, propertyDetails } = useEstimationStore();
  
  const floorWidth = 12;
  const floorLength = 10;
  const floorHeight = 3;

  const totalDevices = useMemo(() => {
    return floorPlans.reduce((sum, floor) => sum + (floor.devices || []).length, 0);
  }, [floorPlans]);

  // Generate room structure from floor plan data
  const floorStructures = useMemo(() => {
    return floorPlans.map(floor => {
      // If we have parsed CAD data with rooms, use it
      if (floor.cadData?.floorStructure) {
        return floor.cadData.floorStructure;
      }
      
      // Otherwise create a simple room structure
      return {
        rooms: [{
          id: 'main-room',
          name: 'Main Room',
          type: 'living',
          bounds: { minX: -6, maxX: 6, minY: -5, maxY: 5 },
          walls: [
            { start: { x: -6, y: -5 }, end: { x: 6, y: -5 } },
            { start: { x: 6, y: -5 }, end: { x: 6, y: 5 } },
            { start: { x: 6, y: 5 }, end: { x: -6, y: 5 } },
            { start: { x: -6, y: 5 }, end: { x: -6, y: -5 } }
          ],
          doors: [],
          windows: [],
          area: 120
        }],
        walls: [],
        doors: [],
        windows: [],
        bounds: { minX: -6, maxX: 6, minY: -5, maxY: 5 }
      };
    });
  }, [floorPlans]);

  return (
    <>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[15, 15, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 8, -5]} intensity={0.4} color="#FFA500" />
      <pointLight position={[10, 8, 5]} intensity={0.3} color="#87CEEB" />

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

      {/* Enhanced Floors with Room Structure */}
      {floorPlans.map((floor, floorIndex) => {
        const floorY = floorIndex * (floorHeight + 0.5);
        const floorStructure = floorStructures[floorIndex];
        
        return (
          <group key={floor.id}>
            {/* Render Rooms */}
            {floorStructure.rooms.map((room: any) => (
              <Room3D
                key={room.id}
                room={room}
                floorY={floorY}
                wallHeight={floorHeight}
              />
            ))}
            
            {/* Floor Number Label */}
            <Text
              position={[0, floorY + floorHeight + 1, 0]}
              fontSize={1}
              color="#483C8E"
              anchorX="center"
              anchorY="middle"
            >
              Floor {floor.floorNumber || floorIndex + 1}
            </Text>
            
            {/* Interactive Devices */}
            {(floor.devices || []).map((placedDevice) => {
              const canvasWidth = floor.dimensions?.width || 1000;
              const canvasHeight = floor.dimensions?.height || 800;
              
              const centeredX = placedDevice.x - (canvasWidth / 2);
              const centeredZ = placedDevice.y - (canvasHeight / 2);
              
              const normalizedX = centeredX / (canvasWidth / 2);
              const normalizedZ = centeredZ / (canvasHeight / 2);
              
              const clampedX = Math.max(-1, Math.min(1, normalizedX));
              const clampedZ = Math.max(-1, Math.min(1, normalizedZ));
              
              const x = clampedX * (floorWidth * 0.45);
              const z = clampedZ * (floorLength * 0.45);
              const y = floorY + 0.4;
              
              return (
                <InteractiveDevice3D
                  key={placedDevice.id}
                  position={[x, y, z]}
                  deviceId={placedDevice.deviceId}
                  placedDeviceId={placedDevice.id}
                  deviceState={deviceStates[placedDevice.id]}
                  onDeviceClick={onDeviceClick}
                />
              );
            })}
          </group>
        );
      })}

      {/* Property Information Display */}
      <Text
        position={[0, (floorPlans.length * (floorHeight + 0.5)) + 3, 0]}
        fontSize={1.2}
        color="#C36BA8"
        anchorX="center"
        anchorY="middle"
      >
        Smart Home Visualization
      </Text>

      <Text
        position={[0, (floorPlans.length * (floorHeight + 0.5)) + 2, 0]}
        fontSize={0.8}
        color="#483C8E"
        anchorX="center"
        anchorY="middle"
      >
        {propertyDetails.size} sq ft • {totalDevices} Interactive Devices
      </Text>
    </>
  );
};

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