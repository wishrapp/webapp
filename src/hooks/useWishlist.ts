import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../lib/supabase-types';

type Item = Database['public']['Tables']['items']['Row'];
type Occasion = Database['public']['Tables']['occasions']['Row'];

interface ItemFormData {
  name: string;
  description: string;
  price?: string;
  occasion_id?: string;
  item_url?: string;
  image_url?: string;
}

export function useWishlist() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [items, setItems] = useState<Item[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);

  const sortOccasions = (data: Occasion[]) => {
    return [...data].sort((a, b) => {
      // "No occasion" should always be first
      if (a.name === 'No occasion') return -1;
      if (b.name === 'No occasion') return 1;

      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  };

  const fetchData = async () => {
    if (!session?.user.id) return;

    try {
      setIsConnectionError(false);
      const [itemsResponse, occasionsResponse] = await Promise.all([
        supabase
          .from('items')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('occasions')
          .select('*')
          .eq('user_id', session.user.id)
      ]);

      if (itemsResponse.error) {
        if (itemsResponse.error.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        throw itemsResponse.error;
      }

      if (occasionsResponse.error) {
        if (occasionsResponse.error.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        throw occasionsResponse.error;
      }

      setItems(itemsResponse.data);
      setOccasions(sortOccasions(occasionsResponse.data || []));
      setError(null);
    } catch (error) {
      console.error('Error fetching wishlist data:', error);
      setError('Failed to load wishlist data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session, supabase]);

  const addItem = async (formData: ItemFormData): Promise<boolean> => {
    if (!session?.user.id) return false;

    try {
      const { error } = await supabase.from('items').insert({
        user_id: session.user.id,
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        occasion_id: formData.occasion_id || null,
        item_url: formData.item_url || null,
        image_url: formData.image_url || null,
      });

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding item:', error);
      return false;
    }
  };

  const updateItem = async (itemId: string, formData: ItemFormData): Promise<boolean> => {
    if (!session?.user.id) return false;

    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          occasion_id: formData.occasion_id || null,
          item_url: formData.item_url || null,
          image_url: formData.image_url || null,
        })
        .eq('id', itemId)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      return false;
    }
  };

  const deleteItem = async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setItems(items.filter(item => item.id !== itemId));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  };

  return {
    items,
    occasions,
    loading,
    error,
    isConnectionError,
    retry: fetchData,
    addItem,
    updateItem,
    deleteItem,
  };
}