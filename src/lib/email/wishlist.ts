import emailjs from '@emailjs/browser';
import { serviceId, templateId } from './config';

export async function sendAccessRequestEmail(
  requesterUsername: string,
  targetEmail: string,
) {
  try {
    await emailjs.send(serviceId, templateId, {
      to_email: targetEmail,
      subject: 'New Wishlist Access Request',
      message: `${requesterUsername} has requested access to view your wishlist. Please log in to approve or reject this request.`,
      username: requesterUsername
    });
  } catch (error) {
    console.error('Failed to send access request email:', error);
    throw error;
  }
}

export async function sendAccessApprovedEmail(
  requesterEmail: string,
  targetUsername: string
) {
  try {
    await emailjs.send(serviceId, templateId, {
      to_email: requesterEmail,
      subject: 'Wishlist Access Approved',
      message: `Great news! ${targetUsername} has approved your request to view their wishlist. You can now search for their username to view their items.`,
      username: targetUsername
    });
  } catch (error) {
    console.error('Failed to send access approved email:', error);
    throw error;
  }
}

export async function sendAccessRejectedEmail(
  requesterEmail: string,
  targetUsername: string
) {
  try {
    await emailjs.send(serviceId, templateId, {
      to_email: requesterEmail,
      subject: 'Wishlist Access Request Rejected',
      message: `${targetUsername} has rejected your request to view their wishlist.`,
      username: targetUsername
    });
  } catch (error) {
    console.error('Failed to send access rejected email:', error);
    throw error;
  }
}