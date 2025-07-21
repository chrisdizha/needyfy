
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type EquipmentListing = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_unit: string;
  location: string;
  photos: string[];
  availability_calendar: any;
  terms_and_conditions: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  rating: number;
  total_ratings: number;
  is_verified: boolean;
};

export const useEquipmentListings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: listings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['equipment-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EquipmentListing[];
    },
  });

  const createListing = useMutation({
    mutationFn: async (listing: Omit<EquipmentListing, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_ratings'>) => {
      const { data, error } = await supabase
        .from('equipment_listings')
        .insert(listing)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-listings'] });
      toast({
        title: "Equipment Listed Successfully",
        description: "Your equipment is now available for rent!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to list equipment. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating listing:', error);
    },
  });

  return {
    listings,
    isLoading,
    error,
    createListing: createListing.mutate,
    isCreating: createListing.isPending,
  };
};

export const useUserEquipmentListings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: userListings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-equipment-listings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('equipment_listings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EquipmentListing[];
    },
  });

  const updateListing = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EquipmentListing> }) => {
      const { data, error } = await supabase
        .from('equipment_listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-equipment-listings'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-listings'] });
      toast({
        title: "Equipment Updated",
        description: "Your equipment listing has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update equipment. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating listing:', error);
    },
  });

  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-equipment-listings'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-listings'] });
      toast({
        title: "Equipment Removed",
        description: "Your equipment listing has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove equipment. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting listing:', error);
    },
  });

  return {
    userListings,
    isLoading,
    error,
    updateListing: updateListing.mutate,
    deleteListing: deleteListing.mutate,
    isUpdating: updateListing.isPending,
    isDeleting: deleteListing.isPending,
  };
};
