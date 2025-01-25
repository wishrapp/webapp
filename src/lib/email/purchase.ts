import emailjs from '@emailjs/browser';
import { serviceId, templateId } from './config';

export async function sendPurchaseNotification(
  ownerEmail: string,
  ownerUsername: string,
  itemName: string
) {
  try {
    await emailjs.send(serviceId, templateId, {
      to_email: ownerEmail,
      subject: 'Item Purchased from Your Wishlist',
      message: `Hi ${ownerUsername}, someone has purchased "${itemName}" from your wishlist! Log in to your account to view more details.`,
      username: ownerUsername,
      item_name: itemName
    });
  } catch (error) {
    console.error('Failed to send purchase notification:', error);
    throw error;
  }
}