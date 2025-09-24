import { SmokeParticleSystem } from "@/components/ParticleSystem/SmokeParticle";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

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

export default SmokeDetector;