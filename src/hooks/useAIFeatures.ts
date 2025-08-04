import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIGenerateDescriptionParams {
  title: string;
  category: string;
  keyFeatures?: string;
  condition?: string;
}

interface AISuggestPriceParams {
  title: string;
  category: string;
  condition?: string;
  location: string;
  features?: string;
}

interface AISmartSearchParams {
  query: string;
  userLocation?: string;
  budget?: number;
  timeframe?: string;
}

interface PriceSuggestion {
  suggestedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  reasoning: string;
}

interface SmartSearchResult {
  recommendations: Array<{
    equipmentId: string;
    relevanceScore: number;
    reason: string;
  }>;
  searchSuggestions: string[];
  summary: string;
}

export const useAIFeatures = () => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const generateDescription = useCallback(async (params: AIGenerateDescriptionParams): Promise<string | null> => {
    setIsGeneratingDescription(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-description', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate description');
      }

      toast({
        title: 'Description Generated',
        description: 'AI has created a professional description for your equipment.',
      });

      return data.description;
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate description. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGeneratingDescription(false);
    }
  }, []);

  const suggestPrice = useCallback(async (params: AISuggestPriceParams): Promise<PriceSuggestion | null> => {
    setIsSuggestingPrice(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggest-price', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to suggest price');
      }

      toast({
        title: 'Price Suggested',
        description: `AI suggests $${data.suggestedPrice}/day based on market analysis.`,
      });

      return {
        suggestedPrice: data.suggestedPrice,
        priceRange: data.priceRange,
        reasoning: data.reasoning
      };
    } catch (error) {
      console.error('Error suggesting price:', error);
      toast({
        title: 'Price Suggestion Failed',
        description: 'Unable to suggest price. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSuggestingPrice(false);
    }
  }, []);

  const smartSearch = useCallback(async (params: AISmartSearchParams): Promise<SmartSearchResult | null> => {
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-smart-search', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to perform smart search');
      }

      return {
        recommendations: data.recommendations,
        searchSuggestions: data.searchSuggestions,
        summary: data.summary
      };
    } catch (error) {
      console.error('Error in smart search:', error);
      toast({
        title: 'Search Failed',
        description: 'Unable to perform smart search. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    generateDescription,
    suggestPrice,
    smartSearch,
    isGeneratingDescription,
    isSuggestingPrice,
    isSearching
  };
};