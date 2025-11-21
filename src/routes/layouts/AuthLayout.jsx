import { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, Briefcase } from 'lucide-react';

export default function AuthLayout() {
  const [isDropped, setIsDropped] = useState(false);
  const constraintsRef = useRef(null);
  const dropZoneRef = useRef(null);
  const controls = useAnimation();

  // --- DRAG & DROP LOGIC ---
  const handleDragEnd = (event, info) => {
    if (!dropZoneRef.current) return;

    const dropZone = dropZoneRef.current.getBoundingClientRect();
    const dropPoint = { x: info.point.x, y: info.point.y };

    const isInside =
      dropPoint.x >= dropZone.left &&
      dropPoint.x <= dropZone.right &&
      dropPoint.y >= dropZone.top &&
      dropPoint.y <= dropZone.bottom;

    if (isInside) {
      setIsDropped(true);
    } else {
      controls.start({ x: 0, y: 0 }); // Snap back
    }
  };

  return (
    <div
      ref={constraintsRef}
      className='h-screen w-screen bg-slate-50 flex overflow-hidden relative'
    >
      {/* --- LAYER 1: STATIC BACKGROUNDS --- */}

      {/* Blue Wave (Left) */}
      <div className='absolute top-0 left-0 w-full h-full z-0 pointer-events-none'>
        <svg
          viewBox='0 0 1440 900'
          className='w-full h-full preserve-3d'
          preserveAspectRatio='none'
        >
          <path
            d='M0,0 L600,0 C750,0 700,400 400,900 L0,900 Z'
            fill='#1e40af'
          />
          <path
            d='M0,0 L580,0 C720,0 680,400 380,900 L0,900 Z'
            fill='#3b82f6'
            opacity='0.3'
          />
        </svg>
      </div>

      {/* Green Hills (Right) */}
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

      {/* --- LAYER 2: THE GUY WITH BINOCULARS (Background Element) --- */}
      {/* Positioned absolutely to stand on the hills, behind the form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className='absolute bottom-0 right-[5%] lg:right-[10%] w-[400px] h-[400px] z-0 pointer-events-none hidden md:block'
      >
        <svg
          viewBox='0 0 400 400'
          xmlns='http://www.w3.org/2000/svg'
          className='w-full h-full drop-shadow-xl'
        >
          {/* Floating Job Icons near him */}
          <motion.g
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <circle
              cx='50'
              cy='100'
              r='20'
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
          </motion.g>

          {/* THE GUY */}
          <motion.g
            transform='translate(100, 100)'
            animate={{ rotate: [-1, 1, -1] }} // Subtle sway
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '50%', originY: '100%' }}
          >
            {/* Legs */}
            <path
              d='M60 180 L50 300'
              stroke='#d4a373'
              strokeWidth='24'
              strokeLinecap='round'
            />
            <path
              d='M90 180 L110 300'
              stroke='#d4a373'
              strokeWidth='24'
              strokeLinecap='round'
            />

            {/* Shoes */}
            <path d='M35 300 L65 300 L65 315 L35 315 Z' fill='#1e293b' />
            <path d='M100 300 L130 300 L130 315 L100 315 Z' fill='#1e293b' />

            {/* Torso */}
            <path d='M40 180 L110 180 L100 80 L50 80 Z' fill='#2563eb' />

            {/* Head */}
            <circle cx='75' cy='60' r='28' fill='#ffedd5' />
            <path
              d='M45 50 C45 25 105 25 105 50'
              stroke='#1e293b'
              strokeWidth='20'
              strokeLinecap='round'
            />

            {/* Arms holding Binoculars */}
            <path
              d='M60 90 L30 100 L40 80'
              stroke='#2563eb'
              strokeWidth='20'
              strokeLinecap='round'
              fill='none'
            />
            <path
              d='M90 90 L130 100 L120 80'
              stroke='#2563eb'
              strokeWidth='20'
              strokeLinecap='round'
              fill='none'
            />

            {/* Binoculars with Pulse Animation */}
            <g transform='translate(60, 45)'>
              <rect x='0' y='0' width='40' height='20' rx='4' fill='#1e293b' />
              <circle cx='10' cy='10' r='8' fill='#60a5fa' />
              <circle cx='30' cy='10' r='8' fill='#60a5fa' />
              <motion.circle
                cx='30'
                cy='10'
                r='8'
                fill='white'
                opacity='0.5'
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </g>
          </motion.g>
        </svg>
      </motion.div>

      {/* --- LAYER 3: CONTENT GRID --- */}
      <div className='w-full h-full grid grid-cols-1 lg:grid-cols-12 relative z-10'>
        {/* LEFT: Text + Draggable Star */}
        <div className='hidden lg:flex lg:col-span-4 flex-col justify-center items-center px-12 text-white space-y-10'>
          {!isDropped ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col items-center text-center space-y-8'
            >
              <div>
                <h1 className='text-4xl font-bold leading-tight'>
                  Search <br />
                  <span className='text-yellow-300'>Intelligently</span>
                </h1>
                <p className='mt-4 text-blue-100 text-sm'>
                  Drag the opportunity star to the portal.
                </p>
              </div>

              {/* DRAGGABLE ORB */}
              <motion.div
                drag
                dragConstraints={constraintsRef}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={controls}
                whileHover={{ scale: 1.1, cursor: 'grab' }}
                whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
                className='relative w-24 h-24 z-50 touch-none'
              >
                <div className='absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse' />
                <div className='relative w-full h-full bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/30 backdrop-blur-sm'>
                  <Sparkles className='w-10 h-10 text-white' />
                </div>
                <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/90 text-xs font-bold bg-blue-900/30 px-3 py-1 rounded-full whitespace-nowrap pointer-events-none'>
                  Drag Me ➔
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='text-center'
            >
              <Briefcase className='w-16 h-16 text-yellow-300 mx-auto mb-4' />
              <h2 className='text-3xl font-bold'>Matched!</h2>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Login Form (Drop Zone) */}
        {/* Added backdrop-blur-none to parent so the Guy is visible behind */}
        <div className='col-span-1 lg:col-span-8 flex items-center justify-center relative'>
          <div ref={dropZoneRef} className='relative p-8 z-20'>
            <Outlet context={{ isDropped }} />
          </div>
        </div>
      </div>
    </div>
  );
}
