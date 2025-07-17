import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Cookie, Settings, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply cookie settings
    if (prefs.analytics) {
      // Enable analytics cookies
      console.log('Analytics cookies enabled');
    } else {
      // Disable analytics cookies
      console.log('Analytics cookies disabled');
    }

    if (prefs.marketing) {
      // Enable marketing cookies
      console.log('Marketing cookies enabled');
    } else {
      // Disable marketing cookies
      console.log('Marketing cookies disabled');
    }

    if (prefs.functional) {
      // Enable functional cookies
      console.log('Functional cookies enabled');
    } else {
      // Disable functional cookies
      console.log('Functional cookies disabled');
    }
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    savePreferences(necessaryOnly);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const CookieSettingsDialog = () => (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            We use cookies to enhance your experience and analyze our website traffic. 
            You can choose which types of cookies you'd like to allow.
          </p>

          <div className="space-y-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">Necessary Cookies</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Essential for the website to function properly. These cannot be disabled.
                </p>
              </div>
              <Switch checked={true} disabled className="ml-4" />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">Analytics Cookies</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                className="ml-4"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">Marketing Cookies</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Used to deliver relevant advertisements and track campaign performance.
                </p>
              </div>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                className="ml-4"
              />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">Functional Cookies</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable enhanced functionality and personalization.
                </p>
              </div>
              <Switch 
                checked={preferences.functional}
                onCheckedChange={(checked) => handlePreferenceChange('functional', checked)}
                className="ml-4"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="link" 
              size="sm"
              className="flex items-center gap-1 text-xs"
              asChild
            >
              <a href="/cookies" target="_blank">
                Cookie Policy
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => savePreferences(preferences)}>
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
          >
            <Card className="shadow-lg border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">We use cookies</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      This website uses cookies to enhance your experience and analyze our traffic.
                    </p>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={acceptAll} className="flex-1">
                          Accept All
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={acceptNecessary}
                          className="flex-1"
                        >
                          Necessary Only
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-1 text-xs h-7"
                      >
                        <Settings className="h-3 w-3" />
                        Customize
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <CookieSettingsDialog />
    </>
  );
};