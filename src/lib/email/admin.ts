import emailjs from '@emailjs/browser';
import { serviceId, templateId } from './config';

export async function sendAdminBroadcastEmail(
  recipients: string[],
  subject: string,
  message: string
) {
  try {
    // Send emails in batches of 10
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(
        batch.map(email =>
          emailjs.send(serviceId, templateId, {
            to_email: email,
            subject,
            message
          })
        )
      );
    }
  } catch (error) {
    console.error('Failed to send admin broadcast:', error);
    throw error;
  }
}