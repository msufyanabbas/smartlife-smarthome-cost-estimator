import { useCallback, useEffect, useRef, useState } from "react";
import { EnhancedCADParser } from "../CADParser";
import { FaExclamationTriangle, FaHome, FaLayerGroup, FaSpinner } from "react-icons/fa";
import { FloorPlan, FloorStructure, Room } from "@/types";

// Enhanced Floor Plan Viewer with Room Detection
const EnhancedFloorPlanViewer: React.FC<{ 
  floor: FloorPlan; 
  scale: number; 
  onCADParsed: (cadData: any, floorStructure: FloorStructure) => void;
  onRoomHover: (room: Room | null) => void;
}> = ({ floor, scale, onCADParsed, onRoomHover }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [isParsingCAD, setIsParsingCAD] = useState(false);
  const [cadParseError, setCADParseError] = useState<string>('');
  const [cadData, setCADData] = useState<any>(null);
  const [floorStructure, setFloorStructure] = useState<FloorStructure | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parseCADFile = useCallback(async (file: File) => {
    setIsParsingCAD(true);
    setCADParseError('');
    
    try {
      let result;
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      if (fileExtension === 'dxf') {
        result = await EnhancedCADParser.parseDXF(file);
      } else if (fileExtension === 'dwg') {
        result = await EnhancedCADParser.parseDWG(file);
      } else {
        throw new Error('Unsupported file format. Please use DXF or DWG files.');
      }

      setCADData(result.dxf);
      setFloorStructure(result.floorStructure);
      onCADParsed(result.dxf, result.floorStructure);
      
      // Render to canvas
      if (canvasRef.current && result.dxf) {
        EnhancedCADParser.renderDXFToCanvas(result.dxf, canvasRef.current);
        renderRoomOverlay(canvasRef.current, result.floorStructure);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CAD file';
      setCADParseError(errorMessage);
      console.error('CAD parsing error:', error);
    } finally {
      setIsParsingCAD(false);
    }
  }, [onCADParsed]);

  // Render room boundaries and labels on canvas
  const renderRoomOverlay = useCallback((canvas: HTMLCanvasElement, floorStructure: FloorStructure) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !floorStructure) return;

    const bounds = floorStructure.bounds;
    if (!bounds) return;

    // Calculate scaling (similar to original CAD rendering logic)
    const padding = 40;
    const drawWidth = bounds.maxX - bounds.minX;
    const drawHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (canvas.width - padding * 2) / drawWidth;
    const scaleY = (canvas.height - padding * 2) / drawHeight;
    const canvasScale = Math.min(scaleX, scaleY, 10);

    const scaledWidth = drawWidth * canvasScale;
    const scaledHeight = drawHeight * canvasScale;
    const offsetX = (canvas.width - scaledWidth) / 2 - bounds.minX * canvasScale;
    const offsetY = (canvas.height - scaledHeight) / 2 - bounds.minY * canvasScale;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(canvasScale, canvasScale);

    // Render room boundaries
    floorStructure.rooms.forEach((room, index) => {
      const roomBounds = room.bounds;
      const width = roomBounds.maxX - roomBounds.minX;
      const height = roomBounds.maxY - roomBounds.minY;

      // Room boundary
      ctx.strokeStyle = hoveredRoom?.id === room.id ? '#C36BA8' : '#4CAF50';
      ctx.lineWidth = hoveredRoom?.id === room.id ? 0.8 : 0.4;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(roomBounds.minX, roomBounds.minY, width, height);
      ctx.setLineDash([]);

      // Room fill (semi-transparent)
      const roomColors = {
        living: 'rgba(76, 175, 80, 0.1)',
        bedroom: 'rgba(156, 39, 176, 0.1)',
        kitchen: 'rgba(255, 193, 7, 0.1)',
        bathroom: 'rgba(33, 150, 243, 0.1)',
        hallway: 'rgba(158, 158, 158, 0.1)',
        room: 'rgba(96, 125, 139, 0.1)'
      };
      
      ctx.fillStyle = roomColors[room.type as keyof typeof roomColors] || roomColors.room;
      if (hoveredRoom?.id === room.id) {
        ctx.fillStyle = 'rgba(195, 107, 168, 0.2)';
      }
      ctx.fillRect(roomBounds.minX, roomBounds.minY, width, height);

      // Room label
      const centerX = roomBounds.minX + width / 2;
      const centerY = roomBounds.minY + height / 2;
      
      ctx.fillStyle = hoveredRoom?.id === room.id ? '#C36BA8' : '#2E7D32';
      ctx.font = `${Math.max(8, 12 / canvasScale)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(room.name, centerX, centerY);
      
      // Room type and area
      ctx.font = `${Math.max(6, 8 / canvasScale)}px Arial`;
      ctx.fillStyle = hoveredRoom?.id === room.id ? '#C36BA8' : '#616161';
      ctx.fillText(
        `${room.type} • ${Math.round(room.area)} sq ft`, 
        centerX, 
        centerY + (14 / canvasScale)
      );
    });

    ctx.restore();
  }, [hoveredRoom]);

  // Handle mouse movement for room detection
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!floorStructure || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert canvas coordinates to CAD coordinates
    const bounds = floorStructure.bounds;
    const padding = 40;
    const drawWidth = bounds.maxX - bounds.minX;
    const drawHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (canvas.width - padding * 2) / drawWidth;
    const scaleY = (canvas.height - padding * 2) / drawHeight;
    const canvasScale = Math.min(scaleX, scaleY, 10);

    const scaledWidth = drawWidth * canvasScale;
    const scaledHeight = drawHeight * canvasScale;
    const offsetX = (canvas.width - scaledWidth) / 2 - bounds.minX * canvasScale;
    const offsetY = (canvas.height - scaledHeight) / 2 - bounds.minY * canvasScale;

    const cadX = (x - offsetX) / canvasScale;
    const cadY = (y - offsetY) / canvasScale;

    // Find which room contains this point
    const foundRoom = floorStructure.rooms.find(room => {
      const roomBounds = room.bounds;
      return cadX >= roomBounds.minX && cadX <= roomBounds.maxX &&
             cadY >= roomBounds.minY && cadY <= roomBounds.maxY;
    });

    if (foundRoom !== hoveredRoom) {
      setHoveredRoom(foundRoom || null);
      onRoomHover(foundRoom || null);
      
      // Re-render with new hover state
      if (cadData) {
        EnhancedCADParser.renderDXFToCanvas(cadData, canvas);
        renderRoomOverlay(canvas, floorStructure);
      }
    }
  }, [floorStructure, cadData, hoveredRoom, onRoomHover, renderRoomOverlay]);

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
    if (canvasRef.current && cadData && floorStructure) {
      const resizeObserver = new ResizeObserver(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;
          EnhancedCADParser.renderDXFToCanvas(cadData, canvas);
          renderRoomOverlay(canvas, floorStructure);
        }
      });

      resizeObserver.observe(canvasRef.current);
      
      // Initial render
      EnhancedCADParser.renderDXFToCanvas(cadData, canvasRef.current);
      renderRoomOverlay(canvasRef.current, floorStructure);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [scale, cadData, floorStructure, renderRoomOverlay]);

  // Initial canvas setup
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      if (cadData && floorStructure) {
        EnhancedCADParser.renderDXFToCanvas(cadData, canvas);
        renderRoomOverlay(canvas, floorStructure);
      }
    }
  }, [cadData, floorStructure, renderRoomOverlay]);

  if (isParsingCAD) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <FaSpinner className="text-6xl mb-4 animate-spin text-blue-500 mx-auto" />
          <div className="text-lg font-medium text-gray-700 mb-2">Analyzing Floor Plan Structure...</div>
          <div className="text-sm text-gray-500 mb-4">
            {floor.dwgFile?.name} ({((floor.dwgFile?.size || 0) / 1024 / 1024).toFixed(1)}MB)
          </div>
          <div className="text-xs text-gray-400">
            Detecting rooms, walls, doors, and windows...
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
        </div>
      </div>
    );
  }

  if (cadData && floor.dwgFile) {
    return (
      <div className="absolute inset-0 w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-200 cursor-crosshair"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left',
            background: '#fafafa'
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => {
            setHoveredRoom(null);
            onRoomHover(null);
          }}
        />
        
        {/* CAD Info Panel */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-3 py-2 text-sm text-gray-700 shadow-sm border">
          <div className="font-medium flex items-center gap-2">
            <FaLayerGroup className="text-accent-500" />
            CAD: {floor.dwgFile.name}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {floorStructure?.rooms.length || 0} Rooms • {cadData.entities?.length || 0} Entities
          </div>
        </div>

        {/* Room Info Panel */}
        {hoveredRoom && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-3 py-2 text-sm text-gray-700 shadow-sm border">
            <div className="font-medium flex items-center gap-2">
              <FaHome className="text-purple-500" />
              {hoveredRoom.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {hoveredRoom.type} • {Math.round(hoveredRoom.area)} sq ft
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {hoveredRoom.doors.length} doors • {hoveredRoom.windows.length} windows
            </div>
          </div>
        )}
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
            Unsupported Format ({((floor.dwgFile.size || 0) / 1024 / 1024).toFixed(1)}MB)
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

export default EnhancedFloorPlanViewer;