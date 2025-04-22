
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RegisterForm from '@/components/auth/RegisterForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SocialAuth from '@/components/auth/SocialAuth';

const Register = () => {
  const [open, setOpen] = useState(true);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Create an account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>

          <RegisterForm />
          
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
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Register;
