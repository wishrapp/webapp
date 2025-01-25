import emailjs from '@emailjs/browser';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

if (!serviceId || !templateId || !publicKey) {
  throw new Error('Missing EmailJS environment variables');
}

emailjs.init(publicKey);

// Token expiry time in milliseconds (48 hours)
export const TOKEN_EXPIRY = 48 * 60 * 60 * 1000;

export { serviceId, templateId };