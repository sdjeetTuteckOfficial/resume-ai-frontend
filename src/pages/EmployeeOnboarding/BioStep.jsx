import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileCheck,
} from 'lucide-react';

// Sample list of states/provinces
const STATES = [
  { code: '', name: 'Select State/Province' },
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'WA', name: 'Washington' },
  { code: 'IL', name: 'Illinois' },
];

// --- 1. Validation Schema ---
const schema = yup
  .object({
    // Personal
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    gender: yup.string().required('Gender is required'),

    // Contact
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, '10 digits required')
      .required('Phone is required'),
    city: yup.string().required('City is required'),
    stateProvince: yup.string().required('State/Province is required'),

    // Professional
    qualification: yup.string().required('Qualification is required'),
    skills: yup.string().required('Skills are required'),

    // Resume (Bio Removed)
    cvFile: yup.mixed().test('required', 'Resume file is required', (value) => {
      return value && value.length > 0;
    }),
  })
  .required();

// --- 2. Internal Components ---
const InputField = ({
  label,
  name,
  register,
  error,
  icon: Icon,
  placeholder,
  type = 'text',
}) => (
  <div className='space-y-1'>
    <label className='text-xs font-semibold text-gray-600 ml-1'>{label}</label>
    <div className='relative'>
      {Icon && <Icon className='absolute left-3 top-3 w-4 h-4 text-gray-400' />}
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`w-full p-2.5 ${
          Icon ? 'pl-9' : 'pl-3'
        } rounded-lg bg-gray-50 border 
        ${
          error
            ? 'border-red-500'
            : 'border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
        } 
        outline-none text-sm transition-all`}
      />
    </div>
    {error && <p className='text-[10px] text-red-500 ml-1'>{error.message}</p>}
  </div>
);

// --- 3. Step Views ---
const PersonalView = ({ register, errors }) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
    <InputField
      label='First Name'
      name='firstName'
      register={register}
      error={errors.firstName}
      icon={User}
      placeholder='John'
    />
    <InputField
      label='Last Name'
      name='lastName'
      register={register}
      error={errors.lastName}
      placeholder='Doe'
    />
    <div className='sm:col-span-2 space-y-1'>
      <label className='text-xs font-semibold text-gray-600 ml-1'>Gender</label>
      <select
        {...register('gender')}
        className='w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-amber-400 outline-none text-sm'
      >
        <option value=''>Select Gender</option>
        <option value='male'>Male</option>
        <option value='female'>Female</option>
        <option value='other'>Other</option>
      </select>
      {errors.gender && (
        <p className='text-[10px] text-red-500 ml-1'>{errors.gender.message}</p>
      )}
    </div>
  </div>
);

