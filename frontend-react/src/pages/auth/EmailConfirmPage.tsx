import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function EmailConfirmPage() {
  return (
    <div className="w-full max-w-md">
      <div className="card bg-dark-50/80 backdrop-blur-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Verify Your Email</h1>
        
        <p className="text-gray-400 mb-8">
          We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or request a new verification link.
          </p>
          
          <Link to="/login" className="link flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
