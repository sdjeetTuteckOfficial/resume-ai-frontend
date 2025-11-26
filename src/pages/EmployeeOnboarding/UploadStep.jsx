import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import FileUpload from './FileUpload';
export default function UploadStep({
  formData,
  onFileChange,
  onRemoveFile,
  onSubmit,
  onPrev,
  isLoading,
}) {
  return (
    <motion.div
      key='step4'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='space-y-4'
    >
      <div className='text-center'>
        <h3 className='text-lg font-bold text-gray-800'>Final Step</h3>
        <p className='text-[10px] text-gray-400'>Upload your resume</p>
      </div>

      <FileUpload
        file={formData.cvFile}
        onFileChange={onFileChange}
        onRemoveFile={onRemoveFile}
      />

      <div className='flex gap-2 pt-2'>
        <button
          onClick={onPrev}
          className='p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500'
        >
          <ArrowLeft className='w-4 h-4' />
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading || !formData.cvFile}
          className='flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50'
        >
          {isLoading ? (
            <Loader2 className='animate-spin w-4 h-4' />
          ) : (
            <>
              Submit <Check className='w-3 h-3' />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
