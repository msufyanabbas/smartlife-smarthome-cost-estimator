// src/components/FloorPlan/FloorPlanCanvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import Image from 'next/image';
import { FaTrash, FaQuoteRight, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { FloorPlan, PlacedDevice, Device, DragItem } from '@/types';
import { useEstimationStore } from '@/store/estimationStore';
import { getDeviceById } from '@/data/devices';

interface FloorPlanCanvasProps {
  floor: FloorPlan;
}

interface PlacedDeviceComponentProps {
  placedDevice: PlacedDevice;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string) => void;
  scale: number;
}

const PlacedDeviceComponent: React.FC<PlacedDeviceComponentProps> = ({
  placedDevice,
  onRemove,
  onMove,
  onRotate,
  scale
}) => {
  const device = getDeviceById(placedDevice.deviceId);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  if (!device) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setIsSelected(true);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startDeviceX = placedDevice.x;
      const startDeviceY = placedDevice.y;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = (e.clientX - startX) / scale;
        const deltaY = (e.clientY - startY) / scale;
        onMove(placedDevice.id, startDeviceX + deltaX, startDeviceY + deltaY);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  return (
    <div
      className={`absolute cursor-move transition-all duration-200 ${
        isDragging ? 'z-50 scale-110' : isSelected ? 'z-40' : 'z-30'
      }`}
      style={{
        left: placedDevice.x * scale,
        top: placedDevice.y * scale,
        width: device.dimensions.width * scale * placedDevice.scale,
        height: device.dimensions.height * scale * placedDevice.scale,
        transform: `rotate(${placedDevice.rotation}deg)`
      }}
      onMouseDown={handleMouseDown}
      onClick={() => setIsSelected(!isSelected)}
    >
      {/* Device Image */}
      <div className={`
        relative w-full h-full rounded-lg overflow-hidden border-2 transition-all duration-200
        ${isSelected ? 'border-accent-500 shadow-lg' : 'border-gray-300 hover:border-accent-300'}
        ${isDragging ? 'opacity-75' : ''}
      `}>
        <Image
          src={device.image}
          alt={device.name}
          fill
          className="object-cover"
        />
        
        {/* Device Label */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
          {device.name}
        </div>
      </div>

      {/* Controls (when selected) */}
      {isSelected && (
        <div className="absolute -top-8 left-0 flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotate(placedDevice.id);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Rotate"
          >
            <FaQuoteRight className="text-xs" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(placedDevice.id);
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Remove"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
};

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ floor }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { updateFloorPlan } = useEstimationStore();
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'device',
    drop: (item: DragItem, monitor) => {
      if (!canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      
      if (offset) {
        const x = (offset.x - canvasRect.left) / scale;
        const y = (offset.y - canvasRect.top) / scale;
        
        const newDevice: PlacedDevice = {
          deviceId: item.device.id,
          id: `placed-${Date.now()}-${Math.random()}`,
          x: Math.max(0, Math.min(x - item.device.dimensions.width / 2, canvasSize.width - item.device.dimensions.width)),
          y: Math.max(0, Math.min(y - item.device.dimensions.height / 2, canvasSize.height - item.device.dimensions.height)),
          rotation: 0,
          scale: 1
        };

        const updatedDevices = [...floor.devices, newDevice];
        updateFloorPlan(floor.id, { devices: updatedDevices });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleRemoveDevice = (deviceId: string) => {
    const updatedDevices = floor.devices.filter(d => d.id !== deviceId);
    updateFloorPlan(floor.id, { devices: updatedDevices });
  };

  const handleMoveDevice = (deviceId: string, x: number, y: number) => {
    const updatedDevices = floor.devices.map(d =>
      d.id === deviceId 
        ? { 
            ...d, 
            x: Math.max(0, Math.min(x, canvasSize.width - 50)),
            y: Math.max(0, Math.min(y, canvasSize.height - 50))
          }
        : d
    );
    updateFloorPlan(floor.id, { devices: updatedDevices });
  };

  const handleRotateDevice = (deviceId: string) => {
    const updatedDevices = floor.devices.map(d =>
      d.id === deviceId 
        ? { ...d, rotation: (d.rotation + 90) % 360 }
        : d
    );
    updateFloorPlan(floor.id, { devices: updatedDevices });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    }
  }, []);

  drop(canvasRef);

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          title="Zoom In"
        >
          <FaSearchPlus className="text-gray-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          title="Zoom Out"
        >
          <FaSearchMinus className="text-gray-600" />
        </button>
        <div className="px-3 py-2 bg-white rounded-lg shadow-md text-sm text-gray-600">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`
          relative w-full h-96 lg:h-[500px] bg-gray-50 border-2 border-dashed rounded-xl overflow-hidden
          ${isOver ? 'border-accent-500 bg-accent-50' : 'border-gray-300'}
          transition-all duration-200
        `}
        style={{
          backgroundImage: `
            radial-gradient(circle, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
        }}
      >
        {/* Floor Plan Background */}
        {floor.dwgFile && (
          <div className="absolute inset-0">
            {/* This would be the DWG file rendered as an image or canvas */}
            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600">
              <div className="text-center">
                <div className="text-2xl mb-2">📐</div>
                <div className="text-sm">{floor.dwgFile.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  DWG Floor Plan ({(floor.dwgFile.size / 1024 / 1024).toFixed(1)}MB)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drop Overlay */}
        {isOver && (
          <div className="absolute inset-0 bg-accent-500/20 flex items-center justify-center z-40">
            <div className="text-accent-700 text-lg font-medium">
              Drop device here
            </div>
          </div>
        )}

        {/* Placed Devices */}
        {floor.devices.map(placedDevice => (
          <PlacedDeviceComponent
            key={placedDevice.id}
            placedDevice={placedDevice}
            onRemove={handleRemoveDevice}
            onMove={handleMoveDevice}
            onRotate={handleRotateDevice}
            scale={scale}
          />
        ))}

        {/* Empty State */}
        {floor.devices.length === 0 && !isOver && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-medium mb-2">No Devices Placed</h3>
              <p className="text-sm">
                Drag devices from the left panel to place them on your floor plan
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Info */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Devices Placed: {floor.devices.length}
        </div>
        <div className="flex items-center gap-4">
          <div>Scale: {Math.round(scale * 100)}%</div>
          <div>Canvas: {canvasSize.width} × {canvasSize.height}px</div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanCanvas;