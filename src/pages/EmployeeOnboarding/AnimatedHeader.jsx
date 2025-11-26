import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnimatedHeader({ isPlugged }) {
  return (
    <div className='flex justify-center mb-4 relative z-10'>
      <motion.div
        className={`p-4 rounded-full transition-colors duration-500 ${
          isPlugged ? 'bg-amber-50' : 'bg-slate-50'
        }`}
        animate={
          isPlugged
            ? {
                boxShadow: [
                  '0 0 0px rgba(251, 191, 36, 0)',
                  '0 0 50px rgba(251, 191, 36, 0.8)',
                  '0 0 0px rgba(251, 191, 36, 0)',
                ],
              }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Lightbulb
          className={`w-10 h-10 transition-all duration-500 ${
            isPlugged ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
          }`}
        />
      </motion.div>
    </div>
  );
}
