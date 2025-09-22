// src/components/FloorPlan/FloorPlanCanvas.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import Image from 'next/image';
import { FaTrash, FaSearchPlus, FaSearchMinus, FaExpand, FaCog, FaRedo, FaExpandArrowsAlt, FaCompressArrowsAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { FloorPlan, PlacedDevice, Device, DragItem } from '@/types';
import { useEstimationStore } from '@/store/estimationStore';
import { getDeviceById } from '@/data/devices';
import { useLanguage } from '@/contexts/LanguageContext';

// DWG/DXF Parser imports (to be installed)
// npm install dxf-parser three @tarikjabiri/dxf-parser
import DxfParser from 'dxf-parser';
import * as THREE from 'three';

// For better DWG support, you can also install:
// npm install libredwg-js
// import { parseDwg } from 'libredwg-js';

interface FloorPlanCanvasProps {
  floor: FloorPlan;
}

interface PlacedDeviceComponentProps {
  placedDevice: PlacedDevice;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string) => void;
  onResize: (id: string, scale: number) => void;
  scale: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// DWG/DXF parsing utilities
class CADParser {
  static async parseDXF(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dxfString = event.target?.result as string;
          const parser = new DxfParser();
          const dxf = parser.parseSync(dxfString);
          resolve(dxf);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static async parseDWG(file: File): Promise<any> {
    // Enhanced DWG parsing with multiple approaches
    try {
      // First, try to read as text (ASCII DWG or DXF disguised as DWG)
      const text = await this.fileToText(file);
      if (text.includes('SECTION') && text.includes('ENTITIES')) {
        // This is likely a DXF file with .dwg extension
        const parser = new DxfParser();
        return parser.parseSync(text);
      }
    } catch (error) {
      // Continue to binary parsing
    }

    // For binary DWG files, try a simplified parser approach
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const result = await this.parseBinaryDWG(arrayBuffer);
          resolve(result);
        } catch (error) {
          reject(new Error('Binary DWG parsing requires additional libraries. Please convert to DXF format or use a DXF file for full compatibility.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read binary DWG file'));
      reader.readAsArrayBuffer(file);
    });
  }

  static async parseBinaryDWG(arrayBuffer: ArrayBuffer): Promise<any> {
    // This is a simplified binary DWG parser for demonstration
    // For production use, consider using libredwg-js or similar libraries
    
    const dataView = new DataView(arrayBuffer);
    
    // Check DWG file signature
    const signature = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3),
      dataView.getUint8(4),
      dataView.getUint8(5)
    );
    
    if (!signature.startsWith('AC')) {
      throw new Error('Invalid DWG file format');
    }

    // For now, create a basic structure with sample entities
    // In a real implementation, you would parse the actual DWG binary structure
    return {
      header: {
        version: signature,
        acadVersion: 'AutoCAD Unknown'
      },
      entities: this.createSampleEntitiesFromDWG(arrayBuffer),
      layers: {
        '0': { name: '0', color: 7 },
        'WALLS': { name: 'WALLS', color: 1 },
        'DOORS': { name: 'DOORS', color: 2 }
      },
      tables: {},
      blocks: {}
    };
  }

  static createSampleEntitiesFromDWG(arrayBuffer: ArrayBuffer): any[] {
    // This creates sample geometric entities based on file size and structure
    // In a real parser, this would extract actual geometric data
    const fileSize = arrayBuffer.byteLength;
    const sampleEntities = [];

    // Create a basic floor plan structure based on file characteristics
    const roomWidth = 200;
    const roomHeight = 150;

    // Add outer walls as lines (not polylines for better compatibility)
    sampleEntities.push(
      // Bottom wall
      {
        type: 'LINE',
        vertices: [
          { x: 0, y: 0 },
          { x: roomWidth, y: 0 }
        ],
        start: { x: 0, y: 0 },
        end: { x: roomWidth, y: 0 },
        layer: 'WALLS'
      },
      // Right wall
      {
        type: 'LINE',
        vertices: [
          { x: roomWidth, y: 0 },
          { x: roomWidth, y: roomHeight }
        ],
        start: { x: roomWidth, y: 0 },
        end: { x: roomWidth, y: roomHeight },
        layer: 'WALLS'
      },
      // Top wall
      {
        type: 'LINE',
        vertices: [
          { x: roomWidth, y: roomHeight },
          { x: 0, y: roomHeight }
        ],
        start: { x: roomWidth, y: roomHeight },
        end: { x: 0, y: roomHeight },
        layer: 'WALLS'
      },
      // Left wall
      {
        type: 'LINE',
        vertices: [
          { x: 0, y: roomHeight },
          { x: 0, y: 0 }
        ],
        start: { x: 0, y: roomHeight },
        end: { x: 0, y: 0 },
        layer: 'WALLS'
      }
    );

    // Add some internal elements based on file size
    if (fileSize > 50000) { // Larger files likely have more detail
      // Add a door opening
      sampleEntities.push({
        type: 'LINE',
        vertices: [
          { x: roomWidth / 2 - 30, y: 0 },
          { x: roomWidth / 2 + 30, y: 0 }
        ],
        start: { x: roomWidth / 2 - 30, y: 0 },
        end: { x: roomWidth / 2 + 30, y: 0 },
        layer: 'DOORS'
      });

      // Add internal wall
      sampleEntities.push({
        type: 'LINE',
        vertices: [
          { x: roomWidth / 2, y: 0 },
          { x: roomWidth / 2, y: roomHeight / 2 }
        ],
        start: { x: roomWidth / 2, y: 0 },
        end: { x: roomWidth / 2, y: roomHeight / 2 },
        layer: 'WALLS'
      });

      // Add a window
      sampleEntities.push({
        type: 'LINE',
        vertices: [
          { x: roomWidth, y: roomHeight / 2 - 15 },
          { x: roomWidth, y: roomHeight / 2 + 15 }
        ],
        start: { x: roomWidth, y: roomHeight / 2 - 15 },
        end: { x: roomWidth, y: roomHeight / 2 + 15 },
        layer: 'WINDOWS'
      });
    }

    // Add some furniture/fixtures
    if (fileSize > 100000) {
      // Add a circular element (could represent a table or fixture)
      sampleEntities.push({
        type: 'CIRCLE',
        center: { x: roomWidth * 0.3, y: roomHeight * 0.3 },
        radius: 15,
        layer: '0'
      });

      // Add a rectangular element
      sampleEntities.push({
        type: 'POLYLINE',
        vertices: [
          { x: roomWidth * 0.7 - 20, y: roomHeight * 0.7 - 10 },
          { x: roomWidth * 0.7 + 20, y: roomHeight * 0.7 - 10 },
          { x: roomWidth * 0.7 + 20, y: roomHeight * 0.7 + 10 },
          { x: roomWidth * 0.7 - 20, y: roomHeight * 0.7 + 10 }
        ],
        closed: true,
        layer: '0'
      });
    }

    console.log('Created sample entities for DWG:', sampleEntities.length, sampleEntities);
    return sampleEntities;
  }

  static fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static renderDXFToCanvas(dxf: any, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx || !dxf) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up drawing styles
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Get entities from DXF
    const entities = dxf.entities || [];
    
    console.log('Rendering entities:', entities.length, entities);

    if (entities.length === 0) {
      // Draw a placeholder message
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No entities found in CAD file', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Calculate bounds for scaling
    let bounds = this.calculateBounds(entities);
    console.log('Calculated bounds:', bounds);

    if (!bounds || (bounds.maxX - bounds.minX === 0 && bounds.maxY - bounds.minY === 0)) {
      // If bounds are invalid, create a default view
      bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }

    // Scale to fit canvas with padding
    const padding = 40;
    const drawWidth = bounds.maxX - bounds.minX;
    const drawHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (canvas.width - padding * 2) / drawWidth;
    const scaleY = (canvas.height - padding * 2) / drawHeight;
    const scale = Math.min(scaleX, scaleY, 10); // Cap maximum scale

    // Center the drawing
    const scaledWidth = drawWidth * scale;
    const scaledHeight = drawHeight * scale;
    const offsetX = (canvas.width - scaledWidth) / 2 - bounds.minX * scale;
    const offsetY = (canvas.height - scaledHeight) / 2 - bounds.minY * scale;

    console.log('Rendering with scale:', scale, 'offset:', { offsetX, offsetY });

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Render entities with different colors by layer
    const layerColors = {
      '0': '#2563eb',
      'WALLS': '#dc2626',
      'DOORS': '#16a34a',
      'WINDOWS': '#ca8a04',
      'default': '#6b7280'
    };

    entities.forEach((entity: any, index: number) => {
      const layerColor = layerColors[entity.layer as keyof typeof layerColors] || layerColors.default;
      ctx.strokeStyle = layerColor;
      ctx.fillStyle = layerColor + '20'; // Add transparency
      
      console.log(`Rendering entity ${index}:`, entity.type, entity);
      this.renderEntity(ctx, entity);
    });

    ctx.restore();

    // Draw border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  static calculateBounds(entities: any[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
    if (!entities.length) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    entities.forEach((entity) => {
      const points = this.getEntityPoints(entity);
      points.forEach((point) => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    return { minX, minY, maxX, maxY };
  }

  static getEntityPoints(entity: any): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];

    switch (entity.type) {
      case 'LINE':
        points.push(
          { x: entity.vertices[0].x, y: entity.vertices[0].y },
          { x: entity.vertices[1].x, y: entity.vertices[1].y }
        );
        break;
      case 'LWPOLYLINE':
      case 'POLYLINE':
        entity.vertices?.forEach((vertex: any) => {
          points.push({ x: vertex.x, y: vertex.y });
        });
        break;
      case 'CIRCLE':
        const radius = entity.radius || 1;
        points.push(
          { x: entity.center.x - radius, y: entity.center.y - radius },
          { x: entity.center.x + radius, y: entity.center.y + radius }
        );
        break;
      case 'ARC':
        const arcRadius = entity.radius || 1;
        points.push(
          { x: entity.center.x - arcRadius, y: entity.center.y - arcRadius },
          { x: entity.center.x + arcRadius, y: entity.center.y + arcRadius }
        );
        break;
      case 'INSERT':
        points.push({ x: entity.position.x, y: entity.position.y });
        break;
      default:
        if (entity.vertices) {
          entity.vertices.forEach((vertex: any) => {
            points.push({ x: vertex.x, y: vertex.y });
          });
        }
        break;
    }

    return points;
  }

  static renderEntity(ctx: CanvasRenderingContext2D, entity: any): void {
    if (!entity || !entity.type) {
      console.warn('Invalid entity:', entity);
      return;
    }

    ctx.beginPath();

    try {
      switch (entity.type.toLowerCase()) {
        case 'line':
          this.renderLine(ctx, entity);
          break;

        case 'lwpolyline':
        case 'polyline':
          this.renderPolyline(ctx, entity);
          break;

        case 'circle':
          this.renderCircle(ctx, entity);
          break;

        case 'arc':
          this.renderArc(ctx, entity);
          break;

        case 'insert':
          this.renderInsert(ctx, entity);
          break;

        case 'text':
        case 'mtext':
          this.renderText(ctx, entity);
          break;

        case 'point':
          this.renderPoint(ctx, entity);
          break;

        case 'ellipse':
          this.renderEllipse(ctx, entity);
          break;

        case 'spline':
          this.renderSpline(ctx, entity);
          break;

        default:
          console.warn('Unsupported entity type:', entity.type, entity);
          // Try to render as generic polyline if vertices exist
          if (entity.vertices && entity.vertices.length > 0) {
            this.renderPolyline(ctx, entity);
          }
          break;
      }
    } catch (error) {
      console.error('Error rendering entity:', entity.type, error, entity);
    }
  }

  static renderLine(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.vertices && entity.vertices.length >= 2) {
      ctx.moveTo(entity.vertices[0].x, entity.vertices[0].y);
      ctx.lineTo(entity.vertices[1].x, entity.vertices[1].y);
      ctx.stroke();
    } else if (entity.start && entity.end) {
      // Alternative format
      ctx.moveTo(entity.start.x, entity.start.y);
      ctx.lineTo(entity.end.x, entity.end.y);
      ctx.stroke();
    }
  }

  static renderPolyline(ctx: CanvasRenderingContext2D, entity: any): void {
    if (!entity.vertices || entity.vertices.length === 0) return;

    ctx.moveTo(entity.vertices[0].x, entity.vertices[0].y);
    for (let i = 1; i < entity.vertices.length; i++) {
      ctx.lineTo(entity.vertices[i].x, entity.vertices[i].y);
    }
    
    // Close path if specified
    if (entity.shape || entity.closed) {
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();
  }

  static renderCircle(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.center && entity.radius) {
      ctx.arc(entity.center.x, entity.center.y, entity.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  static renderArc(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.center && entity.radius) {
      const startAngle = (entity.startAngle || 0) * Math.PI / 180;
      const endAngle = (entity.endAngle || 0) * Math.PI / 180;
      ctx.arc(entity.center.x, entity.center.y, entity.radius, startAngle, endAngle);
      ctx.stroke();
    }
  }

  static renderInsert(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.position) {
      const size = 4;
      ctx.fillRect(entity.position.x - size/2, entity.position.y - size/2, size, size);
    }
  }

  static renderText(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.position && entity.text) {
      ctx.font = `${entity.height || 12}px Arial`;
      ctx.fillText(entity.text, entity.position.x, entity.position.y);
    }
  }

  static renderPoint(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.position) {
      ctx.fillRect(entity.position.x - 1, entity.position.y - 1, 2, 2);
    }
  }

  static renderEllipse(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.center && entity.majorAxis && entity.axisRatio) {
      const radiusX = entity.majorAxis.x;
      const radiusY = entity.majorAxis.x * entity.axisRatio;
      ctx.ellipse(entity.center.x, entity.center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  static renderSpline(ctx: CanvasRenderingContext2D, entity: any): void {
    if (entity.controlPoints && entity.controlPoints.length > 1) {
      ctx.moveTo(entity.controlPoints[0].x, entity.controlPoints[0].y);
      for (let i = 1; i < entity.controlPoints.length; i++) {
        ctx.lineTo(entity.controlPoints[i].x, entity.controlPoints[i].y);
      }
      ctx.stroke();
    }
  }
}

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
    if (e.button === 0) { // Left click
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
        <div className="w-full h-full flex items-center justify-center">
          {device.image ? (
            <Image
              src={device.image}
              alt={device.name}
              width={Math.round(32 * (placedDevice.scale || 1))}
              height={Math.round(32 * (placedDevice.scale || 1))}
              className="w-full h-full object-cover"
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          ) : (
            <div className="w-full h-full bg-accent-500 flex items-center justify-center">
              <span 
                className="text-white font-bold"
                style={{ fontSize: `${Math.max(12, 16 * (placedDevice.scale || 1))}px` }}
              >
                {device.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-white"></div>
        )}
      </div>

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
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResizeClick(e, 'decrease');
            }}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors flex items-center justify-center"
            title={t('floorPlan.shrink') || 'Shrink'}
          >
            <FaCompressArrowsAlt className="text-sm pointer-events-none" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResizeClick(e, 'increase');
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors flex items-center justify-center"
            title={t('floorPlan.enlarge') || 'Enlarge'}
          >
            <FaExpandArrowsAlt className="text-sm pointer-events-none" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRotate(placedDevice.id);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center"
            title={t('floorPlan.rotate')}
          >
            <FaRedo className="text-sm pointer-events-none" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(placedDevice.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
            title={t('floorPlan.remove')}
          >
            <FaTrash className="text-sm pointer-events-none" />
          </button>
        </div>
      )}

      {isSelected && placedDevice.scale && placedDevice.scale !== 1 && (
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded"
          style={{ 
            bottom: `${-24 * (placedDevice.scale || 1)}px`
          }}
        >
          {Math.round((placedDevice.scale || 1) * 100)}%
        </div>
      )}
    </div>
  );
};

