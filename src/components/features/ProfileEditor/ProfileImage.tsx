import { useState, useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { uploadProfileImage } from '../../../lib/image';
import { User } from 'lucide-react';

interface ProfileImageProps {
  userId: string;
  imageUrl: string | null;
  onImageUpdate: (url: string) => void;
}

export default function ProfileImage({ userId, imageUrl, onImageUpdate }: ProfileImageProps) {
  const supabase = useSupabaseClient<Database>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setUploadProgress(0);
      setUploadError(null);

      setUploadProgress(10);
      const publicUrl = await uploadProfileImage(userId, file);
      setUploadProgress(90);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);
      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      setUploadProgress(0);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          {uploadProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <span className="text-white font-semibold">{uploadProgress}%</span>
            </div>
          )}
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Change Photo
          </button>
          <p className="mt-1 text-sm text-gray-500">
            JPG, PNG or GIF (max. 5MB)
          </p>
          {uploadError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}