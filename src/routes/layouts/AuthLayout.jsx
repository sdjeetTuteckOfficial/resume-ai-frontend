import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className='h-screen w-screen bg-slate-50 flex overflow-hidden relative'>
      {/* --- BACKGROUND LAYERS --- */}

      {/* 1. The Blue Wave (Left Side) */}
      <div className='absolute top-0 left-0 w-full h-full z-0 pointer-events-none'>
        <svg
          viewBox='0 0 1440 900'
          className='w-full h-full preserve-3d'
          preserveAspectRatio='none'
        >
          <path
            d='M0,0 L600,0 C750,0 700,400 400,900 L0,900 Z'
            fill='#1e40af' // Deep Blue
          />
          <path
            d='M0,0 L580,0 C720,0 680,400 380,900 L0,900 Z'
            fill='#3b82f6' // Lighter Blue overlay
            opacity='0.3'
          />
        </svg>
      </div>

      {/* 2. The Green Hills (Bottom Right) */}
      <div className='absolute bottom-0 right-0 w-3/4 h-1/2 z-0 pointer-events-none'>
        <svg
          viewBox='0 0 800 400'
          className='w-full h-full'
          preserveAspectRatio='none'
        >
          <path
            d='M0,400 C200,300 400,350 800,100 L800,400 Z'
            fill='#dcfce7'
            opacity='0.8'
          />
          <path
            d='M200,400 C400,350 600,380 800,250 L800,400 Z'
            fill='#bbf7d0'
          />
        </svg>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className='w-full h-full grid grid-cols-1 lg:grid-cols-12 relative z-10'>
        {/* LEFT COLUMN: Text (On top of Blue Wave) */}
        <div className='hidden lg:flex lg:col-span-4 flex-col justify-center px-12 text-white space-y-6'>
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className='text-5xl font-bold leading-tight'>
              Design Your <br />
              <span className='text-blue-200'>Career Path</span>
            </h1>
            <p className='mt-6 text-blue-100 text-lg leading-relaxed'>
              Join thousands of professionals finding their dream roles.
              restoration and growth starts here.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className='mt-8 px-8 py-3 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 transition-colors'
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Illustration + Login Form */}
        <div className='col-span-1 lg:col-span-8 flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 lg:px-12 relative'>
          {/* CENTER ILLUSTRATION: Guy with Binoculars */}
          {/* Positioned absolutely on large screens to sit between the wave and the form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className='absolute left-0 bottom-0 w-[500px] h-[500px] hidden xl:block pointer-events-none z-0 transform translate-x-20'
          >
            <svg
              viewBox='0 0 400 400'
              xmlns='http://www.w3.org/2000/svg'
              className='w-full h-full'
            >
              {/* Floating Elements (Search/Briefcase) */}
              <motion.g
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <circle
                  cx='50'
                  cy='100'
                  r='25'
                  fill='white'
                  stroke='#3b82f6'
                  strokeWidth='2'
                  opacity='0.8'
                />
                <path
                  d='M50 90 L60 110 M40 110 L50 90'
                  stroke='#3b82f6'
                  strokeWidth='2'
                />
                <circle
                  cx='300'
                  cy='50'
                  r='30'
                  fill='white'
                  stroke='#3b82f6'
                  strokeWidth='2'
                  opacity='0.6'
                />
              </motion.g>

              {/* THE GUY */}
              <g transform='translate(120, 100)'>
                {/* Legs */}
                <path
                  d='M60 180 L50 280'
                  stroke='#d4a373'
                  strokeWidth='22'
                  strokeLinecap='round'
                />{' '}
                {/* Left Leg */}
                <path
                  d='M90 180 L110 280'
                  stroke='#d4a373'
                  strokeWidth='22'
                  strokeLinecap='round'
                />{' '}
                {/* Right Leg */}
                {/* Shoes */}
                <path d='M38 280 L60 280 L60 290 L38 290 Z' fill='#1e293b' />
                <path
                  d='M100 280 L122 280 L122 290 L100 290 Z'
                  fill='#1e293b'
                />
                {/* Torso */}
                <path
                  d='M40 180 L110 180 L100 80 L50 80 Z'
                  fill='#3b82f6'
                />{' '}
                {/* Shirt */}
                {/* Head */}
                <circle cx='75' cy='60' r='25' fill='#ffedd5' /> {/* Face */}
                <path
                  d='M50 50 C50 30 100 30 100 50'
                  stroke='#1e293b'
                  strokeWidth='18'
                  strokeLinecap='round'
                />{' '}
                {/* Hair */}
                {/* Arms holding Binoculars */}
                <path
                  d='M60 90 L30 100 L40 80'
                  stroke='#3b82f6'
                  strokeWidth='18'
                  strokeLinecap='round'
                  fill='none'
                />{' '}
                {/* Left Arm */}
                <path
                  d='M90 90 L130 100 L120 80'
                  stroke='#3b82f6'
                  strokeWidth='18'
                  strokeLinecap='round'
                  fill='none'
                />{' '}
                {/* Right Arm */}
                {/* Binoculars */}
                <g transform='translate(60, 45)'>
                  <rect
                    x='0'
                    y='0'
                    width='40'
                    height='20'
                    rx='4'
                    fill='#1e293b'
                  />
                  <circle cx='10' cy='10' r='8' fill='#60a5fa' />
                  <circle cx='30' cy='10' r='8' fill='#60a5fa' />
                </g>
              </g>
            </svg>
          </motion.div>

          {/* LOGIN FORM CONTAINER (Floats on the right) */}
          <div className='w-full max-w-md ml-auto z-20'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
