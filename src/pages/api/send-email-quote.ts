// src/pages/api/send-email-quote.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

interface EmailQuoteRequest {
  to: string;
  contactInfo: any;
  propertyDetails: any;
  costBreakdown: any;
  selectedDevices?: any[];
  floorPlans?: any[];
  inputMethod: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    to,
    contactInfo,
    propertyDetails,
    costBreakdown,
    selectedDevices = [],
    floorPlans = [],
    inputMethod
  }: EmailQuoteRequest = req.body;

  try {
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generate HTML email template
    const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your SmartLife Quote</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                background-color: #f8f9fa;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: bold;
            }
            .content {
                padding: 40px 30px;
            }
            .section {
                margin-bottom: 30px;
                padding: 20px;
                border-radius: 12px;
                background-color: #f8f9fa;
            }
            .section h2 {
                color: #483C8E;
                margin-top: 0;
                font-size: 20px;
            }
            .property-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            .property-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #C36BA8;
            }
            .device-list {
                list-style: none;
                padding: 0;
            }
            .device-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                margin: 8px 0;
                background: white;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            .total-section {
                background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%);
                color: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                margin: 30px 0;
            }
            .total-amount {
                font-size: 32px;
                font-weight: bold;
                margin: 10px 0;
            }
            .footer {
                background-color: #2c3e50;
                color: white;
                padding: 30px;
                text-align: center;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #483C8E 0%, #C36BA8 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏠 SmartLife Professional Quote</h1>
                <p>Your Personalized Smart Home Estimate</p>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2>Hello ${contactInfo.firstName} ${contactInfo.lastName}!</h2>
                    <p>Thank you for choosing SmartLife for your smart home transformation. Below is your comprehensive quote based on your requirements.</p>
                </div>

                <div class="section">
                    <h2>📋 Property Details</h2>
                    <div class="property-grid">
                        <div class="property-item">
                            <strong>Property Type:</strong><br>
                            ${propertyDetails.type?.charAt(0).toUpperCase()}${propertyDetails.type?.slice(1)}
                        </div>
                        <div class="property-item">
                            <strong>Total Area:</strong><br>
                            ${propertyDetails.size?.toLocaleString()} sq ft
                        </div>
                        <div class="property-item">
                            <strong>Rooms:</strong><br>
                            ${propertyDetails.rooms}
                        </div>
                        <div class="property-item">
                            <strong>Implementation:</strong><br>
                            ${inputMethod === 'dwg' ? '3D Design with Floor Plans' : 'Standard Installation'}
                        </div>
                    </div>
                </div>

                ${costBreakdown ? `
                <div class="section">
                    <h2>🔧 Smart Devices & Services</h2>
                    <ul class="device-list">
                        <li class="device-item">
                            <div>
                                <strong>Base Installation Package</strong><br>
                                <small>Professional setup and configuration</small>
                            </div>
                            <strong>SAR ${costBreakdown.baseInstallation.toLocaleString()}</strong>
                        </li>
                        ${costBreakdown.devices.map((device: any) => `
                            <li class="device-item">
                                <div>
                                    <strong>${device.name}</strong><br>
                                    <small>Quantity: ${device.quantity} × SAR ${device.unitPrice.toLocaleString()}</small>
                                </div>
                                <strong>SAR ${device.totalPrice.toLocaleString()}</strong>
                            </li>
                        `).join('')}
                        <li class="device-item">
                            <div>
                                <strong>Professional Installation & Setup</strong><br>
                                <small>Certified technicians and testing</small>
                            </div>
                            <strong>SAR ${costBreakdown.labor.toLocaleString()}</strong>
                        </li>
                        <li class="device-item">
                            <div>
                                <strong>VAT (15%)</strong><br>
                                <small>As per Saudi Arabia regulations</small>
                            </div>
                            <strong>SAR ${costBreakdown.tax.toLocaleString()}</strong>
                        </li>
                    </ul>
                </div>

                <div class="total-section">
                    <h2>💰 Total Investment</h2>
                    <div class="total-amount">SAR ${costBreakdown.total.toLocaleString()}</div>
                    <p>All-inclusive smart home package with 2-year warranty</p>
                </div>
                ` : ''}

                <div class="section">
                    <h2>✨ What's Included</h2>
                    <ul style="list-style-type: none; padding: 0;">
                        <li style="margin: 10px 0;">✅ Professional installation by certified IoT technicians</li>
                        <li style="margin: 10px 0;">✅ Complete system setup and configuration</li>
                        <li style="margin: 10px 0;">✅ SmartLife mobile app training</li>
                        <li style="margin: 10px 0;">✅ 2-year comprehensive warranty</li>
                        <li style="margin: 10px 0;">✅ 24/7 technical support</li>
                        <li style="margin: 10px 0;">✅ Lifetime software updates</li>
                        <li style="margin: 10px 0;">✅ Annual maintenance checkup</li>
                    </ul>
                </div>

                <div class="section">
                    <h2>🚀 Next Steps</h2>
                    <p><strong>1.</strong> Our team will contact you within 24 hours</p>
                    <p><strong>2.</strong> Schedule a free in-home consultation</p>
                    <p><strong>3.</strong> Professional installation in 1-2 weeks</p>
                    <p><strong>4.</strong> Enjoy your smart home with full support</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="tel:+966112633532" class="cta-button">📞 Call Us: +966 11 263 3532</a>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <h3>SmartLife - Smart Solutions for Modern Living</h3>
                <p>📧 iot@smart-life.sa | 📱 +966 11 263 3532</p>
                <p>📍 Riyadh, Saudi Arabia</p>
                <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
                    This quote is valid for 30 days. Prices include VAT and are subject to site survey.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"SmartLife" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `Your SmartLife Smart Home Quote - SAR ${costBreakdown?.total.toLocaleString() || 'N/A'}`,
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Quote sent successfully via email' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email quote' 
    });
  }
}