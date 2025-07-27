
import { useState } from 'react';
import { Bell, BellRing, Check, CheckCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const {
    notifications,
    unreadCount,
    loading,
    isSupported,
    isSubscribed,
    subscribeToPush,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '💬';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{t('common.notifications')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[400px] md:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="text-sm sm:text-base">{t('common.notifications')}</span>
            <div className="flex items-center gap-1 sm:gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs sm:text-sm">
                  <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Read all</span>
                </Button>
              )}
              {isSupported && !isSubscribed && (
                <Button variant="outline" size="sm" onClick={subscribeToPush} className="text-xs sm:text-sm">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Enable Push</span>
                  <span className="sm:hidden">Push</span>
                </Button>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No notifications yet</p>
              <p className="text-xs sm:text-sm">You'll see new updates here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      'p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors',
                      notification.read
                        ? 'bg-muted/50 border-muted'
                        : 'bg-background border-primary/20 shadow-sm'
                    )}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-base sm:text-xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4
                            className={cn(
                              'font-medium text-sm sm:text-base truncate',
                              !notification.read && 'font-semibold'
                            )}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 ml-1 sm:ml-2 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-1 rounded-full flex-shrink-0',
                              getTypeColor(notification.type),
                              'bg-current/10'
                            )}
                          >
                            {notification.type}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
