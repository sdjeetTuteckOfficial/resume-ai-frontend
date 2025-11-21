import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../security/axiosInstance';

export default function ForgotPasswordPage() {
  const { isDropped } = useOutletContext();
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP & Reset
  const [email, setEmail] = useState('');

  // Step 2 State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for OTP focus management
  const inputRefs = useRef([]);

  // Auto-focus logic
  useEffect(() => {
    if (isDropped) {
      if (step === 1) {
        setTimeout(() => document.getElementById('email-input')?.focus(), 500);
      } else {
        setTimeout(() => inputRefs.current[0]?.focus(), 500);
      }
    }
  }, [isDropped, step]);

  // --- OTP HANDLERS ---
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, 6).split('');
    if (data.length === 0) return;
    const newOtp = [...otp];
    data.forEach((char, idx) => {
      if (idx < 6 && !isNaN(char)) newOtp[idx] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(data.length, 5)].focus();
  };

  // --- API HANDLERS ---

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await axiosInstance.post('/auth/forgot-password', {
        email: email.trim(),
      });

      setMessage({ type: 'success', text: 'Code sent to email!' });
      setTimeout(() => {
        setMessage(null);
        setStep(2);
      }, 1000);
    } catch (error) {
      console.error('Forgot Password Error:', error);
      const errorMsg = error.response?.data?.message || 'Could not send code';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password too short (min 6)' });
      setIsLoading(false);
      return;
    }

    const otpString = otp.join('');
    if (otpString.length < 6) {
      setMessage({ type: 'error', text: 'Enter full 6-digit code' });
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/auth/reset-password', {
        email: email.trim(),
        otp: otpString,
        new_password: newPassword,
      });

      setMessage({ type: 'success', text: 'Password reset! Redirecting...' });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Reset Error:', error);
      const errorMsg =
        error.response?.data?.message || 'Failed to reset password';
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
        {/* HEADER AREA */}
        {isDropped ? (
          <motion.div
            key='unlocked'
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className='mb-6 text-center'
          >
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-3'>
              <CheckCircle2 className='w-3 h-3' /> RECOVERY MODE
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>
              {step === 1 ? 'Find Account' : 'Reset Password'}
            </h2>
            <p className='text-gray-500 text-xs mt-1'>
              {step === 1
                ? 'Enter your email to receive a code.'
                : `Enter code sent to ${email}`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key='locked'
            exit={{ opacity: 0, y: 10 }}
            className='mb-8'
          >
            <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600'>
              <KeyRound className='w-5 h-5' />
            </div>
            <h2 className='text-2xl font-bold text-gray-800'>
              Forgot Password?
            </h2>
            <p className='text-gray-500 mt-2 text-sm'>
              Drag the Star to unlock recovery.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM AREA */}
      <div className='relative'>
        <AnimatePresence mode='wait'>
          {step === 1 ? (
            /* STEP 1: EMAIL FORM */
            <motion.form
              key='step1'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOtp}
              className='space-y-4'
            >
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-gray-600 ml-1 uppercase'>
                  Email Address
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
                    placeholder='name@example.com'
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border transition-all outline-none text-sm font-medium ${
                      isDropped
                        ? 'border-amber-200 focus:ring-amber-100'
                        : 'border-gray-200 focus:ring-blue-50'
                    }`}
                  />
                </div>
              </div>

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
                    {isDropped ? 'Send Code' : 'Unlock First'}{' '}
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : (
            /* STEP 2: OTP + NEW PASSWORD FORM */
            <motion.form
              key='step2'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleResetPassword}
              className='space-y-4'
            >
              {/* OTP INPUTS */}
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-gray-600 ml-1 uppercase'>
                  Verification Code
                </label>
                <div className='flex justify-between gap-1'>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type='text'
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      disabled={isLoading}
                      className='w-10 h-12 text-center text-lg font-bold rounded-lg bg-gray-50 border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-gray-800 outline-none'
                    />
                  ))}
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-gray-600 ml-1 uppercase'>
                  New Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-3.5 h-4 w-4 text-amber-500' />
                  <input
                    type='password'
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder='New password'
                    className='w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-amber-200 focus:ring-amber-100 outline-none text-sm font-medium'
                  />
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-gray-600 ml-1 uppercase'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-3.5 h-4 w-4 text-amber-500' />
                  <input
                    type='password'
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder='Repeat password'
                    className='w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-amber-200 focus:ring-amber-100 outline-none text-sm font-medium'
                  />
                </div>
              </div>

              <div className='flex gap-3 pt-2'>
                <motion.button
                  type='button'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                  className='p-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors'
                >
                  <ArrowLeft className='w-5 h-5' />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type='submit'
                  disabled={isLoading}
                  className='flex-1 py-3.5 font-bold rounded-xl shadow-lg shadow-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm flex items-center justify-center gap-2'
                >
                  {isLoading ? (
                    <Loader2 className='animate-spin w-5 h-5' />
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* MESSAGES */}
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

        {/* BACK TO LOGIN */}
        {!isDropped && (
          <div className='mt-6 text-center'>
            <p className='text-gray-500 text-xs'>
              Remembered it?{' '}
              <a
                href='/login'
                className='text-blue-600 font-bold hover:underline'
              >
                Sign In
              </a>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
