// src/utils/pdfGenerator.ts
export const generateQuotePDF = (
  contactInfo: any,
  propertyDetails: any,
  costBreakdown: any,
  inputMethod: string
) => {
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }

  const currentDate = new Date().toLocaleDateString();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SmartLife Quote - ${contactInfo.firstName} ${contactInfo.lastName}</title>
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
            }
            
            .quote-container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                border: 1px solid #e9ecef;
            }
            
            .quote-header {
                background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%);
                color: white;
                padding: 40px 30px;
                text-align: left;
            }
            
            .quote-header h1 {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .quote-header .customer-info {
                font-size: 18px;
                opacity: 0.9;
                margin-bottom: 20px;
            }
            
            .quote-header .date-info {
                text-align: right;
                font-size: 14px;
                opacity: 0.8;
            }
            
            .quote-content {
                padding: 30px;
            }
            
            .section {
                margin-bottom: 30px;
            }
            
            .section h2 {
                color: #483C8E;
                font-size: 20px;
                margin-bottom: 15px;
                border-bottom: 2px solid #C36BA8;
                padding-bottom: 5px;
            }
            
            .property-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .property-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                border-left: 4px solid #C36BA8;
            }
            
            .property-item .label {
                color: #6c757d;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .property-item .value {
                color: #2c3e50;
                font-weight: bold;
                font-size: 16px;
                text-transform: capitalize;
            }
            
            .device-list {
                list-style: none;
                padding: 0;
            }
            
            .device-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                margin: 10px 0;
                background: #f8f9fa;
                border-radius: 10px;
                border: 1px solid #e9ecef;
            }
            
            .device-info h3 {
                color: #2c3e50;
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .device-info p {
                color: #6c757d;
                font-size: 14px;
            }
            
            .device-price {
                color: #C36BA8;
                font-weight: bold;
                font-size: 18px;
            }
            
            .total-section {
                background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%);
                color: white;
                padding: 25px;
                border-radius: 15px;
                text-align: center;
                margin-top: 30px;
            }
            
            .total-amount {
                font-size: 36px;
                font-weight: bold;
                margin: 15px 0;
            }
            
            .total-description {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .footer-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-top: 30px;
                text-align: center;
                border: 1px solid #e9ecef;
            }
            
            .footer-info h3 {
                color: #483C8E;
                margin-bottom: 10px;
            }
            
            .contact-info {
                color: #6c757d;
                font-size: 14px;
            }
            
            .validity-note {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 10px;
                margin-top: 20px;
                text-align: center;
                font-size: 14px;
            }
            
            @media print {
                body {
                    padding: 0;
                    background: white !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .quote-container {
                    box-shadow: none;
                    border: 1px solid #ddd;
                }
                
                .quote-header {
                    background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%) !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .total-section {
                    background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%) !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="quote-container">
            <div class="quote-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1>SmartLife Professional Quote</h1>
                        <div class="customer-info">
                            For: ${contactInfo.firstName} ${contactInfo.lastName}
                        </div>
                    </div>
                    <div class="date-info">
                        <div>Quote Date</div>
                        <div style="font-weight: bold;">${currentDate}</div>
                    </div>
                </div>
            </div>
            
            <div class="quote-content">
                <div class="section">
                    <h2>Property Details</h2>
                    <div class="property-grid">
                        <div class="property-item">
                            <div class="label">Property Type</div>
                            <div class="value">${propertyDetails.type}</div>
                        </div>
                        <div class="property-item">
                            <div class="label">Total Area</div>
                            <div class="value">${propertyDetails.size?.toLocaleString()} sq ft</div>
                        </div>
                        <div class="property-item">
                            <div class="label">Rooms</div>
                            <div class="value">${propertyDetails.rooms}</div>
                        </div>
                        <div class="property-item">
                            <div class="label">Implementation</div>
                            <div class="value">${inputMethod === 'dwg' ? '3D Design' : 'Standard'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Smart Devices Included</h2>
                    <div class="device-list">
                        ${costBreakdown.devices.map((device: any) => `
                            <div class="device-item">
                                <div class="device-info">
                                    <h3>${device.name}</h3>
                                    <p>Quantity: ${device.quantity}</p>
                                </div>
                                <div class="device-price">SAR ${device.totalPrice.toLocaleString()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="total-section">
                    <h2 style="color: white; margin-bottom: 10px; border: none; padding: 0;">Total Investment</h2>
                    <div class="total-amount">SAR ${costBreakdown.total.toLocaleString()}</div>
                    <div class="total-description">All-inclusive smart home package</div>
                    <div style="margin-top: 15px; font-size: 14px;">Including VAT & Professional Installation</div>
                </div>
                
                <div class="section">
                    <h2>What's Included</h2>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #C36BA8;">✓</span>
                            Professional installation by certified IoT technicians
                        </li>
                        <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #C36BA8;">✓</span>
                            Complete system setup and configuration
                        </li>
                        <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #C36BA8;">✓</span>
                            2-year comprehensive warranty
                        </li>
                        <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #C36BA8;">✓</span>
                            24/7 technical support
                        </li>
                        <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #C36BA8;">✓</span>
                            Lifetime software updates
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-info">
                <h3>SmartLife - Smart Solutions for Modern Living</h3>
                <div class="contact-info">
                    <p>📧 info@smartlife.sa | 📱 +966 11 234 5678</p>
                    <p>📍 Riyadh, Saudi Arabia</p>
                </div>
            </div>
            
            <div class="validity-note">
                <strong>Important:</strong> This quote is valid for 30 days from the date of generation. 
                Prices include VAT and are subject to final site survey.
            </div>
        </div>
    </body>
    </html>
  `;

  return { printWindow, htmlContent };
};