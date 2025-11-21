import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../security/axiosInstance';

export default function OTPPage() {
  const { isDropped } = useOutletContext();
  const navigate = useNavigate();

  // State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Refs for input navigation
  const inputRefs = useRef([]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus logic on drop
  useEffect(() => {
    if (isDropped) {
      setTimeout(() => inputRefs.current[0]?.focus(), 500);
    }
  }, [isDropped]);

  // Handle Input Change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Take last char
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle Paste
  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, 6).split('');
    if (data.length === 0) return;

    const newOtp = [...otp];
    data.forEach((char, index) => {
      if (index < 6 && !isNaN(char)) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus the input after the last pasted character
    const nextIndex = Math.min(data.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  const handleResend = async () => {
    setTimer(30);
    setCanResend(false);
    setMessage({ type: 'success', text: 'New code sent!' });

    try {
      const email = JSON.parse(localStorage.getItem('user'))?.email;
      if (!email) return;
      await axiosInstance.post('/api/auth/resend-otp', { email });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    setIsLoading(true);
    setMessage(null);

    if (otpString.length < 6) {
      setMessage({ type: 'error', text: 'Please enter the full 6-digit code' });
      setIsLoading(false);
      return;
    }

    try {
      // Assuming email is stored temporarily

      const response = await axiosInstance.post('/auth/verify-otp', {
        email: localStorage.getItem('email'),
        otp: otpString,
      });

      setMessage({
        type: 'success',
        text: 'Verified! Please login with credentials...',
      });
      console.log('res', response);
      // Update token if API returns a new fully authenticated token
      localStorage.clear('email');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (error) {
      console.error('OTP Error:', error);
      const errorMsg =
        error.response?.data?.message || 'Invalid Verification Code';
      setMessage({ type: 'error', text: errorMsg });
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
              <CheckCircle2 className='w-3 h-3' /> SECURE LOGIN
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>Verification</h2>
            <p className='text-gray-500 text-xs mt-1'>
              Enter the 6-digit code sent to your email.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key='default'
            exit={{ opacity: 0, y: 10 }}
            className='mb-8'
          >
            <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600'>
              <ShieldCheck className='w-5 h-5' />
            </div>
            <h2 className='text-2xl font-bold text-gray-800'>
              Verify Identity
            </h2>
            <p className='text-gray-500 mt-2 text-sm'>
              Drag the Star to enter your code.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* OTP INPUT GRID */}
        <div className='flex justify-between gap-2'>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type='text'
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all outline-none ${
                isDropped
                  ? 'bg-gray-50 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-gray-800'
                  : 'bg-gray-100 border-gray-200 focus:ring-blue-50 text-gray-400'
              }`}
            />
          ))}
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
              {isDropped ? 'Verify Code' : 'Unlock to Verify'}{' '}
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

      {/* RESEND LOGIC */}
      {isDropped && (
        <div className='mt-6 text-center'>
          <p className='text-gray-500 text-xs flex items-center justify-center gap-1'>
            Didn't receive code?{' '}
            {canResend ? (
              <button
                onClick={handleResend}
                className='text-blue-600 font-bold hover:underline flex items-center gap-1'
              >
                <RotateCcw className='w-3 h-3' /> Resend
              </button>
            ) : (
              <span className='text-gray-400 font-medium'>
                Resend in 00:{timer.toString().padStart(2, '0')}
              </span>
            )}
          </p>
        </div>
      )}
    </motion.div>
  );
}
