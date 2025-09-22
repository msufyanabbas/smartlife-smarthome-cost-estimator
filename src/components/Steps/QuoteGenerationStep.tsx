// src/components/Steps/QuoteGenerationStep.tsx
import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaWhatsapp, FaSms, FaDownload, FaPrint, FaShare, FaCheckCircle, FaHome, FaArrowLeft } from 'react-icons/fa';
import { useEstimationStore } from '@/store/estimationStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const QuoteGenerationStep: React.FC = () => {
  const { 
    propertyDetails, 
    floorPlans, 
    selectedDevices, 
    costBreakdown, 
    contactInfo,
    inputMethod,
    setCurrentStep,
    reset
  } = useEstimationStore();

  const { t, isRTL } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(true);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<Record<string, 'idle' | 'sending' | 'sent' | 'error'>>({});

  useEffect(() => {
    // Simulate quote generation process
    const generateQuote = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsGenerating(false);
      setQuoteGenerated(true);
      toast.success(t('toast.quoteReady'));
    };

    generateQuote();
  }, [t]);

  const generateQuotePDF = () => {
    const currentDate = new Date().toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const quoteId = `SL-${Date.now().toString().slice(-6)}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isRTL ? 'ar' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t('steps.quoteGeneration.smartLifeQuote')} ${quoteId} - ${contactInfo.firstName} ${contactInfo.lastName}</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #2c3e50;
                  background: white;
                  padding: 20px;
                  max-width: 800px;
                  margin: 0 auto;
                  direction: ${isRTL ? 'rtl' : 'ltr'};
              }
              
              .quote-container {
                  background: white;
                  border-radius: 20px;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                  border: 2px solid #e9ecef;
              }
              
              .quote-header {
                  background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%);
                  color: white;
                  padding: 40px 30px;
              }
              
              .header-content {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
              }
              
              .company-info h1 {
                  font-size: 32px;
                  font-weight: bold;
                  margin-bottom: 8px;
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
              }
              
              .company-tagline {
                  font-size: 16px;
                  opacity: 0.9;
                  margin-bottom: 20px;
              }
              
              .customer-info {
                  font-size: 20px;
                  font-weight: 600;
                  margin-bottom: 10px;
              }
              
              .quote-details {
                  text-align: ${isRTL ? 'left' : 'right'};
              }
              
              .quote-id {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 5px;
              }
              
              .quote-date {
                  font-size: 14px;
                  opacity: 0.8;
              }
              
              .quote-content {
                  padding: 40px 30px;
              }
              
              .section {
                  margin-bottom: 40px;
              }
              
              .section h2 {
                  color: #483C8E;
                  font-size: 22px;
                  margin-bottom: 20px;
                  border-bottom: 3px solid #C36BA8;
                  padding-bottom: 8px;
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }
              
              .section-icon {
                  width: 24px;
                  height: 24px;
                  background: #C36BA8;
                  border-radius: 50%;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
              }
              
              .property-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                  gap: 20px;
                  margin-top: 20px;
              }
              
              .property-item {
                  background: #f8f9fa;
                  padding: 20px;
                  border-radius: 12px;
                  border-left: 5px solid #C36BA8;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
              }
              
              .property-item .label {
                  color: #6c757d;
                  font-size: 14px;
                  margin-bottom: 8px;
                  font-weight: 500;
              }
              
              .property-item .value {
                  color: #2c3e50;
                  font-weight: bold;
                  font-size: 18px;
                  text-transform: capitalize;
              }
              
              .device-list {
                  background: #f8f9fa;
                  border-radius: 12px;
                  padding: 20px;
                  margin-top: 20px;
              }
              
              .device-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 20px;
                  margin: 12px 0;
                  background: white;
                  border-radius: 10px;
                  border: 1px solid #e9ecef;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              }
              
              .device-info h3 {
                  color: #2c3e50;
                  font-size: 18px;
                  margin-bottom: 6px;
                  font-weight: 600;
              }
              
              .device-info p {
                  color: #6c757d;
                  font-size: 14px;
              }
              
              .device-price {
                  color: #C36BA8;
                  font-weight: bold;
                  font-size: 20px;
              }
              
              .cost-breakdown {
                  background: #f8f9fa;
                  border-radius: 12px;
                  padding: 25px;
                  margin: 20px 0;
              }
              
              .cost-item {
                  display: flex;
                  justify-content: space-between;
                  padding: 12px 0;
                  border-bottom: 1px solid #dee2e6;
              }
              
              .cost-item:last-child {
                  border-bottom: none;
                  font-weight: bold;
                  font-size: 18px;
                  margin-top: 10px;
                  padding-top: 20px;
                  border-top: 2px solid #C36BA8;
              }
              
              .total-section {
                  background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 15px;
                  text-align: center;
                  margin: 30px 0;
                  box-shadow: 0 8px 24px rgba(72, 60, 142, 0.3);
              }
              
              .total-amount {
                  font-size: 42px;
                  font-weight: bold;
                  margin: 20px 0;
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
              }
              
              .total-description {
                  font-size: 18px;
                  opacity: 0.9;
                  margin-bottom: 10px;
              }
              
              .total-note {
                  font-size: 14px;
                  opacity: 0.8;
              }
              
              @media print {
                  body {
                      padding: 0;
                      background: white !important;
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                  }
              }
          </style>
      </head>
      <body>
          <div class="quote-container">
              <div class="quote-header">
                  <div class="header-content">
                      <div class="company-info">
                          <h1>SmartLife</h1>
                          <div class="company-tagline">${t('footer.company.tagline')}</div>
                          <div class="customer-info">
                              ${t('steps.quoteGeneration.quoteFor')} ${contactInfo.firstName} ${contactInfo.lastName}
                          </div>
                      </div>
                      <div class="quote-details">
                          <div class="quote-id">Quote ID: ${quoteId}</div>
                          <div class="quote-date">${t('steps.quoteGeneration.quoteDate')}: ${currentDate}</div>
                      </div>
                  </div>
              </div>
              
              <div class="quote-content">
                  <div class="section">
                      <h2>
                          <span class="section-icon">🏠</span>
                          ${t('steps.quoteGeneration.propertyDetails')}
                      </h2>
                      <div class="property-grid">
                          <div class="property-item">
                              <div class="label">${t('steps.quoteGeneration.propertyValues.propertyType')}</div>
                              <div class="value">${propertyDetails.type}</div>
                          </div>
                          <div class="property-item">
                              <div class="label">${t('steps.quoteGeneration.propertyValues.totalArea')}</div>
                              <div class="value">${propertyDetails.size?.toLocaleString()} sq ft</div>
                          </div>
                          <div class="property-item">
                              <div class="label">${t('steps.quoteGeneration.propertyValues.rooms')}</div>
                              <div class="value">${propertyDetails.rooms}</div>
                          </div>
                          <div class="property-item">
                              <div class="label">${t('steps.quoteGeneration.propertyValues.implementation')}</div>
                              <div class="value">${inputMethod === 'dwg' ? t('steps.quoteGeneration.propertyValues.3dDesign') : t('steps.quoteGeneration.propertyValues.standard')}</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="section">
                      <h2>
                          <span class="section-icon">🔧</span>
                          ${t('steps.quoteGeneration.devicesIncluded')}
                      </h2>
                      <div class="device-list">
                          ${costBreakdown.devices.map((device: any) => `
                              <div class="device-item">
                                  <div class="device-info">
                                      <h3>${device.name}</h3>
                                      <p>${t('steps.quoteGeneration.quantity')} ${device.quantity} × SAR ${device.unitPrice.toLocaleString()}</p>
                                  </div>
                                  <div class="device-price">SAR ${device.totalPrice.toLocaleString()}</div>
                              </div>
                          `).join('')}
                      </div>
                  </div>
                  
                  <div class="total-section">
                      <h2 style="color: white; margin-bottom: 15px; border: none; padding: 0;">${t('costCalculation.totalInvestment')}</h2>
                      <div class="total-amount">SAR ${costBreakdown.total.toLocaleString()}</div>
                      <div class="total-description">${t('steps.quoteGeneration.allInclusive')}</div>
                      <div class="total-note">${t('steps.quoteGeneration.includingVat')}</div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    return htmlContent;
  };

  const handleSendEmail = async () => {
    setSendingStatus(prev => ({ ...prev, email: 'sending' }));
    
    try {
      const response = await fetch('/api/send-email-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contactInfo.email,
          contactInfo,
          propertyDetails,
          costBreakdown,
          selectedDevices: inputMethod === 'manual' ? selectedDevices : [],
          floorPlans: inputMethod === 'dwg' ? floorPlans : [],
          inputMethod
        })
      });

      if (response.ok) {
        setSendingStatus(prev => ({ ...prev, email: 'sent' }));
        toast.success(t('toast.emailSent'));
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      setSendingStatus(prev => ({ ...prev, email: 'error' }));
      toast.error(t('toast.emailFailed'));
    }
  };

  const handleSendWhatsApp = async () => {
    setSendingStatus(prev => ({ ...prev, whatsapp: 'sending' }));
    
    try {
      const response = await fetch('/api/send-whatsapp-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: contactInfo.phone,
          contactInfo,
          costBreakdown
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSendingStatus(prev => ({ ...prev, whatsapp: 'sent' }));
        toast.success(t('toast.whatsappSent'));
      } else {
        setSendingStatus(prev => ({ ...prev, whatsapp: 'error' }));
        toast.error(t('toast.whatsappFailed'));
      }
    } catch (error) {
      setSendingStatus(prev => ({ ...prev, whatsapp: 'error' }));
      toast.error(t('toast.whatsappFailed'));
    }
  };

  const handleSendSMS = async () => {
    setSendingStatus(prev => ({ ...prev, sms: 'sending' }));
    
    try {
      const response = await fetch('/api/send-sms-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: contactInfo.phone,
          contactInfo,
          costBreakdown
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSendingStatus(prev => ({ ...prev, sms: 'sent' }));
        toast.success(t('toast.smsSent'));
      } else {
        setSendingStatus(prev => ({ ...prev, sms: 'error' }));
        toast.error(t('toast.smsFailed'));
      }
    } catch (error) {
      setSendingStatus(prev => ({ ...prev, sms: 'error' }));
      toast.error(t('toast.smsFailed'));
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!costBreakdown || !contactInfo || !propertyDetails) {
        toast.error(t('toast.pdfFailed'));
        return;
      }

      toast.loading(t('common.loading'), { id: 'pdf-generation' });
      
      // Generate PDF content
      const htmlContent = generateQuotePDF();
      
      // Create new window for PDF
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        toast.error(t('toast.pdfFailed'), { id: 'pdf-generation' });
        return;
      }

      // Write content to new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then trigger download
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Close the window after printing/saving
        setTimeout(() => {
          printWindow.close();
        }, 1000);
        
        toast.success(t('toast.pdfGenerated'), { id: 'pdf-generation' });
      }, 500);

    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(t('toast.pdfFailed'), { id: 'pdf-generation' });
    }
  };

  const handlePrint = async () => {
    try {
      if (!costBreakdown || !contactInfo || !propertyDetails) {
        toast.error(t('toast.printFailed'));
        return;
      }

      toast.loading(t('common.loading'), { id: 'print-preparation' });
      
      // Generate print content
      const htmlContent = generateQuotePDF();
      
      // Create new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        toast.error(t('toast.printFailed'), { id: 'print-preparation' });
        return;
      }

      // Write content to new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Close the window after printing
        printWindow.onafterprint = () => {
          printWindow.close();
        };
        
        // For browsers that don't support onafterprint
        setTimeout(() => {
          printWindow.close();
        }, 3000);
        
        toast.success(t('toast.printReady'), { id: 'print-preparation' });
      }, 500);

    } catch (error) {
      console.error('Print error:', error);
      toast.error(t('toast.printFailed'), { id: 'print-preparation' });
    }
  };

  const handleStartNew = () => {
    reset();
    setCurrentStep('input-method');
    toast.success(t('toast.newQuoteReady'));
  };

  const handleBack = () => {
    setCurrentStep('contact-info');
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
            {t('steps.quoteGeneration.generating')}
          </h2>
          
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-accent-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-accent-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('costCalculation.creatingQuote')}</h3>
            
            <div className="space-y-3 text-gray-600">
              {t('steps.quoteGeneration.generatingSteps').split(',').map((step, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 1 }}
                >
                  {step.trim()}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 bg-green-100 text-green-800 px-6 py-3 rounded-full mb-6"
        >
          <FaCheckCircle className="text-xl" />
          <span className="font-semibold">{t('steps.quoteGeneration.quoteReady')}</span>
        </motion.div>
        
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          {t('steps.quoteGeneration.title')}
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          {t('steps.quoteGeneration.subtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quote Display */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Quote Header */}
            <div className="bg-gradient-to-r from-primary-900 to-accent-500 p-8 text-white">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{t('steps.quoteGeneration.smartLifeQuote')}</h3>
                  <p className="opacity-90">
                    {t('steps.quoteGeneration.quoteFor')} {contactInfo.firstName} {contactInfo.lastName}
                  </p>
                </div>
                <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                  <p className="text-sm opacity-80">{t('steps.quoteGeneration.quoteDate')}</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Quote Content */}
            <div className="p-8">
              {/* Property Summary */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('steps.quoteGeneration.propertyDetails')}</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">{t('steps.quoteGeneration.propertyValues.propertyType')}</p>
                    <p className="font-medium text-gray-800 capitalize">{propertyDetails.type}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">{t('steps.quoteGeneration.propertyValues.totalArea')}</p>
                    <p className="font-medium text-gray-800">{propertyDetails.size?.toLocaleString()} sq ft</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">{t('steps.quoteGeneration.propertyValues.rooms')}</p>
                    <p className="font-medium text-gray-800">{propertyDetails.rooms}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">{t('steps.quoteGeneration.propertyValues.implementation')}</p>
                    <p className="font-medium text-gray-800 capitalize">
                      {inputMethod === 'dwg' ? t('steps.quoteGeneration.propertyValues.3dDesign') : t('steps.quoteGeneration.propertyValues.standard')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Device Summary */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{t('steps.quoteGeneration.devicesIncluded')}</h4>
                {costBreakdown && (
                  <div className="space-y-3">
                    {costBreakdown.devices.map(device => (
                      <div key={device.deviceId} className={`flex justify-between items-center p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                          <p className="font-medium text-gray-800">{device.name}</p>
                          <p className="text-sm text-gray-600">{t('steps.quoteGeneration.quantity')} {device.quantity}</p>
                        </div>
                        <p className="font-bold text-accent-600">SAR {device.totalPrice.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              {costBreakdown && (
                <div className="bg-gradient-to-r from-accent-50 to-primary-50 p-6 rounded-2xl">
                  <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{t('costCalculation.totalInvestment')}</h4>
                      <p className="text-gray-600">{t('steps.quoteGeneration.allInclusive')}</p>
                    </div>
                    <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                      <p className="text-3xl font-bold text-accent-600">
                        SAR {costBreakdown.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{t('steps.quoteGeneration.includingVat')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          {/* Send Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('steps.quoteGeneration.sendOptions')}</h3>
            <div className="space-y-3">
              {/* Email */}
              <button
                onClick={handleSendEmail}
                disabled={sendingStatus.email === 'sending'}
                className={`
                  w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                  ${sendingStatus.email === 'sent' 
                    ? 'bg-green-100 border-2 border-green-500' 
                    : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300'
                  }
                  ${isRTL ? 'flex-row-reverse' : ''}
                `}
              >
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <FaEnvelope className="text-blue-600" />
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="font-medium text-gray-800">{t('steps.quoteGeneration.emailQuote')}</p>
                    <p className="text-sm text-gray-600">{contactInfo.email}</p>
                  </div>
                </div>
                {sendingStatus.email === 'sending' && <div className="spinner text-blue-600" />}
                {sendingStatus.email === 'sent' && <FaCheckCircle className="text-green-600" />}
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleSendWhatsApp}
                disabled={sendingStatus.whatsapp === 'sending'}
                className={`
                  w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                  ${sendingStatus.whatsapp === 'sent' 
                    ? 'bg-green-100 border-2 border-green-500' 
                    : 'bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300'
                  }
                  ${isRTL ? 'flex-row-reverse' : ''}
                `}
              >
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <FaWhatsapp className="text-green-600" />
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="font-medium text-gray-800">{t('steps.quoteGeneration.whatsappQuote')}</p>
                    <p className="text-sm text-gray-600">{contactInfo.phone}</p>
                  </div>
                </div>
                {sendingStatus.whatsapp === 'sending' && <div className="spinner text-green-600" />}
                {sendingStatus.whatsapp === 'sent' && <FaCheckCircle className="text-green-600" />}
              </button>

              {/* SMS */}
              <button
                onClick={handleSendSMS}
                disabled={sendingStatus.sms === 'sending'}
                className={`
                  w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                  ${sendingStatus.sms === 'sent' 
                    ? 'bg-green-100 border-2 border-green-500' 
                    : 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-300'
                  }
                  ${isRTL ? 'flex-row-reverse' : ''}
                `}
              >
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <FaSms className="text-purple-600" />
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="font-medium text-gray-800">{t('steps.quoteGeneration.smsQuote')}</p>
                    <p className="text-sm text-gray-600">{t('steps.quoteGeneration.quickSummary')}</p>
                  </div>
                </div>
                {sendingStatus.sms === 'sending' && <div className="spinner text-purple-600" />}
                {sendingStatus.sms === 'sent' && <FaCheckCircle className="text-green-600" />}
              </button>
            </div>
          </motion.div>

          {/* Download & Share */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('steps.quoteGeneration.downloadShare')}</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                className={`w-full border-2 border-accent-500 text-accent-500 bg-transparent font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-accent-500 hover:text-white flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FaDownload />
                {t('steps.quoteGeneration.downloadPdf')}
              </button>
              <button
                onClick={handlePrint}
                className={`w-full bg-gray-100 text-gray-800 border-2 border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 hover:border-accent-500 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FaPrint />
                {t('steps.quoteGeneration.printQuote')}
              </button>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-accent-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('steps.quoteGeneration.nextStepsTitle')}</h3>
            <div className="space-y-3 text-sm text-gray-700">
              {t('steps.quoteGeneration.nextStepsItems').split(',').map((item, index) => (
                <div key={index} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p>{item.trim()}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`flex justify-between mt-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={handleBack}
          className={`bg-gray-100 text-gray-800 border-2 border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-200 hover:border-accent-500 inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <FaArrowLeft className={isRTL ? 'rotate-180' : ''} />
          {t('steps.quoteGeneration.backStep')}
        </button>
        
        <button
          onClick={handleStartNew}
          className={`bg-gradient-to-r from-primary-900 to-accent-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-accent-hover hover:-translate-y-1 inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <FaHome />
          {t('steps.quoteGeneration.startNewQuote')}
        </button>
      </div>
    </div>
  );
};

export default QuoteGenerationStep;