
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SecureLoginForm } from '@/components/auth/SecureLoginForm';
import EnhancedSocialAuth from '@/components/auth/EnhancedSocialAuth';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { useI18n } from '@/hooks/useI18n';

const Login = () => {
  const [open, setOpen] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      navigate('/');
    }
  };
  
  if (showPasswordReset) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <PasswordResetForm onBack={() => setShowPasswordReset(false)} />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="text-2xl font-semibold tracking-tight mb-1 text-center">
          {t('auth.welcomeBack')}
        </DialogTitle>
        
        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground text-center">
            {t('auth.signInMessage')}
          </p>

          <SecureLoginForm onForgotPassword={() => setShowPasswordReset(true)} />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('auth.continueWith')}
              </span>
            </div>
          </div>

          <EnhancedSocialAuth />

          <p className="text-center text-sm text-muted-foreground">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline">
              {t('common.register')}
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Login;
