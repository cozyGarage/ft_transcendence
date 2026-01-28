import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const { setAccessToken, fetchCurrentPlayer } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newCode[index] = char;
    });
    setCode(newCode);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verify2FA(fullCode);
      setAccessToken(response.access_token);
      await fetchCurrentPlayer();
      toast.success('Welcome back!');
      navigate('/home');
    } catch {
      toast.error('Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card bg-dark-50/80 backdrop-blur-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h1>
        <p className="text-gray-400 mb-8">
          Enter the 6-digit code from your authenticator app
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-dark-100 border-2 border-dark-200 
                           rounded-lg focus:border-primary focus:outline-none transition-colors"
                maxLength={1}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
}
