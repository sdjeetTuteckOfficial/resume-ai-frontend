import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
export default function BioStep({ formData, onChange, onNext, onPrev }) {
  return (
    <motion.div
      key='step3'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='space-y-4'
    >
      <div className='text-center'>
        <h3 className='text-lg font-bold text-gray-800'>About You</h3>
        <p className='text-[10px] text-gray-400'>In 140 characters or less</p>
      </div>

      <textarea
        name='bio'
        rows={4}
        value={formData.bio}
        onChange={onChange}
        placeholder='I love coding because...'
        className='w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-xs font-medium resize-none'
      />

      <div className='flex gap-2 pt-2'>
        <button
          onClick={onPrev}
          className='p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500'
        >
          <ArrowLeft className='w-4 h-4' />
        </button>
        <button
          onClick={onNext}
          className='flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800'
        >
          Next Step
        </button>
      </div>
    </motion.div>
  );
}
