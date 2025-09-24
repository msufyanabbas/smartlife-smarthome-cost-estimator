import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import Image from 'next/image';
import { Device } from '@/types';

interface DraggableDeviceProps {
  device: Device;
}

const DraggableDevice: React.FC<DraggableDeviceProps> = ({ device }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'device',
    item: { device },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Connect drag source to ref
  drag(ref);

  return (
    <div
      ref={ref}
      className={`p-4 border rounded-2xl shadow-md bg-white transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="w-full h-40 relative mb-3">
        <Image
          src={device.image}
          alt={device.name}
          fill
          className="object-contain rounded-lg"
        />
      </div>

      <h3 className="text-lg text-black font-semibold mb-1">{device.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{device.description}</p>
      <p className="text-base font-bold text-green-600">
        SAR {device.price.toLocaleString()}
      </p>
    </div>
  );
};

export default DraggableDevice;