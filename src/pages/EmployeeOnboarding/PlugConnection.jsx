import React, { useState, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import { Zap } from 'lucide-react';
export default function PlugConnection({ isPlugged, onPlugged }) {
  const constraintsRef = useRef(null);
  const plugControls = useAnimation();
  const plugX = useMotionValue(0);

  const wirePath = useTransform(plugX, (x) => {
    const startX = 0;
    const startY = 64;
    const endX = x + 2;
    const endY = 64;

    const distance = 220 - x;
    const slack = Math.max(0, distance * 0.3);
    const cpX = (startX + endX) / 2;
    const cpY = startY + slack;

    return `M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}`;
  });

  const handlePlugDragEnd = (event, info) => {
    if (info.offset.x > 190) {
      onPlugged(true);
      plugControls.start({
        x: 220,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      });
    } else {
      onPlugged(false);
      plugControls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 200, damping: 25 },
      });
    }
  };

  return (
    <div
      className='relative w-full h-32 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center'
      ref={constraintsRef}
    >
      {!isPlugged && (
        <span className='absolute left-0 right-0 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none animate-pulse'>
          Drag to Connect
        </span>
      )}

      <svg className='absolute top-0 left-0 w-full h-full pointer-events-none z-0'>
        <motion.path
          d={wirePath}
          stroke='#475569'
          strokeWidth='4'
          fill='none'
          strokeLinecap='round'
        />
      </svg>

      {/* Wall Socket */}
      <div className='absolute right-6 top-1/2 -translate-y-1/2 z-0'>
        <div className='w-10 h-14 bg-slate-200 rounded-md border border-slate-300 shadow-sm flex flex-col items-center justify-center gap-3 relative'>
          <div className='w-1.5 h-3 bg-slate-400 rounded-full shadow-inner'></div>
          <div className='w-1.5 h-3 bg-slate-400 rounded-full shadow-inner'></div>

          {isPlugged && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className='absolute inset-0 flex items-center justify-center'
            >
              <Zap className='w-8 h-8 text-amber-400 fill-amber-400' />
            </motion.div>
          )}
        </div>
      </div>

      {/* Draggable Plug */}
      <motion.div
        drag='x'
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        animate={plugControls}
        onDragEnd={handlePlugDragEnd}
        style={{ x: plugX, top: 44 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ cursor: 'grabbing' }}
        className='absolute left-0 z-10 cursor-grab active:cursor-grabbing'
      >
        <svg width='60' height='40' viewBox='0 0 60 40'>
          <rect x='45' y='12' width='12' height='6' rx='1' fill='#cbd5e1' />
          <rect x='45' y='22' width='12' height='6' rx='1' fill='#cbd5e1' />
          <path
            d='M 0 10 Q 5 10 10 5 L 35 5 Q 45 5 45 15 L 45 25 Q 45 35 35 35 L 10 35 Q 5 30 0 30 Z'
            fill='#334155'
          />
          <rect x='20' y='12' width='2' height='16' rx='1' fill='#475569' />
          <rect x='25' y='12' width='2' height='16' rx='1' fill='#475569' />
          <rect x='30' y='12' width='2' height='16' rx='1' fill='#475569' />
        </svg>
      </motion.div>
    </div>
  );
}
