import { Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

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

export default SecurityCamera;