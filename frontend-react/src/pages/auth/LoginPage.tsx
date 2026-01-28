import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/home');
    } else if (result.is2FAEnabled) {
      navigate('/two-factor');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'intra') => {
    const url = provider === 'google' 
      ? authApi.getGoogleAuthUrl() 
      : authApi.getIntraAuthUrl();
    window.location.href = url;
  };

  return (
    <div className="w-full max-w-md">
      <div className="card bg-dark-50/80 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue to ft_transcendence</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            {...register('email')}
            type="email"
            placeholder="Email address"
            error={errors.email?.message}
            icon={<Mail className="w-5 h-5" />}
          />

          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            error={errors.password?.message}
            icon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm link">
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* OAuth Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-dark-50 text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-dark-100 
                       border border-dark-200 hover:border-primary transition-colors"
          >
            <img src="/images/google.svg" alt="Google" className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => handleOAuthLogin('intra')}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-dark-100 
                       border border-dark-200 hover:border-primary transition-colors"
          >
            <img src="/images/42.svg" alt="42 Intra" className="w-6 h-6" />
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-8 text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="link font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
