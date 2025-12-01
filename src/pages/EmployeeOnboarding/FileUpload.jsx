import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  ShieldAlert,
} from 'lucide-react';
import axiosInstance from '../../security/axiosInstance';

// --- 1. HELPER: Dynamic Schema Generator ---
const generateYupSchema = (questions) => {
  const schemaFields = {};
  questions.forEach((field) => {
    let validator = yup.string();
    if (field.validation?.required) {
      validator = validator.required('This answer is required.');
    }
    if (field.validation?.minLength) {
      validator = validator.min(
        field.validation.minLength,
        `Please enter at least ${field.validation.minLength} characters.`
      );
    }
    schemaFields[field.id] = validator;
  });
  return yup.object().shape(schemaFields);
};

// --- 2. MAIN COMPONENT ---
export default function AiInterviewManager({ userId, jobRole, onComplete }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'active' | 'error'
  const [questions, setQuestions] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // API Call to Generate Questions
  const handleGenerate = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      // Send jobRole to backend to get relevant questions
      const response = await axiosInstance.post('/gap/analyze-gap', {
        job_role: jobRole,
      });

      const data = response.data;

      // Handle various response structures
      const questionsList =
        data.questions || data.screening_questions || data.critical_gaps;

      if (!questionsList || questionsList.length === 0) {
        throw new Error('Invalid response format: No questions found.');
      }

      setQuestions(questionsList);
      setStatus('active');
    } catch (error) {
      console.error('API Error:', error);
      let msg = 'Failed to generate assessment';
      if (error.response) {
        msg = error.response.data?.detail || error.response.statusText;
      } else if (error.request) {
        msg = 'No response from server. Please check your connection.';
      } else {
        msg = error.message;
      }

      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const handleFinalSubmit = async (answers) => {
    console.log('Submitting to Backend:', answers);

    // Simulate API submission delay
    // await axiosInstance.post('/api/submit', answers);

    // Move to next step in parent component
    if (onComplete) {
      onComplete();
    }
  };

  // --- RENDER LOGIC ---

  // State 1: Error
  if (status === 'error') {
    return (
      <div className='flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl text-red-800'>
        <div className='flex items-center gap-2'>
          <AlertCircle className='w-5 h-5' />
          <span className='text-sm font-semibold'>{errorMessage}</span>
        </div>
        <button
          onClick={() => setStatus('idle')}
          className='text-sm underline hover:text-red-600'
        >
          Try Again
        </button>
      </div>
    );
  }

  // State 2: Active Form (Questions Loaded)
  if (status === 'active' && questions) {
    return <ActiveForm questions={questions} onSubmit={handleFinalSubmit} />;
  }

  // State 3: Idle / Loading (Trigger Box)
  return (
    <div
      onClick={status === 'loading' ? undefined : handleGenerate}
      className={`
        relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${
          status === 'loading'
            ? 'border-amber-200 bg-amber-50 cursor-wait'
            : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md'
        }
      `}
    >
      {status === 'loading' ? (
        <>
          <Loader2 className='w-8 h-8 text-amber-500 animate-spin mb-3' />
          <p className='text-xs font-bold text-amber-600 uppercase tracking-wider'>
            AI is Analyzing {jobRole ? `"${jobRole}"` : 'Profile'}...
          </p>
        </>
      ) : (
        <>
          <div className='p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform'>
            <Sparkles className='w-6 h-6 text-blue-500' />
          </div>
          <p className='text-sm font-bold text-slate-600'>
            Start AI Interview Assessment
          </p>
          <p className='text-xs text-slate-400 mt-1 px-4 text-center'>
            Based on your role:{' '}
            <span className='font-medium text-slate-600'>
              {jobRole || 'General'}
            </span>
          </p>
        </>
      )}
    </div>
  );
}

// --- 3. INTERNAL SUB-COMPONENT (The Form) ---
function ActiveForm({ questions, onSubmit }) {
  const [violationCount, setViolationCount] = useState(0);
  const yupSchema = useMemo(() => generateYupSchema(questions), [questions]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(yupSchema),
    mode: 'onBlur',
  });

  // --- SECURITY & PROCTORING LOGIC ---
  useEffect(() => {
    // 1. Prevent Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Prevent Copy, Cut, Paste
    const handleCopyCutPaste = (e) => {
      e.preventDefault();
      return false;
    };

    // 3. Detect Tab Switching / Window Blur
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setViolationCount((prev) => prev + 1);
        // Note: 'alert' might be blocked by some browsers or strict environments.
        // Consider using a modal state instead for better UX, but keeping alert for now as requested.
        alert(
          'WARNING: You have left the exam screen. This action is recorded.'
        );
      }
    };

    // Attach Listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    // Added 'select-none' to prevent text highlighting
    <div className='animate-in fade-in slide-in-from-bottom-4 duration-500 select-none'>
      {/* Violation Warning Banner */}
      {violationCount > 0 && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-pulse'>
          <ShieldAlert className='w-5 h-5' />
          <div className='text-xs font-semibold'>
            Warning: Tab switch detected {violationCount} time(s). Further
            actions may terminate the exam.
          </div>
        </div>
      )}

      {/* Success Header */}
      <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3'>
        <div className='p-2 bg-green-100 rounded-full'>
          <CheckCircle2 className='w-5 h-5 text-green-700' />
        </div>
        <div>
          <h3 className='text-sm font-bold text-green-900'>
            Assessment Generated
          </h3>
          <p className='text-xs text-green-700'>
            Please answer the {questions.length} questions below.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {questions.map((field, index) => (
          <div
            key={field.id || index}
            className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300'
          >
            <label className='block text-sm font-semibold text-slate-800 mb-3 leading-relaxed'>
              <span className='text-slate-400 mr-2 font-mono'>
                {String(index + 1).padStart(2, '0')}.
              </span>
              {field.question}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                {...register(field.id)}
                rows={4}
                placeholder={field.placeholder || 'Type your answer...'}
                // Added onPaste prevent locally as double safety
                onPaste={(e) => e.preventDefault()}
                className={`w-full p-3 text-sm bg-slate-50 border rounded-lg outline-none transition-colors resize-y
                  ${
                    errors[field.id]
                      ? 'border-red-300 focus:border-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:border-blue-500'
                  }
                `}
              />
            ) : field.type === 'radio' && field.options ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {field.options.map((option) => (
                  <label
                    key={option}
                    className='flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition-all'
                  >
                    <input
                      type='radio'
                      value={option}
                      {...register(field.id)}
                      className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-slate-700'>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type='text'
                {...register(field.id)}
                placeholder={field.placeholder}
                onPaste={(e) => e.preventDefault()}
                className={`w-full p-3 text-sm bg-slate-50 border rounded-lg outline-none transition-colors
                  ${
                    errors[field.id]
                      ? 'border-red-300 focus:border-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:border-blue-500'
                  }
                `}
              />
            )}

            {errors[field.id] && (
              <div className='mt-2 flex items-center gap-1.5 text-red-500 text-xs font-medium animate-pulse'>
                <AlertCircle className='w-3.5 h-3.5' />
                <span>{errors[field.id]?.message}</span>
              </div>
            )}
          </div>
        ))}

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {isSubmitting ? (
            <Loader2 className='w-5 h-5 animate-spin' />
          ) : (
            <Send className='w-5 h-5' />
          )}
          Submit Assessment
        </button>
      </form>
    </div>
  );
}
