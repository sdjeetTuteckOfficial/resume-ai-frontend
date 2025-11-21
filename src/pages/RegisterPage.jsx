import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../security/axiosInstance';

export default function RegisterPage() {
  const { isDropped } = useOutletContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New State
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDropped) {
      setTimeout(() => document.getElementById('email-input')?.focus(), 500);
    }
  }, [isDropped]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // 1. Client-side Validation
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/auth/register', {
        email: email.trim(),
        username: email.trim(),
        password,
        // Note: We do not send confirmPassword to the backend
      });

      const data = response.data;

      setMessage({ type: 'success', text: 'Account created! Redirecting...' });
      console.log('data', data, response);
      localStorage.setItem('email', data.email);
      navigate('/otp-page');
      //   if (data.access_token) {
      //     localStorage.setItem('token', data.access_token);
      //     localStorage.setItem('user', JSON.stringify(data.user));
      //   }

      //   setTimeout(() => {
      //     window.location.href = '/';
      //   }, 1200);
    } catch (error) {
      console.error('Registration Error:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Could not create account';

      setMessage({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      layout
      className={`relative w-full max-w-[400px] p-8 rounded-3xl border transition-all duration-500 ease-out ${
        isDropped
          ? 'bg-white/95 shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)] border-amber-400 ring-4 ring-amber-100'
          : 'bg-white/80 shadow-2xl border-white/60 backdrop-blur-xl'
      }`}
    >
      <AnimatePresence mode='wait'>
        {isDropped ? (
          <motion.div
            key='success'
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className='mb-8 text-center'
          >
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-3'>
              <CheckCircle2 className='w-3 h-3' /> UNLOCKED
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>Get Started!</h2>
            <p className='text-gray-500 text-xs mt-1'>
              Create an account to view jobs.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key='default'
            exit={{ opacity: 0, y: 10 }}
            className='mb-8'
          >
            <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600'>
              <UserPlus className='w-5 h-5' />
            </div>
            <h2 className='text-2xl font-bold text-gray-800'>Create Account</h2>
            <p className='text-gray-500 mt-2 text-sm'>
              Drag the Star to unlock registration.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className='space-y-4'>
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
          <label className='text-xs font-bold text-gray-600 ml-1 uppercase'>
            Password
          </label>
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
              placeholder='Create a password'
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border transition-all outline-none text-sm font-medium ${
                isDropped
                  ? 'border-amber-200 focus:ring-amber-100'
                  : 'border-gray-200 focus:ring-blue-50'
              }`}
            />
          </div>
        </div>

        {/* CONFIRM PASSWORD INPUT */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-gray-600 ml-1 uppercase'>
            Confirm Password
          </label>
          <div className='relative'>
            <Lock
              className={`absolute left-4 top-3.5 h-4 w-4 ${
                isDropped ? 'text-amber-500' : 'text-gray-400'
              }`}
            />
            <input
              type='password'
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              placeholder='Repeat password'
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border transition-all outline-none text-sm font-medium ${
                isDropped
                  ? 'border-amber-200 focus:ring-amber-100'
                  : 'border-gray-200 focus:ring-blue-50'
              } ${
                // Visual feedback if passwords don't match while typing (optional polish)
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 focus:ring-red-100'
                  : ''
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
          className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 text-white text-sm ${
            isDropped
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/30'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
          }`}
        >
          {isLoading ? (
            <Loader2 className='animate-spin w-5 h-5' />
          ) : (
            <>
              {isDropped ? 'Create Account' : 'Sign Up'}{' '}
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
            Already have an account?{' '}
            <a
              href='/login'
              className='text-blue-600 font-bold hover:underline'
            >
              Sign In
            </a>
          </p>
        </div>
      )}
    </motion.div>
  );
}
