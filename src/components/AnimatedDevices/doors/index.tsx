import {Box, Sphere} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

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

export default AnimatedDoor;