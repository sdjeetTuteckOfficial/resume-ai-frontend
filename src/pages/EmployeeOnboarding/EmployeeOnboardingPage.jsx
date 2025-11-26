import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressIndicator from './ProgressIndicator';
import AnimatedHeader from './AnimatedHeader';
import ConnectionStep from './ConnectionStep';
import BasicInfoStep from './BasicInfoStep';
import BioStep from './BioStep';
import UploadStep from './UploadStep';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlugged, setIsPlugged] = useState(false);
  const [formData, setFormData] = useState({
    jobRole: '',
    experience: '',
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

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
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

  return (
    <div className='w-full flex justify-center items-start pt-8'>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative w-full max-w-[380px] p-6 rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden'
      >
        <AnimatedHeader isPlugged={isPlugged} />

        {step > 1 && <ProgressIndicator currentStep={step} totalSteps={4} />}

        <AnimatePresence mode='wait' custom={step}>
          {step === 1 && (
            <ConnectionStep
              isPlugged={isPlugged}
              onPlugged={setIsPlugged}
              onNext={nextStep}
            />
          )}

          {step === 2 && (
            <BasicInfoStep
              formData={formData}
              onChange={handleInputChange}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {step === 3 && (
            <BioStep
              formData={formData}
              onChange={handleInputChange}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {step === 4 && (
            <UploadStep
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
