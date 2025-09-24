import { useLanguage } from "@/contexts/LanguageContext";
import { getDeviceById } from "@/data/devices";
import { Device, PlacedDeviceComponentProps } from "@/types";
import Image from "next/image";
import { useState } from "react";
import { FaCompressArrowsAlt, FaExpandArrowsAlt, FaRedo, FaTrash } from "react-icons/fa";

const PlacedDeviceComponent: React.FC<PlacedDeviceComponentProps> = ({
  placedDevice,
  onRemove,
  onMove,
  onRotate,
  onResize,
  scale,
  isSelected,
  onSelect
}) => {
  const device = getDeviceById(placedDevice.deviceId);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useLanguage();

  if (!device) return null;

  const deviceWidth = (device.dimensions?.width || 40) * scale * (placedDevice.scale || 1);
  const deviceHeight = (device.dimensions?.height || 40) * scale * (placedDevice.scale || 1);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      
      let hasMoved = false;
      const startX = e.clientX;
      const startY = e.clientY;
      const startDeviceX = placedDevice.x;
      const startDeviceY = placedDevice.y;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        if (!hasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
          hasMoved = true;
          setIsDragging(true);
        }
        
        if (hasMoved) {
          const scaledDeltaX = deltaX / scale;
          const scaledDeltaY = deltaY / scale;
          onMove(placedDevice.id, startDeviceX + scaledDeltaX, startDeviceY + scaledDeltaY);
        }
      };

      const handleMouseUp = () => {
        if (!hasMoved) {
          onSelect(placedDevice.id);
        }
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleDeviceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(placedDevice.id);
  };

  const handleResizeClick = (e: React.MouseEvent, type: 'increase' | 'decrease') => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentScale = placedDevice.scale || 1;
    const scaleChange = 0.2;
    
    if (type === 'increase') {
      const newScale = Math.min(currentScale + scaleChange, 3);
      onResize(placedDevice.id, newScale);
    } else {
      const newScale = Math.max(currentScale - scaleChange, 0.3);
      onResize(placedDevice.id, newScale);
    }
  };

  // Get device category icon for visual identification
  const getDeviceIcon = (device: Device) => {
    switch (device.category) {
      case 'security':
        return '🛡️';
      case 'lighting':
        return '💡';
      case 'climate':
        return '🌡️';
      case 'entertainment':
        return '📺';
      case 'kitchen':
        return '🍽️';
      case 'bathroom':
        return '🚿';
      case 'outdoor':
        return '🌳';
      default:
        return '📱';
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
        width: deviceWidth,
        height: deviceHeight,
        transform: `rotate(${placedDevice.rotation || 0}deg)`,
        transformOrigin: 'center'
      }}
      onMouseDown={handleMouseDown}
      data-device-id={placedDevice.id}
    >
      <div
        className={`
          relative w-full h-full rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white shadow-md
          ${isSelected ? 'border-accent-500 shadow-lg ring-2 ring-accent-200' : 'border-gray-300 hover:border-accent-400'}
          ${isDragging ? 'opacity-75' : ''}
        `}
        onClick={handleDeviceClick}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-1">
          {device.image ? (
            <Image
              src={device.image}
              alt={device.name}
              width={Math.round(24 * (placedDevice.scale || 1))}
              height={Math.round(24 * (placedDevice.scale || 1))}
              className="object-cover"
            />
          ) : (
            <div className="text-lg">{getDeviceIcon(device)}</div>
          )}
          <span className="text-xs font-medium text-gray-700 text-center leading-tight mt-1">
            {device.name.split(' ').slice(0, 2).join(' ')}
          </span>
        </div>
        
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Device Controls */}
      {isSelected && (
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
          style={{ 
            top: `${-48 * (placedDevice.scale || 1)}px`
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          data-device-control="true"
        >
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleResizeClick(e, 'decrease');
            }}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title={t('floorPlan.shrink') || 'Shrink'}
          >
            <FaCompressArrowsAlt className="text-sm" />
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleResizeClick(e, 'increase');
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
            title={t('floorPlan.enlarge') || 'Enlarge'}
          >
            <FaExpandArrowsAlt className="text-sm" />
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRotate(placedDevice.id);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={t('floorPlan.rotate')}
          >
            <FaRedo className="text-sm" />
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(placedDevice.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title={t('floorPlan.remove')}
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PlacedDeviceComponent;