// src/types/index.ts
// Property Types
export interface PropertyDetails {
  size: number;
  rooms: number;
  bathrooms: number;
  type: 'apartment' | 'villa' | 'townhouse' | 'mansion';
  floors: number;
}

// Device Types
export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  price: number;
  description: string;
  icon: string;
  image: string;
  dimensions: {
    width: number;
    height: number;
  };
  specifications?: Record<string, string>;
}

export type DeviceCategory = 
  | 'security'
  | 'lighting'
  | 'climate'
  | 'entertainment'
  | 'kitchen'
  | 'bathroom'
  | 'outdoor';

// Floor Plan Types
export interface FloorPlan {
  id: string;
  floorNumber: number;
  name: string;
  dwgFile?: File;
  dwgData?: string;
  cadData?: any;
  devices: PlacedDevice[];
  dimensions: {
    width: number;
    height: number;
  };
  scale: number;
  previewUrl: any;
}

export interface PlacedDevice {
  deviceId: string;
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// Drag and Drop Types
export interface DragItem {
  type: 'device';
  device: Device;
}

export interface DropResult {
  name: string;
  allowedDropEffect: string;
}

// Cost Calculation Types
export interface CostBreakdown {
  baseInstallation: number;
  devices: DeviceCost[];
  labor: number;
  tax: number;
  total: number;
}

export interface DeviceCost {
  deviceId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Form Data Types
export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
}

export interface QuoteRequest {
  propertyDetails: PropertyDetails;
  floorPlans: FloorPlan[];
  contactInfo: ContactInfo;
  costBreakdown: CostBreakdown;
  notes?: string;
}

// Step Management Types
export type EstimationStep = 
  | 'input-method'
  | 'property-details'
  | 'floor-upload'
  | 'device-placement'
  | '3d-visualization'
  | 'cost-calculation'
  | 'contact-info'
  | 'quote-generation';

export interface StepData {
  step: EstimationStep;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface EmailQuoteRequest {
  to: string;
  subject: string;
  quoteData: QuoteRequest;
  attachments?: string[];
}

export interface WhatsAppQuoteRequest {
  phone: string;
  message: string;
  quoteData: QuoteRequest;
}

export interface SMSQuoteRequest {
  phone: string;
  message: string;
}

// 3D Visualization Types
export interface Scene3D {
  floors: Floor3D[];
  lighting: LightingConfig;
  camera: CameraConfig;
  materials: MaterialConfig;
}

export interface Floor3D {
  id: string;
  level: number;
  geometry: FloorGeometry;
  walls: Wall3D[];
  devices: Device3D[];
}

export interface FloorGeometry {
  vertices: number[][];
  faces: number[][];
  height: number;
}

export interface Wall3D {
  id: string;
  start: [number, number];
  end: [number, number];
  height: number;
  thickness: number;
  material: string;
}

export interface Device3D {
  id: string;
  deviceId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  model?: string;
}

export interface LightingConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
}

export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface MaterialConfig {
  floor: {
    color: string;
    roughness: number;
    metalness: number;
  };
  wall: {
    color: string;
    roughness: number;
    metalness: number;
  };
}

// File Upload Types
export interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Store Types (for Zustand)
export interface EstimationStore {
  // Current step
  currentStep: EstimationStep;
  setCurrentStep: (step: EstimationStep) => void;
  
  // Input method
  inputMethod: 'manual' | 'dwg';
  setInputMethod: (method: 'manual' | 'dwg') => void;
  
  // Property details
  propertyDetails: Partial<PropertyDetails>;
  setPropertyDetails: (details: Partial<PropertyDetails>) => void;
  
  // Floor plans
  floorPlans: FloorPlan[];
  setFloorPlans: (plans: FloorPlan[]) => void;
  addFloorPlan: (plan: FloorPlan) => void;
  updateFloorPlan: (id: string, updates: Partial<FloorPlan>) => void;
  removeFloorPlan: (id: string) => void;
  
  // Selected devices
  selectedDevices: Device[];
  setSelectedDevices: (devices: Device[]) => void;
  
  // Cost breakdown
  costBreakdown: CostBreakdown | null;
  setCostBreakdown: (breakdown: CostBreakdown) => void;
  
  // Contact info
  contactInfo: Partial<ContactInfo>;
  setContactInfo: (info: Partial<ContactInfo>) => void;
  
  // 3D Scene
  scene3D: Scene3D | null;
  setScene3D: (scene: Scene3D) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Reset store
  reset: () => void;
}

// Utility Types
export interface Point2D {
  x: number;
  y: number;
}

export interface Dimensions2D {
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}