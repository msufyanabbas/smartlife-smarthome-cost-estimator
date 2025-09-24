// src/data/devices.ts
import { Device } from '@/types';

// Helper function to get translated category names
export const getDeviceCategories = (t: (key: string) => string) => [
  { id: 'security', name: t('devices.categories.security'), icon: 'shield-alt' },
  { id: 'lighting', name: t('devices.categories.lighting'), icon: 'lightbulb' },
  { id: 'climate', name: t('devices.categories.climate'), icon: 'thermometer-half' },
  { id: 'entertainment', name: t('devices.categories.entertainment'), icon: 'tv' },
  { id: 'kitchen', name: t('devices.categories.kitchen'), icon: 'utensils' },
  { id: 'bathroom', name: t('devices.categories.bathroom'), icon: 'bath' },
  { id: 'outdoor', name: t('devices.categories.outdoor'), icon: 'tree' },
];

// Static device categories for backward compatibility
export const deviceCategories = [
  { id: 'security', name: 'Security & Safety', icon: 'shield-alt' },
  { id: 'lighting', name: 'Lighting & Climate', icon: 'lightbulb' },
  { id: 'climate', name: 'Climate Control', icon: 'thermometer-half' },
  { id: 'entertainment', name: 'Entertainment', icon: 'tv' },
  { id: 'kitchen', name: 'Kitchen & Appliances', icon: 'utensils' },
  { id: 'bathroom', name: 'Bathroom', icon: 'bath' },
  { id: 'outdoor', name: 'Outdoor', icon: 'tree' },
];

