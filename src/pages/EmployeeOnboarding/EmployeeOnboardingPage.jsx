import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Component Imports
import ProgressIndicator from './ProgressIndicator';
import AnimatedHeader from './AnimatedHeader';
import ConnectionStep from './ConnectionStep';
import BasicInfoStep from './BasicInfoStep';
import BioStep from './BioStep';
import UploadStep from './UploadStep';
import AiInterviewManager from './GapEstimation';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlugged, setIsPlugged] = useState(false);

  const [formData, setFormData] = useState({
    jobRole: '',
    job_id: '', // <--- NEW: Initialize job_id in state
    bio: '',
    cvFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    setFormData((prev) => ({ ...prev, cvFile: file }));
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, cvFile: null }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('Welcome aboard! Information submitted successfully.');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isWideLayout = step === 2 || step === 4;

  return (
    <div className='w-full min-h-screen flex justify-center items-start pt-8 bg-gray-50/50 p-4'>
      <motion.div
        layout
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          relative w-full bg-white shadow-xl border border-gray-100 overflow-hidden rounded-3xl p-6
          ${isWideLayout ? 'max-w-4xl' : 'max-w-[400px]'} 
        `}
      >
        <AnimatedHeader isPlugged={isPlugged} />

        {step > 1 && <ProgressIndicator currentStep={step} totalSteps={5} />}

        <AnimatePresence mode='wait' custom={step}>
          {step === 1 && (
            <ConnectionStep
              key='step1'
              isPlugged={isPlugged}
              onPlugged={setIsPlugged}
              onNext={nextStep}
            />
          )}

          {step === 2 && (
            <BasicInfoStep
              key='step2'
              formData={formData}
              onChange={handleInputChange}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {step === 3 && (
            <BioStep
              key='step3'
              // Ensure we pass formData here so BioStep can access job_id
              formData={formData}
              onChange={handleInputChange}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {step === 4 && (
            <motion.div
              key='step4'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='w-full'
            >
              <AiInterviewManager
                userId='current_user'
                jobRole={formData.jobRole}
                onComplete={nextStep}
              />
              <button
                onClick={prevStep}
                className='mt-4 text-sm text-gray-400 hover:text-gray-600 underline w-full text-center'
              >
                Back to Bio
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <UploadStep
              key='step5'
              formData={formData}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
              onSubmit={handleSubmit}
              onPrev={prevStep}
              isLoading={isLoading}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
