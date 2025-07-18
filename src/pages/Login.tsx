
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SecureLoginForm } from '@/components/auth/SecureLoginForm';
import SocialAuth from '@/components/auth/SocialAuth';

const Login = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      navigate('/');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="text-2xl font-semibold tracking-tight mb-1 text-center">
          Welcome back
        </DialogTitle>
        
        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground text-center">
            Sign in to your secure account to continue
          </p>

          <SecureLoginForm />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SocialAuth />

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Login;
