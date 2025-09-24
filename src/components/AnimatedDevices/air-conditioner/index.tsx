import { Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from 'three'
import { WindParticleSystem } from '../../ParticleSystem/WindParticle';


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

export default AirConditioner;