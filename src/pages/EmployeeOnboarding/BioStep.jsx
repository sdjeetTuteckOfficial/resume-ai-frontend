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

// --- Validation Schema (Same as before) ---
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
      .test('required', 'Required', (value) => value && value.length > 0),
  })
  .required();

// --- Configuration ---
const STEPS = [
  {
    id: 'identity',
    title: 'Who are you?',
    fields: ['firstName', 'lastName', 'phone', 'gender'],
    icon: User,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    id: 'location',
    title: 'Location',
    fields: ['city', 'stateProvince'],
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    id: 'professional',
    title: 'Professional',
    fields: ['qualification', 'skills', 'cvFile'],
    icon: Briefcase,
    color: 'text-violet-600',
    bg: 'bg-violet-100',
  },
];

// --- Compact Input Component ---
// Changed: py-3 -> py-2, text-sm inputs, smaller margins
const InputField = ({ label, error, register, name, ...props }) => (
  <div className='w-full'>
    <label className='text-xs font-semibold text-slate-500 block mb-1 uppercase tracking-wide'>
      {label}
    </label>
    <input
      {...register(name)}
      {...props}
      className={`
        w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none text-sm transition-all
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

export default function BioStep({
  allData = {},
  setAllData = () => {},
  onNext = () => {},
  onBack = () => {},
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
    defaultValues: { ...allData },
    mode: 'onChange',
  });

  const currentFile = watch('cvFile');
  const currentStepConfig = STEPS[internalStep];

  // --- Logic ---
  const handleNextInternal = async () => {
    const isStepValid = await trigger(currentStepConfig.fields);
    if (isStepValid) {
      setApiError(null);
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
      onBack();
    }
  };

  const finalSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setAllData((prev) => ({ ...prev, ...data }));

    const apiPayload = {
      first_name: data.firstName,
      last_name: data.lastName,
      gender: data.gender,
      phone: data.phone,
      city: data.city,
      state_province: data.stateProvince,
      qualification: data.qualification,
      skills: data.skills,
      cv_file_url:
        data.cvFile && data.cvFile.length > 0
          ? data.cvFile[0].name
          : 'pending_upload',
    };

    try {
      await axiosInstance.post('/user_details/user_entry', apiPayload);
      onNext();
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -20 : 20, opacity: 0 }),
  };

  return (
    // Changed: Reduced min-height to 380px
    <div className='w-full max-w-lg mx-auto flex flex-col min-h-[380px]'>
      {/* Compact Header */}
      <div className='mb-4 flex items-center justify-between border-b border-slate-100 pb-3'>
        <div className='flex items-center gap-3'>
          <div
            className={`p-2 rounded-lg ${currentStepConfig.bg} ${currentStepConfig.color}`}
          >
            <currentStepConfig.icon size={18} />
          </div>
          <div>
            <h2 className='text-lg font-bold text-slate-800 leading-tight'>
              {currentStepConfig.title}
            </h2>
            {/* Optional: Add subtitle back if needed, but removed for compactness */}
          </div>
        </div>

        {/* Compact Dots */}
        <div className='flex space-x-1.5'>
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === internalStep ? 'bg-slate-800 w-3' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {apiError && (
        <div className='mb-3 p-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded flex items-center'>
          <AlertCircle size={14} className='mr-2' /> {apiError}
        </div>
      )}

      {/* Form Content - Reduced Spacing */}
      <div className='flex-1 relative overflow-hidden'>
        <AnimatePresence mode='wait' custom={direction}>
          <motion.div
            key={internalStep}
            custom={direction}
            variants={variants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{ duration: 0.2 }}
            className='space-y-4 pt-1' // Changed: space-y-6 -> space-y-4
          >
            {/* 1. Identity */}
            {internalStep === 0 && (
              <div className='grid grid-cols-2 gap-3'>
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
                    label='Phone'
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
                    className='w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500'
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
              <div className='space-y-3'>
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
                  placeholder='NY'
                />
              </div>
            )}

            {/* 3. Professional */}
            {internalStep === 2 && (
              <div className='space-y-3'>
                <InputField
                  label='Qualification'
                  name='qualification'
                  register={register}
                  error={errors.qualification}
                  placeholder='B.Tech, MBA...'
                />

                <div>
                  <label className='text-xs font-semibold text-slate-500 block mb-1 uppercase tracking-wide'>
                    Skills
                  </label>
                  <textarea
                    {...register('skills')}
                    rows='2'
                    placeholder='React, Node...'
                    className='w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-blue-500'
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
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
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
                      <div className='flex items-center text-emerald-600 text-xs font-medium'>
                        <CheckCircle2 size={14} className='mr-1.5' />
                        {currentFile[0].name.substring(0, 20)}...
                      </div>
                    ) : (
                      <span className='text-xs text-slate-400'>
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- Compact Footer --- */}
      <div className='flex justify-between items-center pt-4 mt-2 border-t border-slate-100'>
        <button
          type='button'
          onClick={handleBackInternal}
          className='text-xs font-medium text-slate-400 hover:text-slate-700 px-2 py-1'
        >
          Back
        </button>

        <button
          type='button'
          onClick={handleNextInternal}
          disabled={loading}
          className='flex items-center bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-70'
        >
          {loading ? (
            <Loader2 size={14} className='animate-spin' />
          ) : internalStep === STEPS.length - 1 ? (
            'Save'
          ) : (
            'Next'
          )}
        </button>
      </div>
    </div>
  );
}
