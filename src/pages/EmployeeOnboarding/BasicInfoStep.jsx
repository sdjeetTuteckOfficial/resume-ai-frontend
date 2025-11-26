import { motion } from 'framer-motion';
import { Briefcase, ArrowLeft, Calendar } from 'lucide-react';
export default function BasicInfoStep({ formData, onChange, onNext, onPrev }) {
  return (
    <motion.div
      key='step2'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='space-y-4'
    >
      <div className='text-center'>
        <h3 className='text-lg font-bold text-gray-800'>The Basics</h3>
        <p className='text-[10px] text-gray-400'>
          What do you bring to the table?
        </p>
      </div>

      <div className='space-y-3'>
        <div className='relative'>
          <Briefcase className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <input
            name='jobRole'
            autoFocus
            value={formData.jobRole}
            onChange={onChange}
            placeholder='Job Title (e.g. Engineer)'
            className='w-full pl-9 pr-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-xs font-medium'
          />
        </div>

        <div className='relative'>
          <Calendar className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <select
            name='experience'
            value={formData.experience}
            onChange={onChange}
            className='w-full pl-9 pr-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-xs font-medium appearance-none cursor-pointer'
          >
            <option value='' disabled>
              Experience Level
            </option>
            <option value='0-1'>Fresher (0-1 Years)</option>
            <option value='1-3'>Junior (1-3 Years)</option>
            <option value='3-5'>Mid-Level (3-5 Years)</option>
            <option value='5+'>Senior (5+ Years)</option>
          </select>
        </div>
      </div>

      <div className='flex gap-2 pt-2'>
        <button
          onClick={onPrev}
          className='p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500'
        >
          <ArrowLeft className='w-4 h-4' />
        </button>
        <button
          onClick={onNext}
          disabled={!formData.jobRole}
          className='flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50'
        >
          Next Step
        </button>
      </div>
    </motion.div>
  );
}
