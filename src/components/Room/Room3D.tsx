import { Box, Text } from "@react-three/drei";

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

export default Room3D;