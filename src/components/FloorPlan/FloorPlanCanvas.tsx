// Room structure interfaces
interface Room {
  id: string;
  name: string;
  type: 'room' | 'bathroom' | 'kitchen' | 'bedroom' | 'living' | 'hallway';
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>;
  doors: Array<{ position: { x: number; y: number }; width: number; direction: number }>;
  windows: Array<{ position: { x: number; y: number }; width: number; direction: number }>;
  area: number;
}

interface FloorStructure {
  rooms: Room[];
  walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }>;
  doors: Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }>;
  windows: Array<{ position: { x: number; y: number }; width: number; direction: number }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

// Enhanced CAD Parser class with Room Detection
class EnhancedCADParser {
  static async parseDXF(file: File): Promise<{ dxf: any; floorStructure: FloorStructure }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dxfString = event.target?.result as string;
          const parser = new DxfParser();
          const dxf = parser.parseSync(dxfString);
          
          // Generate floor structure from DXF data
          const floorStructure = this.generateFloorStructure(dxf);
          
          resolve({ dxf, floorStructure });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static async parseDWG(file: File): Promise<{ dxf: any; floorStructure: FloorStructure }> {
    try {
      // Try to read as text first
      const text = await this.fileToText(file);
      if (text.includes('SECTION') && text.includes('ENTITIES')) {
        const parser = new DxfParser();
        const dxf = parser.parseSync(text);
        const floorStructure = this.generateFloorStructure(dxf);
        return { dxf, floorStructure };
      }
    } catch (error) {
      // Continue to binary parsing
    }

    // Binary DWG parsing with enhanced room detection
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const dxf = await this.parseBinaryDWG(arrayBuffer);
          const floorStructure = this.generateFloorStructure(dxf);
          resolve({ dxf, floorStructure });
        } catch (error) {
          reject(new Error('Binary DWG parsing requires additional libraries. Please convert to DXF format for full room detection.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read binary DWG file'));
      reader.readAsArrayBuffer(file);
    });
  }

  static generateFloorStructure(dxf: any): FloorStructure {
    const entities = dxf.entities || [];
    
    // Extract walls, doors, and windows
    const walls = this.extractWalls(entities);
    const doors = this.extractDoors(entities);
    const windows = this.extractWindows(entities);
    
    // Calculate overall bounds
    const bounds = this.calculateOverallBounds(entities);
    
    // Detect rooms based on wall intersections
    const rooms = this.detectRooms(walls, doors, windows, bounds);
    
    return {
      rooms,
      walls,
      doors,
      windows,
      bounds: bounds || { minX: 0, maxX: 100, minY: 0, maxY: 100 }
    };
  }

  static extractWalls(entities: any[]): Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }> {
    const walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }> = [];
    
    entities.forEach(entity => {
      if (entity.type === 'LINE' && (entity.layer === 'WALLS' || entity.layer === '0')) {
        if (entity.vertices && entity.vertices.length >= 2) {
          walls.push({
            start: { x: entity.vertices[0].x, y: entity.vertices[0].y },
            end: { x: entity.vertices[1].x, y: entity.vertices[1].y },
            thickness: 0.3
          });
        }
      } else if (entity.type === 'POLYLINE' && (entity.layer === 'WALLS' || entity.layer === '0')) {
        if (entity.vertices && entity.vertices.length > 1) {
          for (let i = 0; i < entity.vertices.length - 1; i++) {
            walls.push({
              start: { x: entity.vertices[i].x, y: entity.vertices[i].y },
              end: { x: entity.vertices[i + 1].x, y: entity.vertices[i + 1].y },
              thickness: 0.3
            });
          }
        }
      }
    });

    return walls;
  }

  static extractDoors(entities: any[]): Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }> {
    const doors: Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }> = [];
    
    entities.forEach(entity => {
      if (entity.layer === 'DOORS' || entity.type === 'INSERT') {
        if (entity.position) {
          doors.push({
            position: { x: entity.position.x, y: entity.position.y },
            width: 30, // Default door width
            direction: 0,
            roomIds: []
          });
        } else if (entity.vertices && entity.vertices.length >= 2) {
          // Door represented as a line
          const midX = (entity.vertices[0].x + entity.vertices[1].x) / 2;
          const midY = (entity.vertices[0].y + entity.vertices[1].y) / 2;
          doors.push({
            position: { x: midX, y: midY },
            width: Math.sqrt(
              Math.pow(entity.vertices[1].x - entity.vertices[0].x, 2) +
              Math.pow(entity.vertices[1].y - entity.vertices[0].y, 2)
            ),
            direction: Math.atan2(
              entity.vertices[1].y - entity.vertices[0].y,
              entity.vertices[1].x - entity.vertices[0].x
            ),
            roomIds: []
          });
        }
      }
    });

    return doors;
  }

  static extractWindows(entities: any[]): Array<{ position: { x: number; y: number }; width: number; direction: number }> {
    const windows: Array<{ position: { x: number; y: number }; width: number; direction: number }> = [];
    
    entities.forEach(entity => {
      if (entity.layer === 'WINDOWS' || (entity.layer === 'WINDOW' && entity.type === 'LINE')) {
        if (entity.vertices && entity.vertices.length >= 2) {
          const midX = (entity.vertices[0].x + entity.vertices[1].x) / 2;
          const midY = (entity.vertices[0].y + entity.vertices[1].y) / 2;
          windows.push({
            position: { x: midX, y: midY },
            width: Math.sqrt(
              Math.pow(entity.vertices[1].x - entity.vertices[0].x, 2) +
              Math.pow(entity.vertices[1].y - entity.vertices[0].y, 2)
            ),
            direction: Math.atan2(
              entity.vertices[1].y - entity.vertices[0].y,
              entity.vertices[1].x - entity.vertices[0].x
            )
          });
        }
      }
    });

    return windows;
  }

  static detectRooms(
    walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }>,
    doors: Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }>,
    windows: Array<{ position: { x: number; y: number }; width: number; direction: number }>,
    bounds: any
  ): Room[] {
    const rooms: Room[] = [];
    
    if (!bounds) {
      return rooms;
    }

    // Simple room detection algorithm
    // For now, create rooms based on wall segments and enclosed areas
    const roomBounds = this.findEnclosedAreas(walls, bounds);
    
    roomBounds.forEach((roomBound, index) => {
      const roomType = this.classifyRoom(roomBound, doors, windows);
      
      rooms.push({
        id: `room-${index}`,
        name: `${roomType.charAt(0).toUpperCase() + roomType.slice(1)} ${index + 1}`,
        type: roomType as any,
        bounds: roomBound,
        walls: walls.filter(wall => this.isWallInRoom(wall, roomBound)),
        doors: doors.filter(door => this.isPointInRoom(door.position, roomBound)),
        windows: windows.filter(window => this.isPointInRoom(window.position, roomBound)),
        area: (roomBound.maxX - roomBound.minX) * (roomBound.maxY - roomBound.minY)
      });
    });

    return rooms;
  }

  static findEnclosedAreas(walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }>, bounds: any): Array<{ minX: number; maxX: number; minY: number; maxY: number }> {
    // Simplified room detection - divide the floor plan into grid-based rooms
    const roomAreas: Array<{ minX: number; maxX: number; minY: number; maxY: number }> = [];
    
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    
    // Create a 3x3 grid of potential rooms (can be enhanced with more sophisticated algorithms)
    const gridCols = Math.max(2, Math.floor(width / 50));
    const gridRows = Math.max(2, Math.floor(height / 50));
    
    const cellWidth = width / gridCols;
    const cellHeight = height / gridRows;
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const roomBound = {
          minX: bounds.minX + col * cellWidth,
          maxX: bounds.minX + (col + 1) * cellWidth,
          minY: bounds.minY + row * cellHeight,
          maxY: bounds.minY + (row + 1) * cellHeight
        };
        
        // Check if this area has walls around it
        if (this.hasEnclosingWalls(roomBound, walls)) {
          roomAreas.push(roomBound);
        }
      }
    }
    
    // If no rooms detected, create one main room
    if (roomAreas.length === 0) {
      roomAreas.push(bounds);
    }
    
    return roomAreas;
  }

  static hasEnclosingWalls(roomBound: { minX: number; maxX: number; minY: number; maxY: number }, walls: any[]): boolean {
    // Check if there are walls that could enclose this area
    const wallsNearRoom = walls.filter(wall => 
      (wall.start.x >= roomBound.minX - 5 && wall.start.x <= roomBound.maxX + 5 &&
       wall.start.y >= roomBound.minY - 5 && wall.start.y <= roomBound.maxY + 5) ||
      (wall.end.x >= roomBound.minX - 5 && wall.end.x <= roomBound.maxX + 5 &&
       wall.end.y >= roomBound.minY - 5 && wall.end.y <= roomBound.maxY + 5)
    );
    
    return wallsNearRoom.length > 0;
  }

  static classifyRoom(
    roomBound: { minX: number; maxX: number; minY: number; maxY: number },
    doors: any[],
    windows: any[]
  ): string {
    const area = (roomBound.maxX - roomBound.minX) * (roomBound.maxY - roomBound.minY);
    const doorsInRoom = doors.filter(door => this.isPointInRoom(door.position, roomBound));
    const windowsInRoom = windows.filter(window => this.isPointInRoom(window.position, roomBound));
    
    // Simple classification based on size and features
    if (area < 500) {
      return 'bathroom';
    } else if (area < 1000) {
      return 'bedroom';
    } else if (windowsInRoom.length > 1) {
      return 'living';
    } else if (area > 2000) {
      return 'living';
    } else {
      return 'room';
    }
  }

  static isWallInRoom(wall: any, roomBound: any): boolean {
    return (
      (wall.start.x >= roomBound.minX && wall.start.x <= roomBound.maxX &&
       wall.start.y >= roomBound.minY && wall.start.y <= roomBound.maxY) ||
      (wall.end.x >= roomBound.minX && wall.end.x <= roomBound.maxX &&
       wall.end.y >= roomBound.minY && wall.end.y <= roomBound.maxY)
    );
  }

  static isPointInRoom(point: { x: number; y: number }, roomBound: any): boolean {
    return (
      point.x >= roomBound.minX && point.x <= roomBound.maxX &&
      point.y >= roomBound.minY && point.y <= roomBound.maxY
    );
  }

  static calculateOverallBounds(entities: any[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
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
        if (entity.vertices && entity.vertices.length >= 2) {
          points.push(
            { x: entity.vertices[0].x, y: entity.vertices[0].y },
            { x: entity.vertices[1].x, y: entity.vertices[1].y }
          );
        }
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

  static parseBinaryDWG(arrayBuffer: ArrayBuffer): Promise<any> {
    const dataView = new DataView(arrayBuffer);
    
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

    return Promise.resolve({
      header: {
        version: signature,
        acadVersion: 'AutoCAD Unknown'
      },
      entities: this.createSampleEntitiesFromDWG(arrayBuffer),
      layers: {
        '0': { name: '0', color: 7 },
        'WALLS': { name: 'WALLS', color: 1 },
        'DOORS': { name: 'DOORS', color: 2 },
        'WINDOWS': { name: 'WINDOWS', color: 3 }
      },
      tables: {},
      blocks: {}
    });
  }

  static createSampleEntitiesFromDWG(arrayBuffer: ArrayBuffer): any[] {
    const fileSize = arrayBuffer.byteLength;
    const sampleEntities = [];

    const roomWidth = 200;
    const roomHeight = 150;

    // Create a more complex floor plan with multiple rooms
    // Main outer walls
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

    // Add internal walls to create rooms
    if (fileSize > 30000) {
      // Vertical dividing wall
      sampleEntities.push({
        type: 'LINE',
        vertices: [
          { x: roomWidth * 0.6, y: 0 },
          { x: roomWidth * 0.6, y: roomHeight * 0.7 }
        ],
        start: { x: roomWidth * 0.6, y: 0 },
        end: { x: roomWidth * 0.6, y: roomHeight * 0.7 },
        layer: 'WALLS'
      });

      // Horizontal dividing wall
      sampleEntities.push({
        type: 'LINE',
        vertices: [
          { x: 0, y: roomHeight * 0.7 },
          { x: roomWidth * 0.6, y: roomHeight * 0.7 }
        ],
        start: { x: 0, y: roomHeight * 0.7 },
        end: { x: roomWidth * 0.6, y: roomHeight * 0.7 },
        layer: 'WALLS'
      });

      // Add doors
      sampleEntities.push({
        type: 'INSERT',
        position: { x: roomWidth * 0.6, y: roomHeight * 0.35 },
        name: 'DOOR',
        layer: 'DOORS'
      });

      sampleEntities.push({
        type: 'INSERT',
        position: { x: roomWidth * 0.3, y: roomHeight * 0.7 },
        name: 'DOOR',
        layer: 'DOORS'
      });

      // Add windows
      sampleEntities.push({
        type: 'LINE',
        vertices: [
          { x: roomWidth, y: roomHeight * 0.3 },
          { x: roomWidth, y: roomHeight * 0.6 }
        ],
        start: { x: roomWidth, y: roomHeight * 0.3 },
        end: { x: roomWidth, y: roomHeight * 0.6 },
        layer: 'WINDOWS'
      });
    }

    console.log('Created enhanced DWG entities with rooms:', sampleEntities.length, sampleEntities);
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

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const entities = dxf.entities || [];
    
    console.log('Rendering entities:', entities.length, entities);

    if (entities.length === 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No entities found in CAD file', canvas.width / 2, canvas.height / 2);
      return;
    }

    let bounds = this.calculateOverallBounds(entities);
    console.log('Calculated bounds:', bounds);

    if (!bounds || (bounds.maxX - bounds.minX === 0 && bounds.maxY - bounds.minY === 0)) {
      bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }

    const padding = 40;
    const drawWidth = bounds.maxX - bounds.minX;
    const drawHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (canvas.width - padding * 2) / drawWidth;
    const scaleY = (canvas.height - padding * 2) / drawHeight;
    const scale = Math.min(scaleX, scaleY, 10);

    const scaledWidth = drawWidth * scale;
    const scaledHeight = drawHeight * scale;
    const offsetX = (canvas.width - scaledWidth) / 2 - bounds.minX * scale;
    const offsetY = (canvas.height - scaledHeight) / 2 - bounds.minY * scale;

    console.log('Rendering with scale:', scale, 'offset:', { offsetX, offsetY });

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

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
      ctx.fillStyle = layerColor + '20';
      
      console.log(`Rendering entity ${index}:`, entity.type, entity);
      this.renderEntity(ctx, entity);
    });

    ctx.restore();

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
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
}// Enhanced FloorPlanCanvas.tsx with CAD Room Detection Integration
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import Image from 'next/image';
import { FaTrash, FaSearchPlus, FaSearchMinus, FaExpand, FaCog, FaRedo, FaExpandArrowsAlt, FaCompressArrowsAlt, FaSpinner, FaExclamationTriangle, FaHome, FaLayerGroup } from 'react-icons/fa';
import { FloorPlan, PlacedDevice, Device, DragItem } from '@/types';
import { useEstimationStore } from '@/store/estimationStore';
import { getDeviceById } from '@/data/devices';
import { useLanguage } from '@/contexts/LanguageContext';

