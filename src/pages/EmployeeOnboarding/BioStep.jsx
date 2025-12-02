import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import axiosInstance from '../../security/axiosInstance';

// --- Validation Schema ---
const schema = yup
  .object({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    phone: yup
      .string()
      .matches(/^[0-9]+$/, 'Digits only')
      .min(10, 'Min 10 digits')
      .required('Required'),
    gender: yup.string().required('Required'),
    city: yup.string().required('Required'),
    stateProvince: yup.string().required('Required'),
    qualification: yup.string().required('Required'),
    skills: yup.string().required('Required'),
    cvFile: yup
      .mixed()
      .test('required', 'Required', (value) => value && value.length > 0)
      .test('fileType', 'Unsupported file type', (value) => {
        if (!value || value.length === 0) return true;
        return [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(value[0].type);
      }),
  })
  .required();

const STEPS = [
  {
    id: 'identity',
    title: 'Personal Info',
    subtitle: 'Who are you?',
    fields: ['firstName', 'lastName', 'phone', 'gender'],
    icon: User,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    id: 'location',
    title: 'Address Details',
    subtitle: 'Where are you located?',
    fields: ['city', 'stateProvince'],
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    id: 'professional',
    title: 'Professional Profile',
    subtitle: 'Your skills and documents',
    fields: ['qualification', 'skills', 'cvFile'],
    icon: Briefcase,
    color: 'text-violet-600',
    bg: 'bg-violet-100',
  },
];

const InputField = ({
  label,
  error,
  register,
  name,
  type = 'text',
  ...props
}) => (
  <div className='w-full'>
    <label className='text-xs font-semibold text-slate-500 block mb-1 uppercase tracking-wide'>
      {label}
    </label>
    <input
      {...register(name)}
      {...props}
      type={type}
      className={`
        w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none text-sm transition-all placeholder:text-slate-400
        ${
          error
            ? 'border-red-400 focus:bg-red-50'
            : 'border-slate-200 focus:border-blue-500 focus:bg-white'
        }
      `}
    />
    {error && (
      <p className='text-red-500 text-[10px] mt-0.5'>{error.message}</p>
    )}
  </div>
);

// --- BioStep Component ---
// UPDATED: Destructuring formData (passed from parent) instead of allData
export default function BioStep({
  formData: parentFormData = {}, // Aliased to avoid conflict with local FormData
  setAllData = () => {},
  onNext = () => {},
  onPrev = () => {},
}) {
  const [internalStep, setInternalStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { ...parentFormData },
    mode: 'onChange',
  });

  const currentFile = watch('cvFile');
  const currentStepConfig = STEPS[internalStep];

  const handleNextInternal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const isStepValid = await trigger(currentStepConfig.fields);

    if (isStepValid) {
      setApiError(null);

      // Update local state or parent state if needed via setAllData wrapper
      // (Skipping for brevity as we are focusing on submission)

      if (internalStep < STEPS.length - 1) {
        setDirection(1);
        setInternalStep((prev) => prev + 1);
      } else {
        handleSubmit(finalSubmit)();
      }
    }
  };

  const handleBackInternal = () => {
    setApiError(null);
    if (internalStep > 0) {
      setDirection(-1);
      setInternalStep((prev) => prev - 1);
    } else {
      onPrev();
    }
  };

  // --- UPDATED SUBMIT LOGIC ---
  const finalSubmit = async (data) => {
    setLoading(true);
    setApiError(null);

    // 1. Create a FormData object
    const formData = new FormData();

    // 2. Append text fields
    formData.append('first_name', data.firstName);
    formData.append('last_name', data.lastName);
    formData.append('gender', data.gender);
    formData.append('phone', data.phone);
    formData.append('city', data.city);
    formData.append('state_province', data.stateProvince);
    formData.append('qualification', data.qualification);
    formData.append('skills', data.skills);

    // 3. NEW: Append job_id from parent props
    if (parentFormData.job_id) {
      formData.append('job_id', parentFormData.job_id);
    }

    // 4. Append the file
    if (data.cvFile && data.cvFile.length > 0) {
      formData.append('cv_file', data.cvFile[0]);
    }

    try {
      await axiosInstance.post('/user_details/user_entry', formData);
      onNext();
    } catch (err) {
      console.error(err);
      setApiError(
        err.response?.data?.detail || 'API submission failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
  };

  return (
    <div className='w-full max-w-lg mx-auto flex flex-col min-h-[400px]'>
      <div className='mb-4 flex items-center justify-between border-b border-slate-100 pb-3'>
        <div className='flex items-center gap-3'>
          <div
            className={`p-2 rounded-xl ${currentStepConfig.bg} ${currentStepConfig.color} shadow-md`}
          >
            <currentStepConfig.icon size={20} />
          </div>
          <div>
            <h2 className='text-xl font-extrabold text-slate-900 leading-tight'>
              {currentStepConfig.title}
            </h2>
            <p className='text-xs text-slate-500 mt-0.5'>
              {currentStepConfig.subtitle}
            </p>
          </div>
        </div>

        <div className='flex space-x-1.5'>
          {STEPS.map((stepConfig, idx) => (
            <div
              key={idx}
              title={stepConfig.title}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === internalStep
                  ? `${stepConfig.color.replace('text', 'bg')} w-4 shadow-inner`
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg flex items-center'
        >
          <AlertCircle size={16} className='mr-2 flex-shrink-0' />
          <span className='font-medium'>{apiError}</span>
        </motion.div>
      )}

      {/* Form Content */}
      <div className='flex-1 relative overflow-hidden'>
        <AnimatePresence mode='wait' custom={direction}>
          <motion.form
            key={internalStep}
            custom={direction}
            variants={variants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{ type: 'tween', duration: 0.3 }}
            className='space-y-4 pt-2'
            onSubmit={(e) => {
              e.preventDefault();
              handleNextInternal();
            }}
          >
            {/* 1. Identity */}
            {internalStep === 0 && (
              <div className='grid grid-cols-2 gap-4'>
                <InputField
                  label='First Name'
                  name='firstName'
                  register={register}
                  error={errors.firstName}
                  placeholder='Jane'
                />
                <InputField
                  label='Last Name'
                  name='lastName'
                  register={register}
                  error={errors.lastName}
                  placeholder='Doe'
                />
                <div className='col-span-2'>
                  <InputField
                    label='Phone Number'
                    name='phone'
                    register={register}
                    error={errors.phone}
                    placeholder='9876543210'
                    type='tel'
                  />
                </div>
                <div className='col-span-2'>
                  <label className='text-xs font-semibold text-slate-500 block mb-1 uppercase tracking-wide'>
                    Gender
                  </label>
                  <select
                    {...register('gender')}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none transition-all
                      ${
                        errors.gender
                          ? 'border-red-400 focus:bg-red-50'
                          : 'border-slate-200 focus:border-blue-500 focus:bg-white'
                      }
                    `}
                  >
                    <option value=''>Select...</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>
                  {errors.gender && (
                    <p className='text-red-500 text-[10px] mt-0.5'>
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 2. Location */}
            {internalStep === 1 && (
              <div className='space-y-4'>
                <InputField
                  label='City'
                  name='city'
                  register={register}
                  error={errors.city}
                  placeholder='New York'
                />
                <InputField
                  label='State / Province'
                  name='stateProvince'
                  register={register}
                  error={errors.stateProvince}
                  placeholder='NY, CA, etc.'
                />
              </div>
            )}

            {/* 3. Professional */}
            {internalStep === 2 && (
              <div className='space-y-4'>
                <InputField
                  label='Highest Qualification'
                  name='qualification'
                  register={register}
                  error={errors.qualification}
                  placeholder='B.Tech, MBA, PhD...'
                />

                <div>
                  <label className='text-xs font-semibold text-slate-500 block mb-1 uppercase tracking-wide'>
                    Key Skills (e.g., React, Node, SQL)
                  </label>
                  <textarea
                    {...register('skills')}
                    rows='2'
                    placeholder='List your main skills, separated by commas.'
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none resize-none transition-all
                      ${
                        errors.skills
                          ? 'border-red-400 focus:bg-red-50'
                          : 'border-slate-200 focus:border-blue-500 focus:bg-white'
                      }
                    `}
                  />
                  {errors.skills && (
                    <p className='text-red-500 text-[10px] mt-0.5'>
                      {errors.skills.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`
                      flex items-center justify-center w-full h-12 border border-dashed rounded-lg cursor-pointer transition-colors
                      ${
                        errors.cvFile
                          ? 'border-red-400 bg-red-50'
                          : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                      }
                    `}
                  >
                    <input
                      type='file'
                      {...register('cvFile')}
                      className='hidden'
                      accept='.pdf,.doc,.docx'
                    />
                    {currentFile && currentFile.length > 0 ? (
                      <div className='flex items-center text-emerald-600 text-sm font-medium'>
                        <CheckCircle2 size={16} className='mr-2' />
                        <span className='truncate max-w-[200px]'>
                          {currentFile[0].name}
                        </span>
                      </div>
                    ) : (
                      <span className='text-sm font-medium text-slate-500'>
                        <Briefcase
                          size={16}
                          className='inline mr-2 text-violet-500'
                        />
                        Upload CV (PDF/DOC)
                      </span>
                    )}
                  </label>
                  {errors.cvFile && (
                    <p className='text-red-500 text-[10px] mt-0.5'>
                      {errors.cvFile.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.form>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className='flex justify-between items-center pt-4 mt-4 border-t border-slate-100'>
        <button
          type='button'
          onClick={handleBackInternal}
          className='flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50'
          disabled={loading}
        >
          <ArrowLeft size={16} className='mr-1' />
          {internalStep === 0 ? 'Back to Step 2' : 'Previous'}
        </button>

        <button
          type='submit'
          onClick={handleNextInternal}
          disabled={loading}
          className='flex items-center bg-slate-900 text-white px-6 py-2.5 rounded-xl text-base font-semibold shadow-lg shadow-slate-900/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-500'
        >
          {loading ? (
            <>
              <Loader2 size={18} className='animate-spin mr-2' /> Submitting...
            </>
          ) : internalStep === STEPS.length - 1 ? (
            <>
              Save & Continue <ArrowRight size={18} className='ml-2' />
            </>
          ) : (
            <>
              Next <ArrowRight size={18} className='ml-2' />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
