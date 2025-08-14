
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/useI18n';
import { useEnhancedRateLimit } from '@/hooks/useEnhancedRateLimit';
import { getDeviceFingerprint } from '@/components/security/SecurityEnhancements';

interface SecureLoginFormProps {
  onForgotPassword: () => void;
}

export const SecureLoginForm = ({ onForgotPassword }: SecureLoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useI18n();
  const { checkRateLimit } = useEnhancedRateLimit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check rate limit
      const rateLimitResult = await checkRateLimit({
        maxRequests: 5,
        windowSeconds: 900, // 15 minutes
        identifier: `login_${email}`,
        progressiveDelay: true
      });
      
      if (!rateLimitResult.allowed) {
        const remainingTime = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
        setError(`Too many login attempts. Please try again in ${remainingTime} minutes.`);
        setIsLoading(false);
        return;
      }

      const deviceFingerprint = getDeviceFingerprint();
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) {
        console.error('Login error:', signInError);
        
        if (signInError.message.includes('Email not confirmed')) {
          setError(t('auth.emailNotConfirmed'));
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError(t('auth.invalidCredentials'));
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user) {
        localStorage.setItem('device_fingerprint', deviceFingerprint);
        toast.success(t('auth.loginSuccess'));
        // Redirect to dashboard after successful login
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('common.email')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('common.password')}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          className="px-0 font-normal"
          disabled={isLoading}
        >
          {t('auth.forgotPassword')}
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('common.loading') : t('common.signIn')}
      </Button>
    </form>
  );
};
