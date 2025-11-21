import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      setMessage({ type: 'success', text: 'Redirecting...' });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header - Reduced bottom margin */}
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Welcome Back</h2>
        <p className='text-gray-500 text-sm mt-1'>
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='text-xs font-bold text-gray-700 ml-1 uppercase tracking-wide'>
            Email
          </label>
          <div className='mt-1 relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder='name@example.com'
              className='w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm'
            />
          </div>
        </div>

        <div>
          <div className='flex justify-between items-center ml-1'>
            <label className='text-xs font-bold text-gray-700 uppercase tracking-wide'>
              Password
            </label>
            <a
              href='/forgot-password'
              className='text-xs text-blue-600 hover:text-blue-700 font-medium'
            >
              Forgot password?
            </a>
          </div>
          <div className='mt-1 relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder='••••••••'
              className='w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm'
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type='submit'
          disabled={isLoading}
          className='w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 text-sm mt-2'
        >
          {isLoading ? (
            <>
              {' '}
              <Loader2 className='animate-spin h-4 w-4' /> Signing in...{' '}
            </>
          ) : (
            'Sign In'
          )}
        </motion.button>
      </form>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-2 rounded text-center text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <p className='text-center mt-6 text-gray-500 text-xs'>
        Don't have an account?{' '}
        <a
          href='/signup'
          className='font-bold text-blue-600 hover:text-blue-700'
        >
          Create free account
        </a>
      </p>
    </motion.div>
  );
}
