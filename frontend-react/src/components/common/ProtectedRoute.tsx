import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, verifyToken } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const valid = await verifyToken();
        setIsValid(valid);
      } else {
        setIsValid(false);
      }
      setIsVerifying(false);
    };

    checkAuth();
  }, [isAuthenticated, verifyToken]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
