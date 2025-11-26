import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  // 1. Get the 'isDropped' state from the Layout (Drag & Drop status)
  const { isDropped } = useOutletContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-focus the email input when the star is dropped
  useEffect(() => {
    if (isDropped) {
      setTimeout(() => document.getElementById('email-input')?.focus(), 500);
    }
  }, [isDropped]);

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

      // Success State
      setMessage({ type: 'success', text: 'Welcome back! Redirecting...' });
      localStorage.setItem('token', data.access_token);
      console.log('user', data.user);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        if (data.user.role !== 'user') {
          window.location.href = '/admin/jobs';
        } else {
          window.location.href = '/job-onboarding';
        }
      }, 1200);
    } catch (error) {
      // Error State
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
      layout
      // The background styling changes based on isDropped state
      className={`relative w-full max-w-[400px] p-8 rounded-3xl border transition-all duration-500 ease-out ${
        isDropped
          ? 'bg-white/95 shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)] border-amber-400 ring-4 ring-amber-100'
          : 'bg-white/80 shadow-2xl border-white/60 backdrop-blur-xl'
      }`}
    >
      <AnimatePresence mode='wait'>
        {isDropped ? (
          /* SUCCESS / UNLOCKED HEADER */
          <motion.div
            key='success'
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className='mb-8 text-center'
          >
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-3'>
              <CheckCircle2 className='w-3 h-3' /> UNLOCKED
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>Welcome!</h2>
            <p className='text-gray-500 text-xs mt-1'>Login to view jobs.</p>
          </motion.div>
        ) : (
          /* DEFAULT / LOCKED HEADER */
          <motion.div
            key='default'
            exit={{ opacity: 0, y: 10 }}
            className='mb-8'
          >
            <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600'>
              <Lock className='w-5 h-5' />
            </div>
            <h2 className='text-2xl font-bold text-gray-800'>Sign In</h2>
            <p className='text-gray-500 mt-2 text-sm'>
              Drag the Star to unlock.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* EMAIL INPUT */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-gray-600 ml-1 uppercase'>
            Email
          </label>
          <div className='relative'>
            <Mail
              className={`absolute left-4 top-3.5 h-4 w-4 ${
                isDropped ? 'text-amber-500' : 'text-gray-400'
              }`}
            />
            <input
              id='email-input'
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder='you@company.com'
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border transition-all outline-none text-sm font-medium ${
                isDropped
                  ? 'border-amber-200 focus:ring-amber-100'
                  : 'border-gray-200 focus:ring-blue-50'
              }`}
            />
          </div>
        </div>

        {/* PASSWORD INPUT */}
        <div className='space-y-1.5'>
          <div className='flex justify-between items-center ml-1'>
            <label className='text-xs font-bold text-gray-600 uppercase'>
              Password
            </label>
            <a
              href='/forgot-password'
              className='text-xs font-semibold text-blue-600 hover:underline'
            >
              Forgot?
            </a>
          </div>
          <div className='relative'>
            <Lock
              className={`absolute left-4 top-3.5 h-4 w-4 ${
                isDropped ? 'text-amber-500' : 'text-gray-400'
              }`}
            />
            <input
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder='••••••••'
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border transition-all outline-none text-sm font-medium ${
                isDropped
                  ? 'border-amber-200 focus:ring-amber-100'
                  : 'border-gray-200 focus:ring-blue-50'
              }`}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type='submit'
          disabled={isLoading}
          className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 text-white text-sm ${
            isDropped
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/30'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
          }`}
        >
          {isLoading ? (
            <Loader2 className='animate-spin w-5 h-5' />
          ) : (
            <>
              {isDropped ? 'Unlock Job' : 'Sign In'}{' '}
              <ArrowRight className='w-4 h-4' />
            </>
          )}
        </motion.button>
      </form>

      {/* API MESSAGE FEEDBACK */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg text-center text-xs font-bold ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {!isDropped && (
        <div className='mt-6 text-center'>
          <p className='text-gray-500 text-xs'>
            No account?{' '}
            <a
              href='/signup'
              className='text-blue-600 font-bold hover:underline'
            >
              Sign Up
            </a>
          </p>
        </div>
      )}
    </motion.div>
  );
}
