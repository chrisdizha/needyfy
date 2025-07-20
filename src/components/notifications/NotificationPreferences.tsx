
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Settings, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { useI18n } from '@/hooks/useI18n';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'push' | 'email' | 'browser';
}

const NotificationPreferences = () => {
  const { isSupported, isSubscribed, subscribeToPush } = useNotifications();
  const { t } = useI18n();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'booking_updates',
      title: t('notifications.bookingUpdates'),
      description: t('notifications.bookingUpdatesDesc'),
      enabled: true,
      type: 'push'
    },
    {
      id: 'new_messages',
      title: t('notifications.newMessages'),
      description: t('notifications.newMessagesDesc'),
      enabled: true,
      type: 'push'
    },
    {
      id: 'payment_confirmations',
      title: t('notifications.paymentConfirmations'),
      description: t('notifications.paymentConfirmationsDesc'),
      enabled: true,
      type: 'push'
    },
    {
      id: 'marketing_updates',
      title: t('notifications.marketingUpdates'),
      description: t('notifications.marketingUpdatesDesc'),
      enabled: false,
      type: 'email'
    },
    {
      id: 'security_alerts',
      title: t('notifications.securityAlerts'),
      description: t('notifications.securityAlertsDesc'),
      enabled: true,
      type: 'browser'
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handlePushNotificationSetup = async () => {
    if (!isSupported) {
      toast.error(t('notifications.notSupported'));
      return;
    }

    setLoading(true);
    try {
      await subscribeToPush();
    } catch (error) {
      console.error('Push notification setup error:', error);
      toast.error(t('notifications.setupError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingId: string, enabled: boolean) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === settingId ? { ...setting, enabled } : setting
      )
    );
    
    // Here you would typically save to backend
    toast.success(t('notifications.settingSaved'));
  };

  const getBrowserPermissionStatus = () => {
    if (!('Notification' in window)) return 'not-supported';
    return Notification.permission;
  };

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      toast.error(t('notifications.notSupported'));
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success(t('notifications.permissionGranted'));
    } else {
      toast.error(t('notifications.permissionDenied'));
    }
  };

  const permissionStatus = getBrowserPermissionStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notifications.pushNotifications')}
          </CardTitle>
          <CardDescription>
            {t('notifications.pushNotificationsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">{t('notifications.browserNotifications')}</h4>
              <p className="text-sm text-muted-foreground">
                {permissionStatus === 'granted' 
                  ? t('notifications.browserEnabled')
                  : permissionStatus === 'denied'
                  ? t('notifications.browserDenied')
                  : t('notifications.browserNotSet')
                }
              </p>
            </div>
            <Button
              variant={permissionStatus === 'granted' ? 'outline' : 'default'}
              onClick={requestBrowserPermission}
              disabled={permissionStatus === 'granted' || !isSupported}
            >
              {permissionStatus === 'granted' 
                ? t('notifications.enabled')
                : t('notifications.enable')
              }
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">{t('notifications.pushNotifications')}</h4>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? t('notifications.pushEnabled')
                  : t('notifications.pushNotEnabled')
                }
              </p>
            </div>
            <Button
              onClick={handlePushNotificationSetup}
              disabled={loading || isSubscribed || !isSupported}
              variant={isSubscribed ? 'outline' : 'default'}
            >
              {loading 
                ? t('common.loading')
                : isSubscribed 
                ? t('notifications.enabled')
                : t('notifications.enable')
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('notifications.preferences')}
          </CardTitle>
          <CardDescription>
            {t('notifications.preferencesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.title}
                  </Label>
                  {setting.type === 'browser' && (
                    <Shield className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <Switch
                id={setting.id}
                checked={setting.enabled}
                onCheckedChange={(enabled) => handleSettingChange(setting.id, enabled)}
                disabled={setting.type === 'push' && !isSubscribed}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
