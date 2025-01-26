import { supabase } from './supabase';

// Maximum dimensions for compressed images
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const COMPRESSION_QUALITY = 0.8;

export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width > height) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        } else {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      // Set canvas dimensions and draw image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
          URL.revokeObjectURL(img.src);
        },
        'image/webp',
        COMPRESSION_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Compress the image
    const compressedImage = await compressImage(file);

    // Create a new file with .webp extension
    const filename = `${userId}-${Date.now()}.webp`;
    const webpFile = new File([compressedImage], filename, { type: 'image/webp' });

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filename, webpFile, {
        cacheControl: '3600',
        upsert: true // Enable overwriting of existing files
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error('Failed to upload image to storage');
    }

    if (!data?.path) {
      throw new Error('No path returned from storage upload');
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(data.path);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    throw error instanceof Error ? error : new Error('Failed to upload image');
  }
}

export async function uploadWishlistImage(userId: string, file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Compress the image
    const compressedImage = await compressImage(file);

    // Create a new file with .webp extension
    const filename = `${userId}-${Date.now()}.webp`;
    const webpFile = new File([compressedImage], filename, { type: 'image/webp' });

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('wishlist-images')
      .upload(filename, webpFile, {
        cacheControl: '3600',
        upsert: true // Enable overwriting of existing files
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error('Failed to upload image to storage');
    }

    if (!data?.path) {
      throw new Error('No path returned from storage upload');
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wishlist-images')
      .getPublicUrl(data.path);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadWishlistImage:', error);
    throw error instanceof Error ? error : new Error('Failed to upload image');
  }
}