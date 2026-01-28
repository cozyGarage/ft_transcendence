import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark cyber-grid p-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary text-glow">404</h1>
        <h2 className="text-3xl font-bold text-white mt-4 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            as={Link}
            to="/home"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Go Home
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
