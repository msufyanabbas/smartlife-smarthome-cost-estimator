// src/components/Steps/FloorUploadStep.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFile, FaTrash, FaCheckCircle, FaArrowRight, FaArrowLeft, FaEye } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
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

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);

  const totalFloors = propertyDetails.floors || 1;
  const requiredUploads = Array.from({ length: totalFloors }, (_, i) => i + 1);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload
    newFiles.forEach((uploadedFile, index) => {
      simulateUpload(uploadedFile, uploadedFiles.length + index);
    });
  }, [uploadedFiles.length]);

  const simulateUpload = (uploadedFile: UploadedFile, index: number) => {
    setUploadedFiles(prev => 
      prev.map((file, idx) => 
        idx === index ? { ...file, status: 'uploading' as const } : file
      )
    );

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      setUploadedFiles(prev => 
        prev.map((file, idx) => 
          idx === index ? { ...file, progress: Math.min(progress, 100) } : file
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        
        // Create floor plan entry
        const floorPlan: FloorPlan = {
          id: `floor-${currentFloorIndex + 1}-${Date.now()}`,
          floorNumber: currentFloorIndex + 1,
          name: `Floor ${currentFloorIndex + 1}`,
          dwgFile: uploadedFile.file,
          devices: [],
          dimensions: { width: 1000, height: 800 },
          scale: 1
        };

        addFloorPlan(floorPlan);

        setUploadedFiles(prev => 
          prev.map((file, idx) => 
            idx === index ? { ...file, status: 'completed' as const, progress: 100 } : file
          )
        );
      }
    }, 200);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/acad': ['.dwg'],
      'application/x-dwg': ['.dwg'],
      'image/*': ['.png', '.jpg', '.jpeg'] // Also accept images for demo
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
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

  const handleNext = () => {
    const completedUploads = uploadedFiles.filter(file => file.status === 'completed').length;
    if (completedUploads >= totalFloors) {
      setCurrentStep('device-placement');
    }
  };

  const handleBack = () => {
    setCurrentStep('property-details');
  };

  const getFloorUploadStatus = (floorNumber: number) => {
    const hasUpload = uploadedFiles.some((file, index) => 
      file.status === 'completed' && index + 1 === floorNumber
    );
    return hasUpload ? 'completed' : 'pending';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Upload Your Floor Plans
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Upload DWG files for each floor. We'll process them for precise device placement.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Floor Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Floors to Upload</h3>
            <div className="space-y-3">
              {requiredUploads.map((floorNum) => {
                const status = getFloorUploadStatus(floorNum);
                const isActive = currentFloorIndex + 1 === floorNum;
                
                return (
                  <button
                    key={floorNum}
                    onClick={() => setCurrentFloorIndex(floorNum - 1)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-accent-50 border-2 border-accent-500' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : isActive 
                            ? 'bg-accent-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }
                      `}>
                        {status === 'completed' ? <FaCheckCircle /> : floorNum}
                      </div>
                      <span className={`font-medium ${isActive ? 'text-accent-700' : 'text-gray-700'}`}>
                        Floor {floorNum}
                      </span>
                    </div>
                    {status === 'completed' && (
                      <FaCheckCircle className="text-green-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-2">Upload Progress</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(uploadedFiles.filter(f => f.status === 'completed').length / totalFloors) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {uploadedFiles.filter(f => f.status === 'completed').length}/{totalFloors}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Upload Floor {currentFloorIndex + 1}
              </h3>
              <p className="text-gray-600">
                Drag and drop your DWG file or click to browse
              </p>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`
                file-upload-zone
                ${isDragActive ? 'drag-active' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-lg text-accent-600 font-medium">Drop your file here...</p>
                ) : (
                  <>
                    <p className="text-lg text-gray-700 font-medium mb-2">
                      Choose DWG file or drag it here
                    </p>
                    <p className="text-gray-500 text-sm">
                      Supports .dwg files up to 50MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* File List */}
            <AnimatePresence>
              {uploadedFiles.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 space-y-3"
                >
                  <h4 className="font-medium text-gray-800">Uploaded Files</h4>
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaFile className="text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {file.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        
                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-accent-500 h-1.5 rounded-full transition-all duration-200"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploading... {Math.round(file.progress)}%
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {file.status === 'completed' && (
                          <FaCheckCircle className="text-green-500" />
                        )}
                        {file.status === 'uploading' && (
                          <div className="spinner text-accent-500" />
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                        {file.status === 'completed' && (
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <FaEye />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Requirements */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">File Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• AutoCAD DWG format preferred</li>
                <li>• Maximum file size: 50MB</li>
                <li>• Include dimensions and scale information</li>
                <li>• One file per floor level</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <FaArrowLeft />
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={uploadedFiles.filter(f => f.status === 'completed').length < totalFloors}
          className="btn-primary inline-flex items-center gap-2"
        >
          Next: Place Devices
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default FloorUploadStep;