// Helper function to get translated devices
export const getDevices = (t: (key: string) => string): Device[] => [
  // Security Devices
  {
    id: 'smart-lock',
    name: t('Tdevices.smartLock.name'),
    category: 'security',
    price: 800,
    description: t('Tdevices.smartLock.description'),
    icon: 'door-closed',
    image: 'https://plus.unsplash.com/premium_photo-1729574858839-5a145c914bac?q=80&w=1188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    dimensions: { width: 80, height: 40 },
    specifications: {
      [t('Tdevices.smartLock.specs.connectivity')]: 'WiFi, Bluetooth',
      [t('Tdevices.smartLock.specs.batteryLife')]: '12 months',
      [t('Tdevices.smartLock.specs.security')]: 'AES 128-bit encryption',
      [t('Tdevices.smartLock.specs.compatibility')]: 'iOS, Android'
    }
  },
  {
    id: 'security-camera',
    name: t('Tdevices.securityCamera.name'),
    category: 'security',
    price: 1200,
    description: t('Tdevices.securityCamera.description'),
    icon: 'video',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop',
    dimensions: { width: 60, height: 60 },
    specifications: {
      [t('Tdevices.securityCamera.specs.resolution')]: '4K Ultra HD',
      [t('Tdevices.securityCamera.specs.nightVision')]: t('Tdevices.securityCamera.specs.nightVisionValue'),
      [t('Tdevices.securityCamera.specs.storage')]: t('Tdevices.securityCamera.specs.storageValue'),
      [t('Tdevices.securityCamera.specs.fieldOfView')]: '130°'
    }
  },
  {
    id: 'motion-sensor',
    name: t('Tdevices.motionSensor.name'),
    category: 'security',
    price: 600,
    description: t('Tdevices.motionSensor.description'),
    icon: 'walking',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&h=200&fit=crop',
    dimensions: { width: 40, height: 40 },
    specifications: {
      [t('Tdevices.motionSensor.specs.detectionRange')]: '40ft',
      [t('Tdevices.motionSensor.specs.sensitivity')]: t('Tdevices.motionSensor.specs.sensitivityValue'),
      [t('Tdevices.motionSensor.specs.batteryLife')]: '2 years',
      [t('Tdevices.motionSensor.specs.responseTime')]: '<1 second'
    }
  },
  {
    id: 'smoke-detector',
    name: t('Tdevices.smokeDetector.name'),
    category: 'security',
    price: 400,
    description: t('Tdevices.smokeDetector.description'),
    icon: 'fire',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    dimensions: { width: 50, height: 20 },
    specifications: {
      [t('Tdevices.smokeDetector.specs.detectionType')]: t('Tdevices.smokeDetector.specs.detectionTypeValue'),
      [t('Tdevices.smokeDetector.specs.batteryLife')]: '10 years',
      [t('Tdevices.smokeDetector.specs.connectivity')]: 'WiFi',
      [t('Tdevices.smokeDetector.specs.certification')]: 'UL Listed'
    }
  },
  {
    id: 'alarm-system',
    name: t('Tdevices.alarmSystem.name'),
    category: 'security',
    price: 1000,
    description: t('Tdevices.alarmSystem.description'),
    icon: 'bell',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=200&fit=crop',
    dimensions: { width: 100, height: 60 },
    specifications: {
      [t('Tdevices.alarmSystem.specs.zones')]: t('Tdevices.alarmSystem.specs.zonesValue'),
      [t('Tdevices.alarmSystem.specs.monitoring')]: t('Tdevices.alarmSystem.specs.monitoringValue'),
      [t('Tdevices.alarmSystem.specs.backup')]: t('Tdevices.alarmSystem.specs.backupValue'),
      [t('Tdevices.alarmSystem.specs.integration')]: t('Tdevices.alarmSystem.specs.integrationValue')
    }
  },
  {
    id: 'video-doorbell',
    name: t('Tdevices.videoDoorbell.name'),
    category: 'security',
    price: 300,
    description: t('Tdevices.videoDoorbell.description'),
    icon: 'doorbell',
    image: 'https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?w=300&h=200&fit=crop',
    dimensions: { width: 50, height: 80 },
    specifications: {
      [t('Tdevices.videoDoorbell.specs.videoQuality')]: '1080p HD',
      [t('Tdevices.videoDoorbell.specs.twoWayAudio')]: t('Tdevices.videoDoorbell.specs.twoWayAudioValue'),
      [t('Tdevices.videoDoorbell.specs.motionDetection')]: t('Tdevices.videoDoorbell.specs.motionDetectionValue'),
      [t('Tdevices.videoDoorbell.specs.storage')]: t('Tdevices.videoDoorbell.specs.storageValue')
    }
  },

  // Lighting Devices
  {
    id: 'smart-bulb',
    name: t('Tdevices.smartBulb.name'),
    category: 'lighting',
    price: 150,
    description: t('Tdevices.smartBulb.description'),
    icon: 'lightbulb',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=300&h=200&fit=crop',
    dimensions: { width: 30, height: 30 },
    specifications: {
      [t('Tdevices.smartBulb.specs.colors')]: t('Tdevices.smartBulb.specs.colorsValue'),
      [t('Tdevices.smartBulb.specs.brightness')]: '800 lumens',
      [t('Tdevices.smartBulb.specs.energy')]: '9W LED',
      [t('Tdevices.smartBulb.specs.lifespan')]: t('Tdevices.smartBulb.specs.lifespanValue')
    }
  },
  {
    id: 'smart-switch',
    name: t('Tdevices.smartSwitch.name'),
    category: 'lighting',
    price: 100,
    description: t('Tdevices.smartSwitch.description'),
    icon: 'toggle-on',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop',
    dimensions: { width: 40, height: 70 },
    specifications: {
      [t('Tdevices.smartSwitch.specs.installation')]: t('Tdevices.smartSwitch.specs.installationValue'),
      [t('Tdevices.smartSwitch.specs.dimming')]: t('Tdevices.smartSwitch.specs.dimmingValue'),
      [t('Tdevices.smartSwitch.specs.voiceControl')]: 'Alexa, Google, Siri',
      [t('Tdevices.smartSwitch.specs.scheduling')]: t('Tdevices.smartSwitch.specs.schedulingValue')
    }
  },
  {
    id: 'motion-light',
    name: t('Tdevices.motionLight.name'),
    category: 'lighting',
    price: 200,
    description: t('Tdevices.motionLight.description'),
    icon: 'sun',
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=200&fit=crop',
    dimensions: { width: 60, height: 60 },
    specifications: {
      [t('Tdevices.motionLight.specs.detectionRange')]: '20ft',
      [t('Tdevices.motionLight.specs.autoShutOff')]: t('Tdevices.motionLight.specs.autoShutOffValue'),
      [t('Tdevices.motionLight.specs.brightness')]: '1200 lumens',
      [t('Tdevices.motionLight.specs.weatherResistant')]: 'IP65 rated'
    }
  },

  // Climate Control Devices
  {
    id: 'smart-thermostat',
    name: t('Tdevices.smartThermostat.name'),
    category: 'climate',
    price: 500,
    description: t('Tdevices.smartThermostat.description'),
    icon: 'thermometer-half',
    image: 'https://images.unsplash.com/photo-1545259742-b4fd8fea67e4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    dimensions: { width: 80, height: 80 },
    specifications: {
      [t('Tdevices.smartThermostat.specs.learning')]: t('Tdevices.smartThermostat.specs.learningValue'),
      [t('Tdevices.smartThermostat.specs.energySavings')]: t('Tdevices.smartThermostat.specs.energySavingsValue'),
      [t('Tdevices.smartThermostat.specs.compatibility')]: t('Tdevices.smartThermostat.specs.compatibilityValue'),
      [t('Tdevices.smartThermostat.specs.remoteControl')]: t('Tdevices.smartThermostat.specs.remoteControlValue')
    }
  },
  {
    id: 'smart-fan',
    name: t('Tdevices.smartFan.name'),
    category: 'climate',
    price: 200,
    description: t('Tdevices.smartFan.description'),
    icon: 'fan',
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop',
    dimensions: { width: 120, height: 120 },
    specifications: {
      [t('Tdevices.smartFan.specs.speedSettings')]: t('Tdevices.smartFan.specs.speedSettingsValue'),
      [t('Tdevices.smartFan.specs.direction')]: t('Tdevices.smartFan.specs.directionValue'),
      [t('Tdevices.smartFan.specs.light')]: t('Tdevices.smartFan.specs.lightValue'),
      [t('Tdevices.smartFan.specs.energy')]: t('Tdevices.smartFan.specs.energyValue')
    }
  },
  {
    id: 'smart-blinds',
    name: t('Tdevices.smartBlinds.name'),
    category: 'climate',
    price: 300,
    description: t('Tdevices.smartBlinds.description'),
    icon: 'window-maximize',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
    dimensions: { width: 200, height: 150 },
    specifications: {
      [t('Tdevices.smartBlinds.specs.motor')]: t('Tdevices.smartBlinds.specs.motorValue'),
      [t('Tdevices.smartBlinds.specs.power')]: t('Tdevices.smartBlinds.specs.powerValue'),
      [t('Tdevices.smartBlinds.specs.control')]: t('Tdevices.smartBlinds.specs.controlValue'),
      [t('Tdevices.smartBlinds.specs.installation')]: t('Tdevices.smartBlinds.specs.installationValue')
    }
  },

  // Entertainment Devices
  {
    id: 'smart-tv',
    name: t('Tdevices.smartTV.name'),
    category: 'entertainment',
    price: 1500,
    description: t('Tdevices.smartTV.description'),
    icon: 'tv',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=200&fit=crop',
    dimensions: { width: 200, height: 120 },
    specifications: {
      [t('Tdevices.smartTV.specs.screenSize')]: '55" 4K OLED',
      [t('Tdevices.smartTV.specs.smartFeatures')]: t('Tdevices.smartTV.specs.smartFeaturesValue'),
      [t('Tdevices.smartTV.specs.voiceControl')]: t('Tdevices.smartTV.specs.voiceControlValue'),
      [t('Tdevices.smartTV.specs.connectivity')]: 'WiFi 6, Bluetooth'
    }
  },
  {
    id: 'sound-system',
    name: t('Tdevices.soundSystem.name'),
    category: 'entertainment',
    price: 2000,
    description: t('Tdevices.soundSystem.description'),
    icon: 'volume-up',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&h=200&fit=crop',
    dimensions: { width: 100, height: 60 },
    specifications: {
      [t('Tdevices.soundSystem.specs.zones')]: t('Tdevices.soundSystem.specs.zonesValue'),
      [t('Tdevices.soundSystem.specs.audioQuality')]: t('Tdevices.soundSystem.specs.audioQualityValue'),
      [t('Tdevices.soundSystem.specs.streaming')]: t('Tdevices.soundSystem.specs.streamingValue'),
      [t('Tdevices.soundSystem.specs.control')]: t('Tdevices.soundSystem.specs.controlValue')
    }
  },
  {
    id: 'voice-assistant',
    name: t('Tdevices.voiceAssistant.name'),
    category: 'entertainment',
    price: 600,
    description: t('Tdevices.voiceAssistant.description'),
    icon: 'microphone',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=200&fit=crop',
    dimensions: { width: 50, height: 50 },
    specifications: {
      [t('Tdevices.voiceAssistant.specs.voiceRecognition')]: t('Tdevices.voiceAssistant.specs.voiceRecognitionValue'),
      [t('Tdevices.voiceAssistant.specs.integration')]: t('Tdevices.voiceAssistant.specs.integrationValue'),
      [t('Tdevices.voiceAssistant.specs.music')]: t('Tdevices.voiceAssistant.specs.musicValue'),
      [t('Tdevices.voiceAssistant.specs.privacy')]: t('Tdevices.voiceAssistant.specs.privacyValue')
    }
  },

  // Kitchen Devices
  {
    id: 'smart-fridge',
    name: t('Tdevices.smartFridge.name'),
    category: 'kitchen',
    price: 2500,
    description: t('Tdevices.smartFridge.description'),
    icon: 'snowflake',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=200&fit=crop',
    dimensions: { width: 150, height: 200 },
    specifications: {
      [t('Tdevices.smartFridge.specs.capacity')]: '28 cu ft',
      [t('Tdevices.smartFridge.specs.features')]: t('Tdevices.smartFridge.specs.featuresValue'),
      [t('Tdevices.smartFridge.specs.energy')]: t('Tdevices.smartFridge.specs.energyValue'),
      [t('Tdevices.smartFridge.specs.connectivity')]: t('Tdevices.smartFridge.specs.connectivityValue')
    }
  },
  {
    id: 'smart-oven',
    name: t('Tdevices.smartOven.name'),
    category: 'kitchen',
    price: 1500,
    description: t('Tdevices.smartOven.description'),
    icon: 'fire',
    image: 'https://images.unsplash.com/photo-1574269910920-11f4d7427859?w=300&h=200&fit=crop',
    dimensions: { width: 120, height: 80 },
    specifications: {
      [t('Tdevices.smartOven.specs.cookingModes')]: t('Tdevices.smartOven.specs.cookingModesValue'),
      [t('Tdevices.smartOven.specs.temperature')]: t('Tdevices.smartOven.specs.temperatureValue'),
      [t('Tdevices.smartOven.specs.safety')]: t('Tdevices.smartOven.specs.safetyValue'),
      [t('Tdevices.smartOven.specs.monitoring')]: t('Tdevices.smartOven.specs.monitoringValue')
    }
  },
  {
    id: 'smart-dishwasher',
    name: t('Tdevices.smartDishwasher.name'),
    category: 'kitchen',
    price: 1200,
    description: t('Tdevices.smartDishwasher.description'),
    icon: 'tint',
    image: 'https://images.unsplash.com/photo-1556909114-c6de04c9efb6?w=300&h=200&fit=crop',
    dimensions: { width: 100, height: 90 },
    specifications: {
      [t('Tdevices.smartDishwasher.specs.capacity')]: t('Tdevices.smartDishwasher.specs.capacityValue'),
      [t('Tdevices.smartDishwasher.specs.efficiency')]: 'ENERGY STAR',
      [t('Tdevices.smartDishwasher.specs.cycles')]: t('Tdevices.smartDishwasher.specs.cyclesValue'),
      [t('Tdevices.smartDishwasher.specs.noise')]: t('Tdevices.smartDishwasher.specs.noiseValue')
    }
  },

  // Additional devices
  {
    id: 'wifi-router',
    name: t('Tdevices.wifiRouter.name'),
    category: 'entertainment',
    price: 800,
    description: t('Tdevices.wifiRouter.description'),
    icon: 'wifi',
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=300&h=200&fit=crop',
    dimensions: { width: 60, height: 40 },
    specifications: {
      [t('Tdevices.wifiRouter.specs.speed')]: t('Tdevices.wifiRouter.specs.speedValue'),
      [t('Tdevices.wifiRouter.specs.coverage')]: t('Tdevices.wifiRouter.specs.coverageValue'),
      [t('Tdevices.wifiRouter.specs.devices')]: t('Tdevices.wifiRouter.specs.devicesValue'),
      [t('Tdevices.wifiRouter.specs.security')]: 'WPA3 encryption'
    }
  }
];

