import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { toast } from '@/hooks/use-toast';

interface AIDescriptionGeneratorProps {
  title: string;
  category: string;
  keyFeatures?: string;
  condition?: string;
  currentDescription?: string;
  onDescriptionGenerated: (description: string) => void;
}

export const AIDescriptionGenerator = ({
  title,
  category,
  keyFeatures,
  condition,
  currentDescription,
  onDescriptionGenerated
}: AIDescriptionGeneratorProps) => {
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const { generateDescription, isGeneratingDescription } = useAIFeatures();

  const handleGenerate = async () => {
    const description = await generateDescription({
      title,
      category,
      keyFeatures,
      condition
    });

    if (description) {
      setGeneratedDescription(description);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedDescription);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Description copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleUseDescription = () => {
    onDescriptionGenerated(generatedDescription);
    toast({
      title: 'Description Applied',
      description: 'AI-generated description has been applied to your listing.',
    });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Description Generator
        </CardTitle>
        <CardDescription>
          Let AI create a professional description for your equipment listing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleGenerate}
          disabled={isGeneratingDescription || !title || !category}
          className="w-full"
          size="lg"
        >
          {isGeneratingDescription ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Generating Description...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Professional Description
            </>
          )}
        </Button>

        {generatedDescription && (
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                value={generatedDescription}
                readOnly
                className="min-h-[120px] text-sm bg-muted/50"
                placeholder="Generated description will appear here..."
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleUseDescription}
                className="flex-1"
              >
                Use This Description
              </Button>
              <Button 
                variant="outline"
                onClick={handleGenerate}
                disabled={isGeneratingDescription}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {!generatedDescription && currentDescription && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">Current description:</p>
            <p className="text-sm">{currentDescription.substring(0, 150)}...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};