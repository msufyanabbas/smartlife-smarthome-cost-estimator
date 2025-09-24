import { getDeviceById } from "@/data/devices";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import LightEffect from "../light";
import SmokeDetector from "../smokeDetector";
import AirConditioner from "../air-conditioner";
import AnimatedDoor from "../doors";
import SecurityCamera from "../security-camera";

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

export default InteractiveDevice3D;