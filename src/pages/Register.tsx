
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EnhancedRegisterForm } from '@/components/auth/EnhancedRegisterForm';
import EnhancedSocialAuth from '@/components/auth/EnhancedSocialAuth';
import { useI18n } from '@/hooks/useI18n';

const Register = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      navigate('/');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-semibold tracking-tight mb-1 text-center">
          {t('auth.createAccount')}
        </DialogTitle>
        
        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground text-center">
            {t('auth.signUpMessage')}
          </p>

          <EnhancedRegisterForm />
          
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
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t('common.login')}
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Register;
