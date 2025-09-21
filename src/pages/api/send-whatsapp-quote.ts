// src/pages/api/send-whatsapp-quote.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Twilio } from 'twilio';

interface WhatsAppQuoteRequest {
  phone: string;
  contactInfo: any;
  costBreakdown: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone, contactInfo, costBreakdown }: WhatsAppQuoteRequest = req.body;

  try {
    // Initialize Twilio client
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Format phone number for Saudi Arabia
    const formattedPhone = phone.startsWith('+966') 
      ? phone 
      : phone.startsWith('966')
        ? '+' + phone
        : phone.startsWith('0')
          ? '+966' + phone.slice(1)
          : '+966' + phone;

    // Create WhatsApp message content
    const message = `🏠 *SmartLife - Your Smart Home Quote*

Hello ${contactInfo.firstName}! 

Your personalized smart home quote is ready:

💰 *Total Investment: SAR ${costBreakdown.total.toLocaleString()}*

📋 *What's Included:*
${costBreakdown.devices.map((device: any) => 
  `• ${device.name} (${device.quantity}x) - SAR ${device.totalPrice.toLocaleString()}`
).join('\n')}

✨ *Premium Services Included:*
✅ Professional Installation
✅ 2-Year Warranty
✅ 24/7 Support
✅ Lifetime Updates

🚀 *Next Steps:*
Our team will contact you within 24 hours to schedule your free consultation.

📞 Questions? Call us: +966 11 263 3532
📧 Email: iot@smart-life.sa

*This quote is valid for 30 days*

Thank you for choosing SmartLife! 🌟`;

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${formattedPhone}`,
      body: message,
    });

    res.status(200).json({ 
      success: true, 
      message: 'Quote sent successfully via WhatsApp' 
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send WhatsApp quote' 
    });
  }
}