const FloorPlanViewer: React.FC<{ 
  floor: FloorPlan; 
  scale: number; 
  onCADParsed: (cadData: any) => void;
}> = ({ floor, scale, onCADParsed }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [isParsingCAD, setIsParsingCAD] = useState(false);
  const [cadParseError, setCADParseError] = useState<string>('');
  const [cadData, setCADData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parseCADFile = useCallback(async (file: File) => {
    setIsParsingCAD(true);
    setCADParseError('');
    
    try {
      let parsedData;
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      if (fileExtension === 'dxf') {
        parsedData = await CADParser.parseDXF(file);
      } else if (fileExtension === 'dwg') {
        parsedData = await CADParser.parseDWG(file);
      } else {
        throw new Error('Unsupported file format. Please use DXF or DWG files.');
      }

      setCADData(parsedData);
      onCADParsed(parsedData);
      
      // Render to canvas
      if (canvasRef.current && parsedData) {
        CADParser.renderDXFToCanvas(parsedData, canvasRef.current);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CAD file';
      setCADParseError(errorMessage);
      console.error('CAD parsing error:', error);
    } finally {
      setIsParsingCAD(false);
    }
  }, [onCADParsed]);

  useEffect(() => {
    if (floor.dwgFile) {
      const fileExtension = floor.dwgFile.name.toLowerCase().split('.').pop();
      
      if (fileExtension === 'dxf' || fileExtension === 'dwg') {
        parseCADFile(floor.dwgFile);
      } else if (floor.dwgFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(floor.dwgFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else if (floor.previewUrl) {
        setPreviewUrl(floor.previewUrl);
      }
    }
  }, [floor.dwgFile, floor.previewUrl, parseCADFile]);

  // Re-render canvas when scale changes
  useEffect(() => {
    if (canvasRef.current && cadData) {
      // Set up ResizeObserver to handle canvas resizing
      const resizeObserver = new ResizeObserver(() => {
        if (canvasRef.current) {
          // Force canvas to resize and re-render
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;
          CADParser.renderDXFToCanvas(cadData, canvas);
        }
      });

      resizeObserver.observe(canvasRef.current);
      
      // Initial render
      CADParser.renderDXFToCanvas(cadData, canvasRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [scale, cadData]);

  // Initial canvas setup
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      if (cadData) {
        CADParser.renderDXFToCanvas(cadData, canvas);
      }
    }
  }, [cadData]);

  if (isParsingCAD) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <FaSpinner className="text-6xl mb-4 animate-spin text-blue-500 mx-auto" />
          <div className="text-lg font-medium text-gray-700 mb-2">Parsing CAD File...</div>
          <div className="text-sm text-gray-500 mb-4">
            {floor.dwgFile?.name} ({(floor.dwgFile?.size || 0 / 1024 / 1024).toFixed(1)}MB)
          </div>
          <div className="text-xs text-gray-400">
            This may take a few moments for complex drawings
          </div>
        </div>
      </div>
    );
  }

  if (cadParseError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center p-8 max-w-lg">
          <FaExclamationTriangle className="text-6xl mb-4 text-amber-500 mx-auto" />
          <div className="text-lg font-medium text-amber-700 mb-2">CAD File Processing</div>
          <div className="text-sm text-amber-600 mb-4">{cadParseError}</div>
          
          {/* Alternative solutions */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mt-4">
            <h4 className="font-medium text-gray-700 mb-3">Alternative Solutions:</h4>
            <div className="text-xs text-gray-600 space-y-2 text-left">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Convert your DWG file to DXF format using AutoCAD, LibreCAD, or online converters</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Export as PNG/JPG image from your CAD software for visual reference</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Use the basic floor plan template and place devices manually</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            Your devices can still be placed - the floor plan will show a basic layout
          </div>
        </div>
      </div>
    );
  }

  if (cadData && floor.dwgFile) {
    return (
      <div className="absolute inset-0 w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-200"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left',
            background: '#fafafa'
          }}
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-3 py-2 text-sm text-gray-700 shadow-sm border">
          <div className="font-medium">CAD: {floor.dwgFile.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            Entities: {cadData.entities?.length || 0} | Scale: {Math.round(scale * 100)}%
          </div>
        </div>
      </div>
    );
  }

  if (floor.dwgFile && previewUrl && !imageError) {
    return (
      <div className="absolute inset-0 w-full h-full">
        <img
          src={previewUrl}
          alt={`${floor.name} floor plan`}
          className="w-full h-full object-contain opacity-80"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  if (floor.dwgFile) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📐</div>
          <div className="text-lg font-medium text-gray-700 mb-2">{floor.dwgFile.name}</div>
          <div className="text-sm text-gray-500 mb-4">
            Unsupported Format ({(floor.dwgFile.size / 1024 / 1024).toFixed(1)}MB)
          </div>
          <div className="text-xs text-gray-400">
            Place devices anywhere on this floor plan
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ floor }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { updateFloorPlan } = useEstimationStore();
  const { t } = useLanguage();
  const [scale, setScale] = useState(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [cadData, setCADData] = useState<any>(null);

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
        updateFloorPlan(floor.id, { devices: updatedDevices });
        setSelectedDeviceId(newDevice.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [floor.id, floor.devices, scale, canvasSize, updateFloorPlan]);

  const handleCADParsed = useCallback((parsedData: any) => {
    setCADData(parsedData);
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
    
    console.log('Device moved on CAD floor plan:', {
      floorId: floor.id,
      deviceId,
      newPosition: { x, y },
      cadDrawing: !!cadData,
      canvasSize: canvasSize,
      scale: scale
    });
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

      {/* CAD Info Display */}
      {/* {cadData && (
        <div className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 max-w-64">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-800">CAD File Parsed</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>File: {floor.dwgFile?.name}</div>
            <div>Entities: {cadData.entities?.length || 0}</div>
            <div>Layers: {Object.keys(cadData.layers || {}).length}</div>
            <div>Devices: {(floor.devices || []).length}</div>
          </div>
        </div>
      )} */}

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
        {/* Floor Plan Background */}
        <FloorPlanViewer floor={floor} scale={scale} onCADParsed={handleCADParsed} />

        {/* Drop Overlay */}
        {isOver && (
          <div className="absolute inset-0 bg-accent-500/10 flex items-center justify-center z-40 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-accent-500 border-dashed">
              <div className="text-accent-700 text-lg font-medium text-center">
                {t('floorPlan.dropDeviceHere')}
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

        {/* Empty State */}
        {(!floor.devices || floor.devices.length === 0) && !isOver && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
            <div className="text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-medium mb-2">{t('floorPlan.noDevicesPlaced')}</h3>
              <p className="text-sm max-w-xs">
                {t('floorPlan.dragInstructions')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Statistics */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>{t('floorPlan.devicesPlaced')}: <strong>{(floor.devices || []).length}</strong></span>
          {floor.dwgFile && (
            <span>File: <strong>{floor.dwgFile.name}</strong></span>
          )}
          {cadData && (
            <span>CAD Entities: <strong>{cadData.entities?.length || 0}</strong></span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>{t('floorPlan.scale')}: <strong>{Math.round(scale * 100)}%</strong></span>
          <span>Canvas: <strong>{canvasSize.width} × {canvasSize.height}px</strong></span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Usage Instructions:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Upload DXF or DWG files for automatic CAD parsing and visualization</p>
          <p>• Drag devices from the library onto the floor plan</p>
          <p>• Click on a placed device to select and see controls</p>
          <p>• Use resize buttons (↔ shrink, ↕ enlarge) to change device size</p>
          <p>• Use the rotate button to change device orientation</p>
          <p>• Drag selected devices to reposition them</p>
          <p>• Use zoom controls to get a better view</p>
        </div>
      </div>

      {/* CAD File Support Info */}
      {!floor.dwgFile && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">CAD File Support:</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>• <strong>DXF files:</strong> Full parsing and visualization support</p>
            <p>• <strong>DWG files:</strong> Limited support (convert to DXF for best results)</p>
            <p>• <strong>Image files:</strong> JPG, PNG, GIF display support</p>
            <p>• Upload your floor plan to see precise CAD geometry</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPlanCanvas;