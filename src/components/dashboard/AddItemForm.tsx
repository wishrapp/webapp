import { useState, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { uploadWishlistImage } from '../../lib/image';

type Occasion = Database['public']['Tables']['occasions']['Row'];

interface ItemForm {
  name: string;
  description: string;
  price: string;
  occasion_id: string;
  item_url: string;
  image_url: string;
}

const initialFormState: ItemForm = {
  name: '',
  description: '',
  price: '',
  occasion_id: '',
  item_url: '',
  image_url: '',
};

interface AddItemFormProps {
  occasions: Occasion[];
  onSubmit: (formData: any) => Promise<boolean>;
  onClose: () => void;
}

export default function AddItemForm({ occasions, onSubmit, onClose }: AddItemFormProps) {
  const session = useSession();
  const [formState, setFormState] = useState<ItemForm>(initialFormState);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    try {
      setUploadProgress(0);
      setUploadError(null);

      setUploadProgress(10);
      const publicUrl = await uploadWishlistImage(session.user.id, file);
      setUploadProgress(90);

      setFormState(prev => ({ ...prev, image_url: publicUrl }));
      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onSubmit(formState);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Add New Item</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formState.price}
                  onChange={e => setFormState({ ...formState, price: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  value={formState.description}
                  onChange={e => setFormState({ ...formState, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Occasion</label>
                <select
                  value={formState.occasion_id}
                  onChange={e => setFormState({ ...formState, occasion_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select an occasion</option>
                  {occasions.map(occasion => (
                    <option key={occasion.id} value={occasion.id}>
                      {occasion.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Item URL</label>
                <input
                  type="url"
                  value={formState.item_url}
                  onChange={e => setFormState({ ...formState, item_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="flex items-center space-x-6">
                    {formState.image_url ? (
                      <div className="relative">
                        <img
                          src={formState.image_url}
                          alt="Item preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        {uploadProgress > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <span className="text-white font-semibold">{uploadProgress}%</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No image</span>
                      </div>
                    )}
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
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {formState.image_url ? 'Change Image' : 'Upload Image'}
                      </button>
                      <p className="mt-1 text-sm text-gray-500">
                        JPG, PNG or GIF (max. 5MB)
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-sm text-red-600">
                      {uploadError}
                    </p>
                  )}

                  {/* Image URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Or enter image URL
                    </label>
                    <input
                      type="url"
                      value={formState.image_url}
                      onChange={e => setFormState({ ...formState, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}