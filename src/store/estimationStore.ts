// src/store/estimationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  EstimationStore, 
  EstimationStep, 
  PropertyDetails, 
  FloorPlan, 
  Device, 
  CostBreakdown, 
  ContactInfo, 
  Scene3D 
} from '@/types';

const initialPropertyDetails: Partial<PropertyDetails> = {
  size: undefined,
  rooms: undefined,
  bathrooms: undefined,
  type: undefined,
  floors: 1,
};

const initialContactInfo: Partial<ContactInfo> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  preferredContact: 'email',
};

export const useEstimationStore = create<EstimationStore>()(
  persist(
    (set, get) => ({
      // Current step
      currentStep: 'input-method',
      setCurrentStep: (step: EstimationStep) => {
        console.log('Setting current step to:', step);
        set({ currentStep: step });
      },

      // Input method
      inputMethod: 'manual',
      setInputMethod: (method: 'manual' | 'dwg') => {
        console.log('Setting input method to:', method);
        set({ inputMethod: method });
      },

      // Property details
      propertyDetails: initialPropertyDetails,
      setPropertyDetails: (details: Partial<PropertyDetails>) => {
        console.log('Updating property details:', details);
        set((state) => ({
          propertyDetails: { ...state.propertyDetails, ...details },
        }));
      },

      // Floor plans
      floorPlans: [],
      setFloorPlans: (plans: FloorPlan[]) => {
        console.log('Setting floor plans:', plans.length);
        set({ floorPlans: plans });
      },
      
      addFloorPlan: (plan: FloorPlan) => {
        console.log('Adding floor plan:', plan.name);
        set((state) => ({
          floorPlans: [...state.floorPlans, plan],
        }));
      },
      
      updateFloorPlan: (id: string, updates: Partial<FloorPlan>) => {
        console.log('Updating floor plan:', id, updates);
        set((state) => ({
          floorPlans: state.floorPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updates } : plan
          ),
        }));
      },
      
      removeFloorPlan: (id: string) => {
        console.log('Removing floor plan:', id);
        set((state) => ({
          floorPlans: state.floorPlans.filter((plan) => plan.id !== id),
        }));
      },

      // Selected devices
      selectedDevices: [],
      setSelectedDevices: (devices: Device[]) => {
        console.log('Setting selected devices:', devices.length);
        set({ selectedDevices: devices });
      },

      // Cost breakdown
      costBreakdown: null,
      setCostBreakdown: (breakdown: CostBreakdown) => {
        console.log('Setting cost breakdown:', breakdown.total);
        set({ costBreakdown: breakdown });
      },

      // Contact info
      contactInfo: initialContactInfo,
      setContactInfo: (info: Partial<ContactInfo>) => {
        console.log('Updating contact info:', Object.keys(info));
        set((state) => ({
          contactInfo: { ...state.contactInfo, ...info },
        }));
      },

      // 3D Scene
      scene3D: null,
      setScene3D: (scene: Scene3D) => {
        console.log('Setting 3D scene');
        set({ scene3D: scene });
      },

      // Loading states
      isLoading: false,
      setIsLoading: (loading: boolean) => {
        console.log('Setting loading state:', loading);
        set({ isLoading: loading });
      },

      // Reset store
      reset: () => {
        console.log('Resetting store');
        set({
          currentStep: 'input-method',
          inputMethod: 'manual',
          propertyDetails: initialPropertyDetails,
          floorPlans: [],
          selectedDevices: [],
          costBreakdown: null,
          contactInfo: initialContactInfo,
          scene3D: null,
          isLoading: false,
        });
      },

      // Helper function to check if a step can be accessed
      canAccessStep: (step: EstimationStep): boolean => {
        const state = get();
        const { inputMethod, propertyDetails, floorPlans, selectedDevices } = state;

        switch (step) {
          case 'input-method':
            return true;
          
          case 'property-details':
            return !!inputMethod;
          
          case 'floor-upload':
            return inputMethod === 'dwg' && 
                   !!propertyDetails.type && 
                   !!propertyDetails.size;
          
          case 'device-placement':
            if (inputMethod === 'dwg') {
              return floorPlans.length > 0;
            }
            return !!propertyDetails.type && !!propertyDetails.size;
          
          case '3d-visualization':
            return inputMethod === 'dwg' && 
                   floorPlans.some(plan => plan.devices.length > 0);
          
          case 'cost-calculation':
            if (inputMethod === 'dwg') {
              return floorPlans.some(plan => plan.devices.length > 0);
            }
            return selectedDevices.length > 0;
          
          case 'contact-info':
            return !!state.costBreakdown;
          
          case 'quote-generation':
            return !!state.contactInfo.email && 
                   !!state.contactInfo.firstName && 
                   !!state.contactInfo.phone;
          
          default:
            return false;
        }
      },
    }),
    {
      name: 'smartlife-estimation-store',
      partialize: (state) => ({
        currentStep: state.currentStep,
        inputMethod: state.inputMethod,
        propertyDetails: state.propertyDetails,
        floorPlans: state.floorPlans.map(plan => ({
          ...plan,
          dwgFile: undefined, // Don't persist File objects
        })),
        selectedDevices: state.selectedDevices,
        costBreakdown: state.costBreakdown,
        contactInfo: state.contactInfo,
      }),
    }
  )
);