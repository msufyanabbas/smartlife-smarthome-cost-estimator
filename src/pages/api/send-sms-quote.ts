// src/pages/api/send-sms-quote.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Twilio } from 'twilio';

interface SMSQuoteRequest {
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

  const { phone, contactInfo, costBreakdown }: SMSQuoteRequest = req.body;

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

    // Create concise SMS message (SMS has character limits)
    const message = `SmartLife Quote Ready!

Hi ${contactInfo.firstName},

Your smart home quote: SAR ${costBreakdown.total.toLocaleString()}
Includes: ${costBreakdown.devices.length} devices + professional installation + 2-year warranty

Our team will call you within 24hrs.

Call now: +966 11 263 3532
Email sent with full details.

SmartLife - Smart Solutions`;

    await client.messages.create({
      from: process.env.TWILIO_PHONE_FROM,
      to: formattedPhone,
      body: message,
    });

    res.status(200).json({ 
      success: true, 
      message: 'Quote summary sent successfully via SMS' 
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send SMS quote' 
    });
  }
}