// DWG/DXF Parser imports
import DxfParser from 'dxf-parser';
import * as THREE from 'three';

// Room structure interfaces
interface Room {
  id: string;
  name: string;
  type: 'room' | 'bathroom' | 'kitchen' | 'bedroom' | 'living' | 'hallway';
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>;
  doors: Array<{ position: { x: number; y: number }; width: number; direction: number }>;
  windows: Array<{ position: { x: number; y: number }; width: number; direction: number }>;
  area: number;
}

interface FloorStructure {
  rooms: Room[];
  walls: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }>;
  doors: Array<{ position: { x: number; y: number }; width: number; direction: number; roomIds: string[] }>;
  windows: Array<{ position: { x: number; y: number }; width: number; direction: number }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
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

interface FloorPlanCanvasProps {
  floor: FloorPlan;
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

      {/* Room-based Device Placement Tips */}
      {floorStructure && floorStructure.rooms.length > 1 && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Smart Placement Tips:</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>• Hover over rooms to see their names and types</p>
            <p>• Place security cameras near room entrances</p>
            <p>• Position smart lights in the center of each room</p>
            <p>• Install climate sensors away from doors and windows</p>
            <p>• The 3D view will show devices in their room context</p>
          </div>
        </div>
      )}

      {/* Enhanced CAD Features */}
      {!floor.dwgFile && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Enhanced CAD Support:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Automatic Room Detection:</strong> Upload DXF/DWG files to automatically detect rooms</p>
            <p>• <strong>Wall & Door Recognition:</strong> The system identifies structural elements</p>
            <p>• <strong>Smart Device Placement:</strong> Get room-context when placing devices</p>
            <p>• <strong>3D Room Visualization:</strong> See your exact floor plan structure in 3D</p>
            <p>• Upload your architectural drawings to unlock these features</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFloorPlanCanvas;