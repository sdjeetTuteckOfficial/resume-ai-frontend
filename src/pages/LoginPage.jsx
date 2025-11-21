// pages/LoginPage.jsx
import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react'; // Removed unused imports
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

      setMessage({ type: 'success', text: 'Welcome back! Redirecting...' });
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

  // Note: No outer 'min-h-screen' or 'grid' here.
  // It fits directly into the slot provided by AuthLayout.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-900'>Welcome Back</h2>
        <p className='text-gray-500 mt-2'>Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-5'>
        <div>
          <label className='text-sm font-semibold text-gray-700 ml-1'>
            Email
          </label>
          <div className='mt-2 relative'>
            <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder='you@company.com'
              className='w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all'
            />
          </div>
        </div>

        <div>
          <div className='flex justify-between items-center ml-1'>
            <label className='text-sm font-semibold text-gray-700'>
              Password
            </label>
            <a
              href='/forgot-password'
              className='text-sm text-blue-600 hover:text-blue-700 font-medium'
            >
              Forgot?
            </a>
          </div>
          <div className='mt-2 relative'>
            <Lock className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder='••••••••'
              className='w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all'
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type='submit'
          disabled={isLoading}
          className='w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2'
        >
          {isLoading ? (
            <>
              <Loader2 className='animate-spin h-5 w-5' /> Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </motion.button>
      </form>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-3 rounded-lg text-center text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <p className='text-center mt-8 text-gray-600 text-sm'>
        Don't have an account?{' '}
        <a
          href='/signup'
          className='font-bold text-blue-600 hover:text-blue-700'
        >
          Sign up free
        </a>
      </p>
    </motion.div>
  );
}
