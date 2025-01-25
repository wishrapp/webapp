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

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user.id) return;

      try {
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
            .order('date', { ascending: true }),
        ]);

        if (itemsResponse.error) throw itemsResponse.error;
        if (occasionsResponse.error) throw occasionsResponse.error;

        setItems(itemsResponse.data);
        setOccasions(occasionsResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching wishlist data:', error);
        setError('Failed to load wishlist data');
      } finally {
        setLoading(false);
      }
    };

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

      // Refresh items list
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setItems(data || []);
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

      // Refresh items list
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setItems(data || []);
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
    addItem,
    updateItem,
    deleteItem,
  };
}