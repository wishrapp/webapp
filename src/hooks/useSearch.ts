import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../lib/supabase-types';
import { sendAccessRequestEmail } from '../lib/email/wishlist';

type Profile = Database['public']['Tables']['profiles']['Row'];
type SearchResult = Pick<Profile, 'id' | 'username' | 'first_name' | 'last_name' | 'profile_image_url' | 'email'>;

export function useSearch() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [approvedRequests, setApprovedRequests] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      if (!session?.user.id) return;

      try {
        // Load access requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('access_requests')
          .select('target_id, status')
          .eq('requester_id', session.user.id);

        if (requestsError) throw requestsError;

        // Load favorites
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('user_favorites')
          .select('favorite_user_id, favorite_username')
          .eq('user_id', session.user.id);

        if (favoritesError) throw favoritesError;

        // Update state
        const pending = new Set<string>();
        const approved = new Set<string>();
        const favs = new Map<string, string>();
        
        requestsData.forEach(req => {
          if (req.status === 'pending') {
            pending.add(req.target_id);
          } else if (req.status === 'approved') {
            approved.add(req.target_id);
          }
        });

        favoritesData?.forEach(fav => {
          favs.set(fav.favorite_user_id, fav.favorite_username);
        });

        setPendingRequests(pending);
        setApprovedRequests(approved);
        setFavorites(favs);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [session?.user.id, supabase]);

  const searchUsers = async (query: string) => {
    if (!query.trim() || !session?.user.id) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, profile_image_url, email')
        .ilike('username', `%${query}%`)
        .neq('id', session.user.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  const sendAccessRequest = async (targetId: string, username: string) => {
    if (!session?.user.id) {
      return { success: false, message: 'You must be logged in to request access' };
    }

    try {
      // Check if request already exists
      const { data: existingRequests, error: checkError } = await supabase
        .from('access_requests')
        .select('*')
        .eq('requester_id', session.user.id)
        .eq('target_id', targetId);

      if (checkError) throw checkError;
      
      if (existingRequests && existingRequests.length > 0) {
        return { success: false, message: 'You have already requested access to this wishlist' };
      }

      // Get target user's email
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', targetId)
        .single();

      if (userError) throw userError;
      if (!targetUser?.email) {
        throw new Error('Could not find target user email');
      }

      // Create access request and message in a transaction
      const { error: requestError } = await supabase
        .from('access_requests')
        .insert({
          requester_id: session.user.id,
          target_id: targetId,
          status: 'pending'
        });

      if (requestError) throw requestError;

      // Create message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: session.user.id,
          recipient_id: targetId,
          subject: 'New Access Request',
          content: `${username} has requested access to view your wishlist.`,
          read: false
        });

      if (messageError) throw messageError;

      // Send email notification
      await sendAccessRequestEmail(username, targetUser.email);

      // Update local state
      setPendingRequests(prev => new Set([...prev, targetId]));

      return { success: true, message: 'Access request sent successfully' };
    } catch (error) {
      console.error('Error sending access request:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send access request' };
    }
  };

  const toggleFavorite = async (userId: string, username: string) => {
    if (!session?.user.id) return;

    try {
      if (favorites.has(userId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('favorite_user_id', userId);

        if (error) throw error;

        // Update local state
        const newFavorites = new Map(favorites);
        newFavorites.delete(userId);
        setFavorites(newFavorites);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: session.user.id,
            favorite_user_id: userId,
            favorite_username: username
          });

        if (error) throw error;

        // Update local state
        const newFavorites = new Map(favorites);
        newFavorites.set(userId, username);
        setFavorites(newFavorites);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return {
    searchResults,
    searchUsers,
    sendAccessRequest,
    pendingRequests,
    approvedRequests,
    favorites,
    toggleFavorite
  };
}