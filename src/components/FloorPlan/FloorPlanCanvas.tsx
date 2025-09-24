// Enhanced FloorPlanCanvas.tsx with CAD Room Detection Integration
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { FaSearchPlus, FaSearchMinus, FaHome} from 'react-icons/fa';
import { PlacedDevice, DragItem, FloorPlanCanvasProps, Room, FloorStructure } from '@/types';
import { useEstimationStore } from '@/store/estimationStore';
import { useLanguage } from '@/contexts/LanguageContext';
import EnhancedFloorPlanViewer from '../FloorPlanViewer';
import PlacedDeviceComponent from '../DevicePlacement';

const EnhancedFloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ floor }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { updateFloorPlan } = useEstimationStore();
  const { t } = useLanguage();
  const [scale, setScale] = useState(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [cadData, setCADData] = useState<any>(null);
  const [floorStructure, setFloorStructure] = useState<FloorStructure | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'device',
    drop: (item: DragItem, monitor) => {
      if (!canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      
      if (offset) {
        const x = Math.max(0, (offset.x - canvasRect.left) / scale - 20);
        const y = Math.max(0, (offset.y - canvasRect.top) / scale - 20);
        
        const uniqueId = `placed-${floor.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newDevice: PlacedDevice = {
          deviceId: item.device.id,
          id: uniqueId,
          x: Math.min(x, (canvasSize.width / scale) - 40),
          y: Math.min(y, (canvasSize.height / scale) - 40),
          rotation: 0,
          scale: 1
        };

        const updatedDevices = [...(floor.devices || []), newDevice];
        updateFloorPlan(floor.id, { 
          devices: updatedDevices,
          cadData: cadData ? { ...cadData, floorStructure } : undefined
        });
        setSelectedDeviceId(newDevice.id);

        console.log('Device placed in room context:', {
          deviceId: item.device.id,
          position: { x: newDevice.x, y: newDevice.y },
          nearestRoom: hoveredRoom?.name || 'Unknown',
          floorStructure: floorStructure ? 'Available' : 'None'
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [floor.id, floor.devices, scale, canvasSize, updateFloorPlan, cadData, floorStructure, hoveredRoom]);

  const handleCADParsed = useCallback((parsedData: any, parsedFloorStructure: FloorStructure) => {
    setCADData(parsedData);
    setFloorStructure(parsedFloorStructure);
    
    // Update floor plan with parsed structure
    updateFloorPlan(floor.id, {
      cadData: { ...parsedData, floorStructure: parsedFloorStructure }
    });

    console.log('Floor structure parsed:', {
      rooms: parsedFloorStructure.rooms.length,
      walls: parsedFloorStructure.walls.length,
      doors: parsedFloorStructure.doors.length,
      windows: parsedFloorStructure.windows.length
    });
  }, [floor.id, updateFloorPlan]);

  const handleRoomHover = useCallback((room: Room | null) => {
    setHoveredRoom(room);
  }, []);

  const handleRemoveDevice = (deviceId: string) => {
    const updatedDevices = (floor.devices || []).filter(d => d.id !== deviceId);
    updateFloorPlan(floor.id, { devices: updatedDevices });
    if (selectedDeviceId === deviceId) {
      setSelectedDeviceId('');
    }
  };

  const handleMoveDevice = (deviceId: string, x: number, y: number) => {
    const updatedDevices = (floor.devices || []).map(d =>
      d.id === deviceId 
        ? { 
            ...d, 
            x: Math.max(10, Math.min(x, (canvasSize.width / scale) - 50)),
            y: Math.max(10, Math.min(y, (canvasSize.height / scale) - 50))
          }
        : d
    );
    updateFloorPlan(floor.id, { devices: updatedDevices });
    
    // Find which room the device is now in
    if (floorStructure) {
      const deviceRoom = floorStructure.rooms.find(room => {
        const bounds = room.bounds;
        return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
      });
      
      console.log('Device moved:', {
        deviceId,
        newPosition: { x, y },
        newRoom: deviceRoom?.name || 'Outside rooms',
        roomType: deviceRoom?.type || 'none'
      });
    }
  };

  const handleRotateDevice = (deviceId: string) => {
    const updatedDevices = (floor.devices || []).map(d =>
      d.id === deviceId 
        ? { ...d, rotation: ((d.rotation || 0) + 90) % 360 }
        : d
    );
    updateFloorPlan(floor.id, { devices: updatedDevices });
  };

  const handleResizeDevice = (deviceId: string, newScale: number) => {
    const updatedDevices = (floor.devices || []).map(d =>
      d.id === deviceId 
        ? { ...d, scale: newScale }
        : d
    );
    updateFloorPlan(floor.id, { devices: updatedDevices });
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isDeviceElement = target.closest('[data-device-id]') || 
                           target.closest('[data-device-control]') ||
                           target.classList.contains('device-container');
    
    if (!isDeviceElement) {
      setSelectedDeviceId('');
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const updateCanvasSize = () => {
        const rect = canvasRef.current!.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }
  }, []);

  drop(canvasRef);

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          title={t('floorPlan.zoomIn')}
        >
          <FaSearchPlus className="text-gray-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          title={t('floorPlan.zoomOut')}
        >
          <FaSearchMinus className="text-gray-600" />
        </button>
        <div className="px-3 py-2 bg-white rounded-lg shadow-md text-sm text-gray-600 border border-gray-200">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Floor Structure Summary */}
      {floorStructure && (
        <div className="absolute bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 max-w-64">
          <div className="flex items-center gap-2 mb-2">
            <FaHome className="text-accent-500" />
            <span className="text-sm font-medium text-gray-800">Floor Structure</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Rooms: {floorStructure.rooms.length}</div>
            <div>Walls: {floorStructure.walls.length}</div>
            <div>Doors: {floorStructure.doors.length}</div>
            <div>Windows: {floorStructure.windows.length}</div>
            <div>Devices: {(floor.devices || []).length}</div>
          </div>
          {hoveredRoom && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs font-medium text-purple-600">
                Hovering: {hoveredRoom.name}
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(hoveredRoom.area)} sq ft
              </div>
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`
          relative w-full h-96 lg:h-[500px] border-2 border-dashed rounded-xl overflow-hidden
          ${isOver ? 'border-accent-500 bg-accent-50/50' : 'border-gray-300'}
          ${cadData ? 'bg-white' : 'bg-gray-50'}
          transition-all duration-200 cursor-crosshair
        `}
        style={{
          backgroundImage: cadData ? 'none' : `
            radial-gradient(circle, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: cadData ? 'auto' : `${20 * scale}px ${20 * scale}px`,
          backgroundPosition: '0 0'
        }}
      >
        {/* Floor Plan Background with Room Detection */}
        <EnhancedFloorPlanViewer
          floor={floor} 
          scale={scale} 
          onCADParsed={handleCADParsed}
          onRoomHover={handleRoomHover}
        />

        {/* Drop Overlay */}
        {isOver && (
          <div className="absolute inset-0 bg-accent-500/10 flex items-center justify-center z-40 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-accent-500 border-dashed">
              <div className="text-accent-700 text-lg font-medium text-center">
                {hoveredRoom 
                  ? `Place device in ${hoveredRoom.name}`
                  : t('floorPlan.dropDeviceHere')
                }
              </div>
            </div>
          </div>
        )}

        {/* Placed Devices */}
        {(floor.devices || []).map(placedDevice => (
          <PlacedDeviceComponent
            key={placedDevice.id}
            placedDevice={placedDevice}
            onRemove={handleRemoveDevice}
            onMove={handleMoveDevice}
            onRotate={handleRotateDevice}
            onResize={handleResizeDevice}
            onSelect={handleSelectDevice}
            isSelected={selectedDeviceId === placedDevice.id}
            scale={scale}
          />
        ))}
      </div>

      {/* Canvas Statistics */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>{t('floorPlan.devicesPlaced')}: <strong>{(floor.devices || []).length}</strong></span>
          {floor.dwgFile && (
            <span>File: <strong>{floor.dwgFile.name}</strong></span>
          )}
          {floorStructure && (
            <span>Rooms: <strong>{floorStructure.rooms.length}</strong></span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>{t('floorPlan.scale')}: <strong>{Math.round(scale * 100)}%</strong></span>
          <span>Canvas: <strong>{canvasSize.width} × {canvasSize.height}px</strong></span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFloorPlanCanvas;