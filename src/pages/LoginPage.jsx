import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
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

    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Login Successful!' });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className='bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/50'
    >
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-gray-800'>Welcome Back</h2>
        <p className='text-gray-500 mt-2'>
          Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>
            Email Address
          </label>
          <div className='relative'>
            <Mail className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='name@company.com'
              className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white/50'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex justify-between'>
            <label className='text-sm font-medium text-gray-700'>
              Password
            </label>
            <a href='#' className='text-sm text-blue-600 hover:underline'>
              Forgot?
            </a>
          </div>
          <div className='relative'>
            <Lock className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
            <input
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white/50'
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type='submit'
          disabled={isLoading}
          className='w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2'
        >
          {isLoading ? (
            <Loader2 className='animate-spin' />
          ) : (
            <>
              Sign In <ArrowRight className='w-4 h-4' />
            </>
          )}
        </motion.button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-center text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className='mt-8 text-center'>
        <p className='text-gray-500 text-sm'>
          Don't have an account?{' '}
          <a href='/signup' className='text-blue-600 font-bold hover:underline'>
            Sign Up
          </a>
        </p>
      </div>
    </motion.div>
  );
}
