// src/components/Steps/FloorUploadStep.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFile, FaTrash, FaCheckCircle, FaArrowRight, FaArrowLeft, FaEye, FaPlus } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FloorPlan, UploadedFile } from '@/types';

const FloorUploadStep: React.FC = () => {
  const { 
    propertyDetails, 
    floorPlans, 
    addFloorPlan, 
    removeFloorPlan, 
    setCurrentStep 
  } = useEstimationStore();

  const { t, isRTL } = useLanguage();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFloorForUpload, setSelectedFloorForUpload] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);

  const totalFloors = propertyDetails.floors || 1;
  const requiredUploads = Array.from({ length: totalFloors }, (_, i) => i + 1);

  // Create preview URL for uploaded files
  const createFilePreview = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return '';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isUploading) return;
    
    setIsUploading(true);
    
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process files for the selected floor
    newFiles.forEach((uploadedFile, index) => {
      simulateUpload(uploadedFile, index, selectedFloorForUpload);
    });
  }, [selectedFloorForUpload, isUploading]);

  const simulateUpload = (uploadedFile: UploadedFile, fileIndex: number, floorNumber: number) => {
    const globalFileIndex = uploadedFiles.length + fileIndex;
    
    setUploadedFiles(prev => 
      prev.map((file, idx) => 
        idx === globalFileIndex ? { ...file, status: 'uploading' as const } : file
      )
    );

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10; // Faster progress
      
      setUploadedFiles(prev => 
        prev.map((file, idx) => 
          idx === globalFileIndex ? { ...file, progress: Math.min(progress, 100) } : file
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        
        // Check if floor already exists
        const existingFloor = floorPlans.find(plan => plan.floorNumber === floorNumber);
        
        if (existingFloor) {
          // Update existing floor plan
          removeFloorPlan(existingFloor.id);
        }

        // Create new floor plan entry
        const floorPlan: FloorPlan = {
          id: `floor-${floorNumber}-${Date.now()}`,
          floorNumber: floorNumber,
          name: isRTL ? `الطابق ${floorNumber}` : `Floor ${floorNumber}`,
          dwgFile: uploadedFile.file,
          devices: [],
          dimensions: { width: 1000, height: 800 },
          scale: 1,
          previewUrl: createFilePreview(uploadedFile.file)
        };

        addFloorPlan(floorPlan);

        setUploadedFiles(prev => 
          prev.map((file, idx) => 
            idx === globalFileIndex ? { ...file, status: 'completed' as const, progress: 100 } : file
          )
        );
        
        // Auto-select next floor for upload if available
        const nextFloor = floorNumber + 1;
        if (nextFloor <= totalFloors && !getFloorPlan(nextFloor)) {
          setSelectedFloorForUpload(nextFloor);
        }
        
        setIsUploading(false);
      }
    }, 100);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/acad': ['.dwg'],
      'application/x-dwg': ['.dwg'],
      'application/dxf': ['.dxf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false, // Only allow one file per floor
    maxFiles: 1,
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Remove corresponding floor plan if it exists
    const correspondingFloorPlan = floorPlans.find(plan => 
      plan.dwgFile === fileToRemove.file
    );
    if (correspondingFloorPlan) {
      removeFloorPlan(correspondingFloorPlan.id);
    }
  };

  const removeFloorFile = (floorNumber: number) => {
    const floorPlan = getFloorPlan(floorNumber);
    if (floorPlan) {
      removeFloorPlan(floorPlan.id);
      
      // Also remove from uploaded files
      setUploadedFiles(prev => 
        prev.filter(file => file.file !== floorPlan.dwgFile)
      );
    }
  };

  const getFloorPlan = (floorNumber: number): FloorPlan | undefined => {
    return floorPlans.find(plan => plan.floorNumber === floorNumber);
  };

  const getFloorUploadStatus = (floorNumber: number): 'completed' | 'pending' | 'selected' => {
    const floorPlan = getFloorPlan(floorNumber);
    if (floorPlan) return 'completed';
    if (floorNumber === selectedFloorForUpload) return 'selected';
    return 'pending';
  };

  const getUploadedFloorCount = () => {
    return floorPlans.length;
  };

  const handleNext = () => {
    if (getUploadedFloorCount() >= 1) {
      setCurrentStep('device-placement');
    }
  };

  const handleBack = () => {
    setCurrentStep('property-details');
  };

  const handleFloorSelect = (floorNumber: number) => {
    if (!isUploading && !getFloorPlan(floorNumber)) {
      setSelectedFloorForUpload(floorNumber);
    }
  };

  const canSelectFloor = (floorNumber: number): boolean => {
    return !isUploading && !getFloorPlan(floorNumber);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-12">
        <h2 className={`text-3xl lg:text-4xl font-bold text-white mb-4 ${
          isRTL ? 'font-arabic' : ''
        }`}>
          {t('steps.floorUpload.title')}
        </h2>
        <p className={`text-xl text-white/80 max-w-3xl mx-auto ${
          isRTL ? 'font-arabic' : ''
        }`}>
          {t('steps.floorUpload.subtitle')}
        </p>
      </div>

      <div className={`grid lg:grid-cols-3 gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Floor Selection */}
        <div className={`lg:col-span-1 ${isRTL ? 'lg:order-3' : 'lg:order-1'}`}>
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className={`text-xl font-semibold text-gray-800 mb-4 ${
              isRTL ? 'font-arabic text-right' : ''
            }`}>
              {t('steps.floorUpload.floorsToUpload')}
            </h3>
            <div className="space-y-3">
              {requiredUploads.map((floorNum) => {
                const status = getFloorUploadStatus(floorNum);
                const floorPlan = getFloorPlan(floorNum);
                const isClickable = canSelectFloor(floorNum);
                
                return (
                  <div
                    key={floorNum}
                    onClick={() => handleFloorSelect(floorNum)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border-2
                      ${status === 'completed' 
                        ? 'bg-green-50 border-green-500' 
                        : status === 'selected'
                          ? 'bg-accent-50 border-accent-500' 
                          : isClickable
                            ? 'bg-gray-50 border-gray-300 hover:border-accent-400 cursor-pointer'
                            : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                      }
                      ${isRTL ? 'flex-row-reverse' : ''}
                    `}
                  >
                    <div className={`flex items-center gap-3 ${
                      isRTL ? 'flex-row-reverse' : ''
                    }`}>
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : status === 'selected'
                            ? 'bg-accent-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }
                      `}>
                        {status === 'completed' ? <FaCheckCircle /> : floorNum}
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                        <span className={`font-medium ${
                          status === 'completed' ? 'text-green-700' : 
                          status === 'selected' ? 'text-accent-700' : 'text-gray-700'
                        } ${isRTL ? 'font-arabic' : ''}`}>
                          {isRTL ? `الطابق ${floorNum}` : `Floor ${floorNum}`}
                        </span>
                        {status === 'selected' && (
                          <p className="text-xs text-accent-600 mt-1">
                            Click to upload floor plan
                          </p>
                        )}
                        {status === 'completed' && floorPlan?.dwgFile && (
                          <p className="text-xs text-green-600 mt-1 truncate max-w-32">
                            {floorPlan.dwgFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === 'completed' && (
                        <>
                          <FaCheckCircle className="text-green-500" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFloorFile(floorNum);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove floor plan"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </>
                      )}
                      {status === 'selected' && !isUploading && (
                        <FaPlus className="text-accent-500" />
                      )}
                      {isUploading && status === 'selected' && (
                        <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
              <div className={`text-sm text-gray-600 mb-2 ${
                isRTL ? 'font-arabic text-right' : ''
              }`}>
                {t('steps.floorUpload.uploadProgress')}
              </div>
              <div className={`flex items-center gap-2 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(getUploadedFloorCount() / totalFloors) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {getUploadedFloorCount()}/{totalFloors}
                </span>
              </div>
            </div>

            {/* Current Selection Info */}
            {getFloorUploadStatus(selectedFloorForUpload) === 'selected' && (
              <div className="mt-4 p-3 bg-accent-100 rounded-lg border border-accent-300">
                <p className="text-sm font-medium text-accent-800">
                  Ready to upload: {isRTL ? `الطابق ${selectedFloorForUpload}` : `Floor ${selectedFloorForUpload}`}
                </p>
                <p className="text-xs text-accent-600 mt-1">
                  Use the upload area to add a floor plan for this floor
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className={`lg:col-span-2 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h3 className={`text-xl font-semibold text-gray-800 mb-2 ${
                isRTL ? 'font-arabic text-right' : ''
              }`}>
                Upload Floor Plan for {isRTL ? `الطابق ${selectedFloorForUpload}` : `Floor ${selectedFloorForUpload}`}
              </h3>
              <p className={`text-gray-600 ${
                isRTL ? 'font-arabic text-right' : ''
              }`}>
                {getFloorPlan(selectedFloorForUpload) 
                  ? 'Floor plan already uploaded. Select a different floor or replace this one.'
                  : 'Drag and drop your floor plan file or click to browse'}
              </p>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                ${getFloorPlan(selectedFloorForUpload)
                  ? 'border-green-300 bg-green-50 opacity-75'
                  : isDragActive 
                    ? 'border-accent-500 bg-accent-50' 
                    : isUploading
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-accent-400 hover:bg-gray-50 cursor-pointer'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                {isUploading ? (
                  <>
                    <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg text-accent-600 font-medium">
                      Uploading floor plan...
                    </p>
                  </>
                ) : getFloorPlan(selectedFloorForUpload) ? (
                  <>
                    <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
                    <p className="text-lg text-green-600 font-medium mb-2">
                      Floor plan uploaded successfully
                    </p>
                    <p className="text-gray-500 text-sm">
                      {getFloorPlan(selectedFloorForUpload)?.dwgFile?.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Drop a new file to replace this floor plan
                    </p>
                  </>
                ) : isDragActive ? (
                  <p className={`text-lg text-accent-600 font-medium ${
                    isRTL ? 'font-arabic' : ''
                  }`}>
                    {t('steps.floorUpload.dropzoneActive')}
                  </p>
                ) : (
                  <>
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className={`text-lg text-gray-700 font-medium mb-2 ${
                      isRTL ? 'font-arabic' : ''
                    }`}>
                      Drop floor plan here or click to browse
                    </p>
                    <p className={`text-gray-500 text-sm ${
                      isRTL ? 'font-arabic' : ''
                    }`}>
                      Supports DWG, DXF, PNG, JPG, PDF files up to 50MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Uploaded Floors Summary */}
            {floorPlans.length > 0 && (
              <div className="mt-8">
                <h4 className={`font-medium text-gray-800 mb-4 ${
                  isRTL ? 'font-arabic text-right' : ''
                }`}>
                  Uploaded Floor Plans ({floorPlans.length})
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {floorPlans
                    .sort((a, b) => (a.floorNumber || 0) - (b.floorNumber || 0))
                    .map((floor) => (
                    <div key={floor.id} className={`flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200 ${
                      isRTL ? 'flex-row-reverse' : ''
                    }`}>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaCheckCircle className="text-green-600" />
                      </div>
                      
                      <div className={`flex-1 min-w-0 ${
                        isRTL ? 'text-right' : ''
                      }`}>
                        <p className={`font-medium text-green-800 ${
                          isRTL ? 'font-arabic' : ''
                        }`}>
                          {floor.name}
                        </p>
                        <p className="text-sm text-green-600 truncate">
                          {floor.dwgFile?.name}
                        </p>
                        <p className="text-xs text-green-500">
                          {floor.dwgFile ? (floor.dwgFile.size / (1024 * 1024)).toFixed(2) + ' MB' : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFloorFile(floor.floorNumber || 1)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Remove floor plan"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Requirements */}
            {/* <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className={`font-medium text-blue-800 mb-2 ${
                isRTL ? 'font-arabic text-right' : ''
              }`}>
                File Requirements:
              </h4>
              <ul className={`text-sm text-blue-700 space-y-1 ${
                isRTL ? 'font-arabic text-right' : ''
              }`}>
                <li>• Supported formats: DWG, DXF, PNG, JPG, PDF</li>
                <li>• Maximum file size: 50MB per file</li>
                <li>• Upload {totalFloors} floor plan{totalFloors > 1 ? 's' : ''} for your property</li>
                <li>• Floor plans should be clear and properly scaled</li>
                <li>• Click on a floor number to select it for upload</li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`flex justify-between mt-8 ${
        isRTL ? 'flex-row-reverse' : ''
      }`}>
        <button
          onClick={handleBack}
          className={`bg-gray-100 text-gray-800 border-2 border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 hover:border-accent-500 inline-flex items-center gap-2 ${
            isRTL ? 'flex-row-reverse font-arabic' : ''
          }`}
        >
          {isRTL ? <FaArrowRight /> : <FaArrowLeft />}
          {t('navigation.back')}
        </button>
        
        <button
          onClick={handleNext}
          disabled={getUploadedFloorCount() < 1}
          className={`font-semibold py-3 px-6 rounded-xl transition-all duration-300 inline-flex items-center gap-2 ${
            getUploadedFloorCount() >= 1
              ? 'bg-gradient-to-r from-primary-900 to-accent-500 text-white hover:shadow-accent-hover hover:-translate-y-1'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
        >
          Continue to Device Placement
          {isRTL ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
      </div>
    </div>
  );
};

export default FloorUploadStep;