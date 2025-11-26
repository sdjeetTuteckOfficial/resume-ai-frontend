import { motion } from 'framer-motion';
export default function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <div className='flex justify-center gap-2 mb-6'>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <motion.div
          key={s}
          initial={false}
          animate={{
            backgroundColor: s <= currentStep ? '#f59e0b' : '#e5e7eb',
            scale: s === currentStep ? 1.2 : 1,
          }}
          className='w-2 h-2 rounded-full transition-colors duration-300'
        />
      ))}
    </div>
  );
}
