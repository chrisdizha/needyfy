
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, User, Plus, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/hooks/useI18n';
import ImageUpload from '@/components/ui/image-upload';
import MultiProviderAuth from '@/components/auth/MultiProviderAuth';
import { Link } from 'react-router-dom';

interface ProfileData {
  full_name: string;
  phone: string;
  avatar_url?: string;
}

const ProfileManagement = () => {
  const { user, refreshAuthState } = useAuth();
  const { t } = useI18n();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || ''
        });
      }

      // Also get profile picture from social providers if available
      const socialAvatarUrl = user?.user_metadata?.avatar_url || 
                             user?.user_metadata?.picture;
      
      if (socialAvatarUrl && !data?.avatar_url) {
        setProfileData(prev => ({ ...prev, avatar_url: socialAvatarUrl }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: profileData.full_name,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(t('profile.updateSuccess'));
      await refreshAuthState();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfileData(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
      toast.success(t('profile.imageUploadSuccess'));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('profile.imageUploadError'));
    } finally {
      setUploading(false);
    }
  };

  const importSocialProfilePicture = async () => {
    const socialAvatarUrl = user?.user_metadata?.avatar_url || 
                           user?.user_metadata?.picture;
    
    if (socialAvatarUrl) {
      setProfileData(prev => ({ ...prev, avatar_url: socialAvatarUrl }));
      toast.success(t('profile.socialImageImported'));
    } else {
      toast.error(t('profile.noSocialImageFound'));
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profile.profileInformation')}
          </CardTitle>
          <CardDescription>
            {t('profile.profileDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profileData.full_name ? getInitials(profileData.full_name) : 
                   user?.email ? getInitials(user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-center space-y-2">
                <ImageUpload
                  onChange={handleImageUpload}
                  maxImages={1}
                  maxFileSize={5}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                >
                  <Button variant="outline" disabled={uploading}>
                    <Camera className="h-4 w-4 mr-2" />
                    {uploading ? t('common.uploading') : t('profile.uploadPhoto')}
                  </Button>
                </ImageUpload>
                
                {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) && (
                  <Button variant="ghost" size="sm" onClick={importSocialProfilePicture}>
                    <Upload className="h-4 w-4 mr-2" />
                    {t('profile.importSocialPhoto')}
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder={t('profile.enterFullName')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phoneNumber')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t('profile.enterPhone')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.emailNote')}
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('common.saving') : t('profile.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your equipment and bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/list-equipment">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Plus className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">List Equipment</h3>
                  <p className="text-sm text-muted-foreground">Add new equipment to rent out</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/dashboard">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">My Bookings</h3>
                  <p className="text-sm text-muted-foreground">View and manage bookings</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/equipment">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Search className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Browse Equipment</h3>
                  <p className="text-sm text-muted-foreground">Find equipment to rent</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <MultiProviderAuth />
    </div>
  );
};

export default ProfileManagement;
