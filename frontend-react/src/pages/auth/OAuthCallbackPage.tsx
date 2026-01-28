import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui';
import toast from 'react-hot-toast';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccessToken, fetchCurrentPlayer } = useAuthStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('OAuth authentication failed');
        navigate('/login');
        return;
      }

      if (accessToken) {
        setAccessToken(accessToken);
        await fetchCurrentPlayer();
        toast.success('Welcome!');
        navigate('/home');
      } else {
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, setAccessToken, fetchCurrentPlayer, navigate]);

  return (
    <div className="w-full max-w-md">
      <div className="card bg-dark-50/80 backdrop-blur-sm text-center">
        <Spinner size="lg" className="mx-auto mb-6" />
        <h1 className="text-xl font-bold text-white mb-2">Authenticating...</h1>
        <p className="text-gray-400">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
