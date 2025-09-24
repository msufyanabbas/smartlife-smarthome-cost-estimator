import { useEstimationStore } from "@/store/estimationStore";
import { DeviceState } from "@/types";
import { Environment, Grid, Text } from "@react-three/drei";
import { useMemo } from "react";
import Room3D from "../Room/Room3D";
import InteractiveDevice3D from "../AnimatedDevices/devices/Interactive3DDevice";

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

export default Enhanced3DScene;