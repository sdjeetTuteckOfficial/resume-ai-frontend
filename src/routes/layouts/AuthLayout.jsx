// layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden relative flex items-center justify-center'>
      {/* Floating Background Orbs */}
      <div className='absolute inset-0 pointer-events-none'>
        <motion.div
          animate={{ y: [0, -60, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className='absolute -top-20 -left-20 w-[600px] h-[600px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl'
        />
        <motion.div
          animate={{ y: [0, 80, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className='absolute -bottom-32 -right-20 w-[700px] h-[700px] bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl'
        />
      </div>

      {/* Main Grid Container */}
      <div className='container mx-auto px-4 lg:px-12 relative z-10'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* LEFT COLUMN: Shared Branding/Text (Hidden on Mobile) */}
          <div className='hidden lg:flex flex-col items-start justify-center'>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className='max-w-lg'
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl mb-8'
              >
                <Briefcase className='w-10 h-10 text-white' />
              </motion.div>

              <h1 className='text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight'>
                Would you like to <br />
                <span className='bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent'>
                  join our offer?
                </span>
                🌹💍
              </h1>
              {/* {console.log(
                '\x1b[33m%s\x1b[0m',
                '⚠️ Warning: Joining here will emotionally damage your career.☠️'
              )} */}

              <p className='text-lg text-gray-600 mt-6 leading-relaxed'>
                Join thousands of professionals building their future. Your next
                great opportunity is just one click away.
              </p>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Dynamic Form Content (Login/Signup/Etc) */}
          <div className='w-full max-w-md mx-auto lg:ml-auto'>
            <div className='backdrop-blur-2xl bg-white/80 shadow-2xl rounded-3xl p-8 md:p-10 border border-white/50'>
              {/* Mobile Logo (Visible only on small screens) */}
              <div className='lg:hidden text-center mb-8'>
                <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-4'>
                  <Briefcase className='w-6 h-6 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-gray-900'>JobPortal</h2>
              </div>

              {/* This renders the clean LoginPage form */}
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