// Function to safely get translated device with fallbacks
export const getTranslatedDevice = (deviceId: string, t: (key: string) => string): Device | undefined => {
  try {
    const translatedDevices = getDevices(t);
    return translatedDevices.find(device => device.id === deviceId);
  } catch (error) {
    console.warn(`Translation failed for device ${deviceId}, falling back to static device:`, error);
    return getDeviceById(deviceId);
  }
};

// Function to get translated devices with error handling
export const getDevicesWithFallback = (t: (key: string) => string): Device[] => {
  try {
    return getDevices(t);
  } catch (error) {
    console.warn('Translation failed, falling back to static devices:', error);
    return devices; // Fallback to static devices
  }
};

// Helper function to get devices by category from translated devices
export const getTranslatedDevicesByCategory = (category: string, t: (key: string) => string): Device[] => {
  const translatedDevices = getDevicesWithFallback(t);
  return translatedDevices.filter(device => device.category === category);
};

// Static devices for backward compatibility
export const devices: Device[] = [
  // Security Devices
  {
    id: 'smart-lock',
    name: 'Smart Door Lock',
    category: 'security',
    price: 800,
    description: 'Keyless entry with mobile app control',
    icon: 'door-closed',
    image: 'https://plus.unsplash.com/premium_photo-1729574858839-5a145c914bac?q=80&w=1188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    dimensions: { width: 80, height: 40 },
    specifications: {
      'Connectivity': 'WiFi, Bluetooth',
      'Battery Life': '12 months',
      'Security': 'AES 128-bit encryption',
      'Compatibility': 'iOS, Android'
    }
  },
  {
    id: 'security-camera',
    name: 'Security Camera System',
    category: 'security',
    price: 1200,
    description: 'HD cameras with night vision & recording',
    icon: 'video',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop',
    dimensions: { width: 60, height: 60 },
    specifications: {
      'Resolution': '4K Ultra HD',
      'Night Vision': 'Up to 30ft',
      'Storage': 'Cloud + Local',
      'Field of View': '130°'
    }
  },
  {
    id: 'motion-sensor',
    name: 'Motion Detection Sensor',
    category: 'security',
    price: 600,
    description: 'Intelligent movement detection system',
    icon: 'walking',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&h=200&fit=crop',
    dimensions: { width: 40, height: 40 },
    specifications: {
      'Detection Range': '40ft',
      'Sensitivity': 'Adjustable',
      'Battery Life': '2 years',
      'Response Time': '<1 second'
    }
  },
  {
    id: 'smoke-detector',
    name: 'Smart Smoke Detector',
    category: 'security',
    price: 400,
    description: 'Connected fire safety with mobile alerts',
    icon: 'fire',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    dimensions: { width: 50, height: 20 },
    specifications: {
      'Detection Type': 'Photoelectric + Ionization',
      'Battery Life': '10 years',
      'Connectivity': 'WiFi',
      'Certification': 'UL Listed'
    }
  },
  {
    id: 'alarm-system',
    name: 'Central Alarm System',
    category: 'security',
    price: 1000,
    description: 'Comprehensive security monitoring',
    icon: 'bell',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=200&fit=crop',
    dimensions: { width: 100, height: 60 },
    specifications: {
      'Zones': 'Up to 32',
      'Monitoring': '24/7 Professional',
      'Backup': 'Cellular + Battery',
      'Integration': 'Smart Home Compatible'
    }
  },
  {
    id: 'video-doorbell',
    name: 'Smart Video Doorbell',
    category: 'security',
    price: 300,
    description: 'Two-way communication with visitors',
    icon: 'doorbell',
    image: 'https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?w=300&h=200&fit=crop',
    dimensions: { width: 50, height: 80 },
    specifications: {
      'Video Quality': '1080p HD',
      'Two-Way Audio': 'Crystal Clear',
      'Motion Detection': 'Advanced AI',
      'Storage': 'Cloud Recording'
    }
  },

  // Lighting Devices
  {
    id: 'smart-bulb',
    name: 'Smart LED Bulb',
    category: 'lighting',
    price: 150,
    description: 'Color-changing smart bulb with app control',
    icon: 'lightbulb',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=300&h=200&fit=crop',
    dimensions: { width: 30, height: 30 },
    specifications: {
      'Colors': '16 million',
      'Brightness': '800 lumens',
      'Energy': '9W LED',
      'Lifespan': '25,000 hours'
    }
  },
  {
    id: 'smart-switch',
    name: 'Smart Light Switch',
    category: 'lighting',
    price: 100,
    description: 'Voice and app controlled light switch',
    icon: 'toggle-on',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop',
    dimensions: { width: 40, height: 70 },
    specifications: {
      'Installation': 'No neutral wire required',
      'Dimming': 'Full range',
      'Voice Control': 'Alexa, Google, Siri',
      'Scheduling': 'Advanced timer functions'
    }
  },
  {
    id: 'motion-light',
    name: 'Motion Sensor Light',
    category: 'lighting',
    price: 200,
    description: 'Automatic lighting with motion detection',
    icon: 'sun',
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=200&fit=crop',
    dimensions: { width: 60, height: 60 },
    specifications: {
      'Detection Range': '20ft',
      'Auto Shut-off': 'Customizable',
      'Brightness': '1200 lumens',
      'Weather Resistant': 'IP65 rated'
    }
  },

  // Climate Control Devices
  {
    id: 'smart-thermostat',
    name: 'Smart Thermostat',
    category: 'climate',
    price: 500,
    description: 'AI-powered climate optimization',
    icon: 'thermometer-half',
    image: 'https://images.unsplash.com/photo-1545259742-b4fd8fea67e4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    dimensions: { width: 80, height: 80 },
    specifications: {
      'Learning': 'AI-powered',
      'Energy Savings': 'Up to 23%',
      'Compatibility': 'Most HVAC systems',
      'Remote Control': 'WiFi enabled'
    }
  },
  {
    id: 'smart-fan',
    name: 'Smart Ceiling Fan',
    category: 'climate',
    price: 200,
    description: 'Remote controlled fan with scheduling',
    icon: 'fan',
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop',
    dimensions: { width: 120, height: 120 },
    specifications: {
      'Speed Settings': '6 speeds',
      'Direction': 'Reversible',
      'Light': 'Integrated LED',
      'Energy': 'DC motor efficiency'
    }
  },
  {
    id: 'smart-blinds',
    name: 'Automated Window Blinds',
    category: 'climate',
    price: 300,
    description: 'Smart blinds and curtain control',
    icon: 'window-maximize',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
    dimensions: { width: 200, height: 150 },
    specifications: {
      'Motor': 'Whisper quiet',
      'Power': 'Rechargeable battery',
      'Control': 'App, voice, schedule',
      'Installation': 'Easy retrofit'
    }
  },

  // Entertainment Devices
  {
    id: 'smart-tv',
    name: 'Smart TV Integration',
    category: 'entertainment',
    price: 1500,
    description: 'Centralized entertainment control',
    icon: 'tv',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=200&fit=crop',
    dimensions: { width: 200, height: 120 },
    specifications: {
      'Screen Size': '55" 4K OLED',
      'Smart Features': 'Built-in streaming',
      'Voice Control': 'Multi-assistant',
      'Connectivity': 'WiFi 6, Bluetooth'
    }
  },
  {
    id: 'sound-system',
    name: 'Whole House Audio',
    category: 'entertainment',
    price: 2000,
    description: 'Multi-room audio streaming system',
    icon: 'volume-up',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&h=200&fit=crop',
    dimensions: { width: 100, height: 60 },
    specifications: {
      'Zones': 'Up to 8 rooms',
      'Audio Quality': 'Hi-Fi stereo',
      'Streaming': 'All major services',
      'Control': 'Voice + App'
    }
  },
  {
    id: 'voice-assistant',
    name: 'Voice Assistant Hub',
    category: 'entertainment',
    price: 600,
    description: 'Voice-controlled home automation',
    icon: 'microphone',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=200&fit=crop',
    dimensions: { width: 50, height: 50 },
    specifications: {
      'Voice Recognition': 'Far-field mics',
      'Integration': '1000+ devices',
      'Music': 'Premium sound quality',
      'Privacy': 'Mute button'
    }
  },

  // Kitchen Devices
  {
    id: 'smart-fridge',
    name: 'Smart Refrigerator',
    category: 'kitchen',
    price: 2500,
    description: 'Connected fridge with inventory tracking',
    icon: 'snowflake',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=200&fit=crop',
    dimensions: { width: 150, height: 200 },
    specifications: {
      'Capacity': '28 cu ft',
      'Features': 'Internal cameras',
      'Energy': 'ENERGY STAR certified',
      'Connectivity': 'WiFi, touchscreen'
    }
  },
  {
    id: 'smart-oven',
    name: 'Smart Oven System',
    category: 'kitchen',
    price: 1500,
    description: 'Remote cooking control and monitoring',
    icon: 'fire',
    image: 'https://images.unsplash.com/photo-1574269910920-11f4d7427859?w=300&h=200&fit=crop',
    dimensions: { width: 120, height: 80 },
    specifications: {
      'Cooking Modes': '12 pre-programmed',
      'Temperature': 'Precise control',
      'Safety': 'Auto shut-off',
      'Monitoring': 'Internal camera'
    }
  },
  {
    id: 'smart-dishwasher',
    name: 'Smart Dishwasher',
    category: 'kitchen',
    price: 1200,
    description: 'Efficient cleaning with app control',
    icon: 'tint',
    image: 'https://images.unsplash.com/photo-1556909114-c6de04c9efb6?w=300&h=200&fit=crop',
    dimensions: { width: 100, height: 90 },
    specifications: {
      'Capacity': '16 place settings',
      'Efficiency': 'ENERGY STAR',
      'Cycles': '8 wash cycles',
      'Noise': 'Ultra-quiet 38dB'
    }
  },

  // Additional devices for more variety
  {
    id: 'wifi-router',
    name: 'Mesh WiFi System',
    category: 'entertainment',
    price: 800,
    description: 'High-speed internet throughout home',
    icon: 'wifi',
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=300&h=200&fit=crop',
    dimensions: { width: 60, height: 40 },
    specifications: {
      'Speed': 'WiFi 6E up to 6Gbps',
      'Coverage': 'Up to 6,000 sq ft',
      'Devices': 'Support 200+ devices',
      'Security': 'WPA3 encryption'
    }
  }
];

export const getDevicesByCategory = (category: string): Device[] => {
  return devices.filter(device => device.category === category);
};

export const getDeviceById = (id: string): Device | undefined => {
  return devices.find(device => device.id === id);
};

export const calculateDeviceCost = (deviceIds: string[]): number => {
  return deviceIds.reduce((total, id) => {
    const device = getDeviceById(id);
    return total + (device?.price || 0);
  }, 0);
};


