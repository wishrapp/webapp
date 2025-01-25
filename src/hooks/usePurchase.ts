import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../lib/supabase-types';
import { sendPurchaseNotification } from '../lib/email/purchase';

type PurchaseOptions = {
  purchaseType: 'mark-purchased' | 'group-purchase';
  informOwner: boolean;
  revealIdentity: boolean;
  contribution?: string;
  showEmail: boolean;
  showPhone: boolean;
};

export function usePurchase() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();

  const markItemAsPurchased = async (itemId: string, options: PurchaseOptions): Promise<boolean> => {
    if (!session?.user.id) return false;

    try {
      // First get the item details to verify it exists and get owner info
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select(`
          *,
          owner:profiles!items_user_id_fkey (
            email,
            username
          )
        `)
        .eq('id', itemId)
        .single();

      if (itemError) {
        console.error('Error fetching item:', itemError);
        return false;
      }

      if (!item || !item.owner) {
        console.error('Item or owner not found');
        return false;
      }

      // Update the item's purchase status
      const { error: updateError } = await supabase
        .from('items')
        .update({
          purchased: true,
          purchased_by: session.user.id,
          purchased_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) {
        console.error('Error updating item:', updateError);
        return false;
      }

      // Handle notifications if requested
      if (options.informOwner) {
        // Create purchase notification
        const { error: notificationError } = await supabase
          .from('purchase_notifications')
          .insert({
            item_id: itemId,
            purchaser_id: session.user.id,
            inform_owner: true,
            reveal_identity: options.revealIdentity
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }

        // Create message for the owner
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: session.user.id,
            recipient_id: item.user_id,
            subject: 'Item Purchased from Your Wishlist',
            content: `Someone has purchased "${item.name}" from your wishlist!`,
            related_item_id: itemId,
            read: false
          });

        if (messageError) {
          console.error('Error creating message:', messageError);
        }

        // Send email notification
        try {
          await sendPurchaseNotification(
            item.owner.email,
            item.owner.username,
            item.name
          );
        } catch (error) {
          console.error('Error sending email notification:', error);
        }
      }

      // Remove any group purchase contributions
      const { error: deleteError } = await supabase
        .from('group_purchase_contributions')
        .delete()
        .eq('item_id', itemId);

      if (deleteError) {
        console.error('Error removing group purchase contributions:', deleteError);
      }

      return true;
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      return false;
    }
  };

  const unmarkItemAsPurchased = async (itemId: string): Promise<boolean> => {
    if (!session?.user.id) return false;

    try {
      const { error: updateError } = await supabase
        .from('items')
        .update({
          purchased: false,
          purchased_by: null,
          purchased_at: null
        })
        .eq('id', itemId)
        .eq('purchased_by', session.user.id);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from('purchase_notifications')
        .delete()
        .eq('item_id', itemId);

      if (deleteError) throw deleteError;

      return true;
    } catch (error) {
      console.error('Error unmarking item as purchased:', error);
      return false;
    }
  };

  const addGroupPurchaseContribution = async (itemId: string, options: PurchaseOptions): Promise<boolean> => {
    if (!session?.user.id || !options.contribution) return false;

    try {
      const { error } = await supabase
        .from('group_purchase_contributions')
        .insert({
          item_id: itemId,
          contributor_id: session.user.id,
          amount: parseFloat(options.contribution),
          show_email: options.showEmail,
          show_phone: options.showPhone
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding group purchase contribution:', error);
      return false;
    }
  };

  const removeGroupPurchaseContribution = async (itemId: string): Promise<boolean> => {
    if (!session?.user.id) return false;

    try {
      const { error } = await supabase
        .from('group_purchase_contributions')
        .delete()
        .eq('item_id', itemId)
        .eq('contributor_id', session.user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing group purchase contribution:', error);
      return false;
    }
  };

  const getGroupPurchaseContributions = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_purchase_contributions')
        .select('*')
        .eq('item_id', itemId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting group purchase contributions:', error);
      return [];
    }
  };

  const hasGroupPurchaseContribution = async (itemId: string): Promise<boolean> => {
    if (!session?.user.id) return false;

    try {
      const { count, error } = await supabase
        .from('group_purchase_contributions')
        .select('*', { count: 'exact', head: true })
        .eq('item_id', itemId)
        .eq('contributor_id', session.user.id);

      if (error && error.code !== 'PGRST116') throw error;
      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking group purchase contribution:', error);
      return false;
    }
  };

  return {
    markItemAsPurchased,
    unmarkItemAsPurchased,
    addGroupPurchaseContribution,
    removeGroupPurchaseContribution,
    getGroupPurchaseContributions,
    hasGroupPurchaseContribution
  };
}