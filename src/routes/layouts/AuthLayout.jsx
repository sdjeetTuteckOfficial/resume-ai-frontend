import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, Target } from 'lucide-react';

export default function AuthLayout() {
  return (
    // Changed min-h-screen to h-screen + overflow-hidden to force fit on laptop screens
    // Reduced padding to p-4
    <div className='h-screen w-screen bg-gradient-to-br from-[#f0f9ff] via-white to-[#ecfdf5] flex items-center justify-center p-4 overflow-hidden relative'>
      {/* Background Blobs (Made smaller/subtler) */}
      <div className='absolute inset-0 pointer-events-none'>
        <motion.div
          animate={{ y: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className='absolute top-10 left-10 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl'
        />
        <motion.div
          animate={{ y: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className='absolute bottom-10 right-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl'
        />
      </div>

      {/* Main Grid - Reduced gap drastically (gap-4) to fit screen */}
      <div className='grid lg:grid-cols-2 gap-4 lg:gap-8 items-center w-full max-w-6xl mx-auto relative z-10'>
        {/* LEFT: Illustration */}
        <div className='hidden lg:flex flex-col justify-center items-center lg:items-start space-y-6'>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className='relative'
          >
            {/* Text Badge - Moved ABOVE illustration to balance height */}
            <div className='mb-6'>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold text-sm shadow-sm'
              >
                <Target className='w-4 h-4' />
                <span>Tuteck Job Onbaording</span>
              </motion.div>

              <h1 className='text-5xl font-black text-gray-900 leading-tight mt-4'>
                Find Your <br />
                <span className='bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent'>
                  Next Big Role
                </span>
              </h1>
            </div>

            {/* Animated Illustration */}
            <div className='relative w-[380px] h-[320px]'>
              <svg
                viewBox='0 0 480 420'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='w-full h-full drop-shadow-xl'
              >
                {/* SCANNING ANIMATION: Shoulders and Arms rotate slightly */}
                <motion.g
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ originX: '50%', originY: '90%' }} // Pivot from bottom
                >
                  {/* Head */}
                  <circle cx='240' cy='120' r='42' fill='#1e293b' />
                  {/* Body */}
                  <rect
                    x='195'
                    y='162'
                    width='90'
                    height='140'
                    rx='45'
                    fill='#1e293b'
                  />
                  {/* Arms */}
                  <path
                    d='M180 210 Q150 250 180 290'
                    stroke='#1e293b'
                    strokeWidth='48'
                    strokeLinecap='round'
                  />
                  <path
                    d='M300 210 Q330 250 300 290'
                    stroke='#1e293b'
                    strokeWidth='48'
                    strokeLinecap='round'
                  />

                  {/* Binoculars Group */}
                  <g>
                    {/* Left Lens */}
                    <circle
                      cx='200'
                      cy='190'
                      r='45'
                      fill='#f1f5f9'
                      stroke='#475569'
                      strokeWidth='12'
                    />
                    <motion.circle
                      cx='200'
                      cy='190'
                      r='32'
                      fill='#3b82f6'
                      animate={{ opacity: [0.6, 0.9, 0.6] }} // Focus Pulse
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <circle
                      cx='190'
                      cy='180'
                      r='8'
                      fill='white'
                      opacity='0.6'
                    />

                    {/* Right Lens */}
                    <circle
                      cx='280'
                      cy='190'
                      r='45'
                      fill='#f1f5f9'
                      stroke='#475569'
                      strokeWidth='12'
                    />
                    <motion.circle
                      cx='280'
                      cy='190'
                      r='32'
                      fill='#3b82f6'
                      animate={{ opacity: [0.6, 0.9, 0.6] }} // Focus Pulse
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <circle
                      cx='270'
                      cy='180'
                      r='8'
                      fill='white'
                      opacity='0.6'
                    />

                    {/* Bridge */}
                    <rect
                      x='220'
                      y='180'
                      width='40'
                      height='20'
                      fill='#475569'
                    />
                  </g>
                </motion.g>

                {/* Radar Waves / Searching Effect */}
                <motion.circle
                  cx='240'
                  cy='190'
                  r='60'
                  stroke='#3b82f6'
                  strokeWidth='2'
                  fill='none'
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle
                  cx='240'
                  cy='190'
                  r='60'
                  stroke='#3b82f6'
                  strokeWidth='2'
                  fill='none'
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />

                {/* Floating Elements (Job Cards) */}
                {[
                  { x: 380, y: 80, color: '#fbbf24' },
                  { x: 420, y: 140, color: '#34d399' },
                  { x: 100, y: 100, color: '#f472b6' },
                ].map((item, i) => (
                  <motion.circle
                    key={i}
                    cx={item.x}
                    cy={item.y}
                    r='8'
                    fill={item.color}
                    animate={{ y: [0, -15, 0], opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </svg>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Login Form Card - Made Compact */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className='w-full max-w-[420px] mx-auto'
        >
          <div className='bg-white/90 backdrop-blur-xl shadow-2xl shadow-blue-900/5 rounded-2xl p-8 border border-white'>
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