const ContactView = ({ register, errors }) => (
  <div className='space-y-4'>
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <InputField
        label='Email'
        name='email'
        type='email'
        register={register}
        error={errors.email}
        icon={Mail}
        placeholder='john@doe.com'
      />
      <InputField
        label='Phone'
        name='phone'
        type='tel'
        register={register}
        error={errors.phone}
        icon={Phone}
        placeholder='9876543210'
      />
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <InputField
        label='City'
        name='city'
        register={register}
        error={errors.city}
        icon={MapPin}
        placeholder='New York'
      />
      <div className='space-y-1'>
        <label className='text-xs font-semibold text-gray-600 ml-1'>
          State/Province
        </label>
        <select
          {...register('stateProvince')}
          className='w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-amber-400 outline-none text-sm'
        >
          {STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
        {errors.stateProvince && (
          <p className='text-[10px] text-red-500 ml-1'>
            {errors.stateProvince.message}
          </p>
        )}
      </div>
    </div>
  </div>
);

const ProfessionalView = ({ register, errors }) => (
  <div className='space-y-4'>
    <InputField
      label='Highest Qualification'
      name='qualification'
      register={register}
      error={errors.qualification}
      icon={GraduationCap}
      placeholder='B.Tech CS'
    />
    <div className='space-y-1'>
      <label className='text-xs font-semibold text-gray-600 ml-1'>Skills</label>
      <textarea
        {...register('skills')}
        rows={3}
        className='w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-amber-400 outline-none text-sm resize-none'
        placeholder='React, Node.js, Design...'
      />
      {errors.skills && (
        <p className='text-[10px] text-red-500 ml-1'>{errors.skills.message}</p>
      )}
    </div>
  </div>
);

const BioView = ({ register, errors, watch, setValue }) => {
  // Watch the file input to display selected filename
  const cvFile = watch('cvFile');
  const fileName = cvFile && cvFile.length > 0 ? cvFile[0].name : null;
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Added stopPropagation
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Added stopPropagation
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Added stopPropagation
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Force update the value
      setValue('cvFile', e.dataTransfer.files, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <div className='space-y-4'>
      {/* Functional Resume Upload with Drag & Drop */}
      <div className='space-y-1'>
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center p-8 
            border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : errors.cvFile
                ? 'border-red-300 bg-red-50'
                : fileName
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }
          `}
        >
          <input
            type='file'
            className='hidden'
            accept='.pdf,.doc,.docx'
            {...register('cvFile')}
          />

          {fileName ? (
            <>
              <FileCheck className='w-10 h-10 text-green-500 mb-3' />
              <span className='text-sm font-semibold text-green-700 text-center px-4 break-all'>
                {fileName}
              </span>
              <span className='text-xs text-green-600 mt-2'>
                Click to replace
              </span>
            </>
          ) : (
            <>
              <Upload
                className={`w-10 h-10 mb-3 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isDragging ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {isDragging ? 'Drop file here' : 'Upload Resume (Required)'}
              </span>
              <span
                className={`text-xs mt-2 ${
                  isDragging ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                PDF or DOCX
              </span>
            </>
          )}
        </label>
        {errors.cvFile && (
          <p className='text-xs text-red-500 ml-1 text-center mt-2'>
            {errors.cvFile.message}
          </p>
        )}
      </div>
    </div>
  );
};

// --- 4. Main Component ---
export default function BioStep({ formData, onChange, onNext, onPrev }) {
  const [internalStep, setInternalStep] = useState(0);

  const {
    register,
    trigger,
    getValues,
    watch,
    setValue, // Added setValue for Drag and Drop support
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    // Removed 'bio' from defaultValues
    defaultValues: {},
    mode: 'onChange',
  });

  const STEPS = [
    {
      title: 'Personal Details',
      component: PersonalView,
      fields: ['firstName', 'lastName', 'gender'],
    },
    {
      title: 'Contact Info',
      component: ContactView,
      fields: ['email', 'phone', 'city', 'stateProvince'],
    },
    {
      title: 'Professional',
      component: ProfessionalView,
      fields: ['qualification', 'skills'],
    },
    {
      title: 'Resume Upload',
      component: BioView,
      fields: ['cvFile'], // Removed 'bio' field
    },
  ];

  const CurrentView = STEPS[internalStep].component;

  const handleInternalNext = async () => {
    const fieldsValid = await trigger(STEPS[internalStep].fields);
    if (!fieldsValid) return;

    if (internalStep < STEPS.length - 1) {
      setInternalStep((prev) => prev + 1);
    } else {
      // Final step: Sync data to parent and proceed
      const allData = getValues();

      // Pass File (if selected)
      if (allData.cvFile && allData.cvFile.length > 0) {
        onChange({ target: { name: 'cvFile', value: allData.cvFile[0] } });
      }

      onNext();
    }
  };

  const handleInternalPrev = () => {
    if (internalStep > 0) {
      setInternalStep((prev) => prev - 1);
    } else {
      onPrev(); // Go back to Parent Step 2
    }
  };

  return (
    <motion.div
      key='step3-container'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='w-full'
    >
      <div className='text-center mb-6'>
        <h3 className='text-lg font-bold text-gray-800'>
          {STEPS[internalStep].title}
        </h3>
        <p className='text-[10px] text-gray-400'>
          Step {internalStep + 1} of {STEPS.length}
        </p>
      </div>

      <div className='min-h-[220px]'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={internalStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Passed setValue to CurrentView */}
            <CurrentView
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className='flex gap-2 pt-6 mt-2 border-t border-gray-100'>
        <button
          onClick={handleInternalPrev}
          className='p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
        </button>
        <button
          onClick={handleInternalNext}
          className='flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors'
        >
          {internalStep === STEPS.length - 1 ? 'Complete Profile' : 'Next'}
          <ArrowRight className='w-3 h-3' />
        </button>
      </div>
    </motion.div>
  );
}
