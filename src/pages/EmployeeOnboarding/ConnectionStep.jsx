import { motion } from 'framer-motion';
import PlugConnection from './PlugConnection';
import { ArrowRight } from 'lucide-react';

export default function ConnectionStep({ isPlugged, onPlugged, onNext }) {
  return (
    <motion.div
      key='step1'
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='text-center space-y-6'
    >
      <div>
        <h2 className='text-xl font-bold text-gray-800'>
          {isPlugged ? 'System Online' : 'Connect to Start'}
        </h2>
        <p className='text-xs text-gray-500 mt-2 px-4 leading-relaxed'>
          {isPlugged
            ? "Power level optimal. Let's configure your profile."
            : 'Drag the plug into the socket to power up the system.'}
        </p>
      </div>

      <PlugConnection isPlugged={isPlugged} onPlugged={onPlugged} />

      <div className='h-12'>
        {isPlugged && (
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className='w-full py-3.5 rounded-xl shadow-lg shadow-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2'
          >
            Start Journey <ArrowRight className='w-4 h-4' />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
