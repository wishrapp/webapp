import emailjs from '@emailjs/browser';
import { serviceId, templateId } from './config';

export async function sendVerificationEmail(_email: string, _userId: string) {
  // Let Supabase handle the verification email
  // We don't need to send our own verification email
  return;
}

export async function sendAccountSuspendedEmail(email: string, username: string) {
  try {
    await emailjs.send(serviceId, templateId, {
      to_email: email,
      subject: 'Account Suspended',
      message: `Hi ${username}, your account has been suspended. Please contact support for more information.`,
      username
    });
  } catch (error) {
    console.error('Failed to send account suspended email:', error);
    throw error;
  }
}

export async function sendAccountDeletedEmail(email: string, username: string) {
  try {
    await emailjs.send(serviceId, templateId, {
      to_email: email,
      subject: 'Account Deleted',
      message: `Hi ${username}, your account has been deleted as requested. We're sorry to see you go!`,
      username
    });
  } catch (error) {
    console.error('Failed to send account deleted email:', error);
    throw error;
  }
}