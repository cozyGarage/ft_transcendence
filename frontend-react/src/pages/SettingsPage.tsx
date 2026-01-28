import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Bell, Shield, Palette, Camera } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { Card, Button, Input, Avatar } from '@/components/ui';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <Card className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-primary/20 text-primary'
                      : 'text-gray-400 hover:bg-dark-100 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <Card className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
        </Card>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { player, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: player?.user?.username || '',
      first_name: player?.user?.first_name || '',
      last_name: player?.user?.last_name || '',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      if (data.first_name) formData.append('first_name', data.first_name);
      if (data.last_name) formData.append('last_name', data.last_name);
      if (avatarFile) formData.append('avatar', avatarFile);

      await authApi.updateUser(formData);
      await updateProfile();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar
              src={previewUrl || player?.user?.avatar}
              size="xl"
              league={player?.stats?.league}
            />
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full 
                            flex items-center justify-center cursor-pointer hover:bg-primary-400 transition-colors">
              <Camera className="w-5 h-5 text-dark" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-white font-medium">{player?.user?.username}</p>
            <p className="text-sm text-gray-500">Click to change avatar</p>
          </div>
        </div>

        <Input
          {...register('username')}
          label="Username"
          error={errors.username?.message}
          icon={<User className="w-5 h-5" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('first_name')}
            label="First Name"
            placeholder="Optional"
          />
          <Input
            {...register('last_name')}
            label="Last Name"
            placeholder="Optional"
          />
        </div>

        <Button type="submit" isLoading={isLoading}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}

function SecuritySettings() {
  const [is2FAEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setQRCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.enable2FA();
      setQRCode(response.qr_code);
      setShowQRCode(true);
    } catch {
      toast.error('Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    // Would need verification code
    toast.error('Please enter verification code to disable 2FA');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>

      <div className="space-y-6">
        {/* 2FA Section */}
        <div className="p-4 bg-dark-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <Button
              variant={is2FAEnabled ? 'danger' : 'primary'}
              onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
              isLoading={isLoading}
            >
              {is2FAEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>

          {showQRCode && qrCode && (
            <div className="mt-4 p-4 bg-white rounded-lg w-fit">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="p-4 bg-dark-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              <div>
                <p className="text-white font-medium">Change Password</p>
                <p className="text-sm text-gray-500">Update your password regularly</p>
              </div>
            </div>
            <Button variant="secondary">
              Change
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    friendRequests: true,
    gameInvites: true,
    tournamentUpdates: true,
    messages: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification settings updated');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Notification Settings</h2>

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-dark-100 rounded-lg">
            <span className="text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <button
              onClick={() => toggleSetting(key as keyof typeof settings)}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors relative',
                value ? 'bg-primary' : 'bg-dark-200'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  value ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Appearance Settings</h2>

      <div className="space-y-6">
        <div>
          <p className="text-gray-400 mb-3">Theme</p>
          <div className="flex gap-4">
            <button className="p-4 bg-dark-100 rounded-lg border-2 border-primary">
              <div className="w-20 h-12 bg-dark rounded mb-2" />
              <span className="text-white text-sm">Dark</span>
            </button>
            <button className="p-4 bg-dark-100 rounded-lg border-2 border-transparent hover:border-dark-200">
              <div className="w-20 h-12 bg-white rounded mb-2" />
              <span className="text-white text-sm">Light</span>
            </button>
          </div>
        </div>

        <div>
          <p className="text-gray-400 mb-3">Accent Color</p>
          <div className="flex gap-3">
            {['#00FFFC', '#FF00FF', '#FFD700', '#00FF00', '#FF4500'].map((color) => (
              <button
                key={color}
                className={clsx(
                  'w-10 h-10 rounded-full border-2',
                  color === '#00FFFC' ? 'border-white' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
