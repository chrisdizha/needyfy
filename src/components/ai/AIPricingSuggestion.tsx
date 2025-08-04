import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Info } from 'lucide-react';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { toast } from '@/hooks/use-toast';

interface AIPricingSuggestionProps {
  title: string;
  category: string;
  condition?: string;
  location: string;
  features?: string;
  currentPrice?: number;
  onPriceSuggested: (price: number) => void;
}

interface PricingSuggestion {
  suggestedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  reasoning: string;
}

export const AIPricingSuggestion = ({
  title,
  category,
  condition,
  location,
  features,
  currentPrice,
  onPriceSuggested
}: AIPricingSuggestionProps) => {
  const [suggestion, setSuggestion] = useState<PricingSuggestion | null>(null);
  const { suggestPrice, isSuggestingPrice } = useAIFeatures();

  const handleGetSuggestion = async () => {
    const result = await suggestPrice({
      title,
      category,
      condition,
      location,
      features
    });

    if (result) {
      setSuggestion(result);
    }
  };

  const handleApplyPrice = () => {
    if (suggestion) {
      onPriceSuggested(suggestion.suggestedPrice);
      toast({
        title: 'Price Applied',
        description: `AI-suggested price of $${suggestion.suggestedPrice}/day has been applied.`,
      });
    }
  };

  const getPriceComparison = () => {
    if (!suggestion || !currentPrice) return null;
    
    const difference = suggestion.suggestedPrice - currentPrice;
    const percentage = Math.abs((difference / currentPrice) * 100);
    
    if (Math.abs(difference) < 1) {
      return { type: 'neutral', text: 'Your price is well-positioned' };
    } else if (difference > 0) {
      return { type: 'increase', text: `Consider increasing by $${difference.toFixed(2)} (${percentage.toFixed(1)}%)` };
    } else {
      return { type: 'decrease', text: `Consider reducing by $${Math.abs(difference).toFixed(2)} (${percentage.toFixed(1)}%)` };
    }
  };

  const priceComparison = getPriceComparison();

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          AI Pricing Suggestion
        </CardTitle>
        <CardDescription>
          Get market-based pricing recommendations powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleGetSuggestion}
          disabled={isSuggestingPrice || !title || !category || !location}
          className="w-full"
          size="lg"
        >
          {isSuggestingPrice ? (
            <>
              <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
              Analyzing Market Data...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Get AI Price Suggestion
            </>
          )}
        </Button>

        {suggestion && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Suggested Price</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  ${suggestion.suggestedPrice}/day
                </Badge>
              </div>
              
              <div className="mb-3">
                <span className="text-xs text-muted-foreground">Price Range:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm bg-muted px-2 py-1 rounded">
                    Min: ${suggestion.priceRange.min}
                  </span>
                  <span className="text-sm bg-muted px-2 py-1 rounded">
                    Max: ${suggestion.priceRange.max}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
              </div>
            </div>

            {priceComparison && (
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-1">Price Comparison</p>
                <p className={`text-sm ${
                  priceComparison.type === 'increase' ? 'text-green-600' :
                  priceComparison.type === 'decrease' ? 'text-orange-600' :
                  'text-muted-foreground'
                }`}>
                  {priceComparison.text}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleApplyPrice}
                className="flex-1"
              >
                Apply Suggested Price
              </Button>
              <Button 
                variant="outline"
                onClick={handleGetSuggestion}
                disabled={isSuggestingPrice}
              >
                Refresh
              </Button>
            </div>
          </div>
        )}

        {currentPrice && !suggestion && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Current price:</p>
            <p className="text-lg font-semibold">${currentPrice}/day</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};