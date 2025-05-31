import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signIn } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const navigate = useNavigate();
  const { session } = useAuth();

  if (!ADMIN_EMAIL) {
    console.error('Missing admin email configuration');
  }

  useEffect(() => {
    // Load previous attempts from localStorage
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedLockout = localStorage.getItem('loginLockout');
    
    if (storedAttempts) setAttempts(Number(storedAttempts));
    if (storedLockout) setLockoutUntil(Number(storedLockout));
  }, []);

  // Redirect if already logged in
  if (session) {
    return <Navigate to="/admin" replace />;
  }

  const updateAttempts = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('loginAttempts', String(newAttempts));
    
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_TIME;
      setLockoutUntil(lockoutTime);
      localStorage.setItem('loginLockout', String(lockoutTime));
    }
  };

  const resetAttempts = () => {
    setAttempts(0);
    setLockoutUntil(null);
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('loginLockout');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / (60 * 1000));
      setError(`Too many failed attempts. Please try again in ${minutesLeft} minutes.`);
      return;
    }

    // Validate email
    if (email !== ADMIN_EMAIL) {
      updateAttempts();
      setError('Invalid credentials');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      resetAttempts();
      navigate('/admin');
    } catch (error) {
      updateAttempts();
      setError('Failed to sign in. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || (lockoutUntil !== null && Date.now() < lockoutUntil);

  return session ? (
    <Navigate to="/admin" replace />
  ) : (    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-200 shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isDisabled}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isDisabled}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>          {error && (
            <div className="text-red-700 text-sm bg-red-100 px-4 py-2 border border-red-200">
              <p>{error}</p>
              {attempts > 0 && attempts < MAX_ATTEMPTS && (
                <p className="mt-1 text-xs">
                  {MAX_ATTEMPTS - attempts} attempts remaining before temporary lockout
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-gray-700 text-white py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}