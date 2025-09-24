import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

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

export default LightEffect;