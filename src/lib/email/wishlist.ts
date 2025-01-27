import emailjs from '@emailjs/browser';
import { serviceId, templateId } from './config';

export async function sendAccessRequestEmail(
  requesterUsername: string,
  targetEmail: string,
) {
  if (!targetEmail) {
    throw new Error('Target email address is required');
  }

  try {
    await emailjs.send(serviceId, templateId, {
      to_email: targetEmail,
      subject: 'New Wishlist Access Request',
      message: `${requesterUsername} has requested access to view your wishlist. Please log in to approve or reject this request.`,
      username: requesterUsername,
      // Add required EmailJS template variables
      template_id: templateId,
      user_name: requesterUsername,
      user_email: targetEmail
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
  if (!requesterEmail) {
    throw new Error('Requester email address is required');
  }

  try {
    await emailjs.send(serviceId, templateId, {
      to_email: requesterEmail,
      subject: 'Wishlist Access Approved',
      message: `Great news! ${targetUsername} has approved your request to view their wishlist. You can now search for their username to view their items.`,
      username: targetUsername,
      // Add required EmailJS template variables
      template_id: templateId,
      user_name: targetUsername,
      user_email: requesterEmail
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
  if (!requesterEmail) {
    throw new Error('Requester email address is required');
  }

  try {
    await emailjs.send(serviceId, templateId, {
      to_email: requesterEmail,
      subject: 'Wishlist Access Request Rejected',
      message: `${targetUsername} has rejected your request to view their wishlist.`,
      username: targetUsername,
      // Add required EmailJS template variables
      template_id: templateId,
      user_name: targetUsername,
      user_email: requesterEmail
    });
  } catch (error) {
    console.error('Failed to send access rejected email:', error);
    throw error;
  }
}