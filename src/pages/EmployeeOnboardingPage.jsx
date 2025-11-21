import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  UploadCloud,
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lightbulb,
  Calendar,
  X,
  Check,
  Zap,
} from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useAnimation,
} from 'framer-motion';

export default function OnboardingPage() {
  const navigate = useNavigate();

  // --- State ---
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Step 1: Plug Logic
  const [isPlugged, setIsPlugged] = useState(false);
  const constraintsRef = useRef(null);
  const plugControls = useAnimation();

  // Motion Values for the Plug
  const plugX = useMotionValue(0);

  // FIX: Updated coordinates to match the center of the 128px (h-32) container
  // Center = 64px
  const wirePath = useTransform(plugX, (x) => {
    const startX = 0;
    const startY = 64; // Fixed: Center of the wall (was 28)
    const endX = x + 2; // Connects to the very back of the plug
    const endY = 64; // Fixed: Center of the plug (was 28)

    const distance = 220 - x;
    const slack = Math.max(0, distance * 0.3);
    const cpX = (startX + endX) / 2;
    const cpY = startY + slack;

    return `M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}`;
  });

  const [formData, setFormData] = useState({
    jobRole: '',
    experience: '',
    bio: '',
    cvFile: null,
  });

  const fileInputRef = useRef(null);

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handlePlugDragEnd = (event, info) => {
    if (info.offset.x > 190) {
      setIsPlugged(true);
      plugControls.start({
        x: 220,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      });
    } else {
      setIsPlugged(false);
      plugControls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 200, damping: 25 },
      });
    }
  };

  // File Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({ ...prev, cvFile: e.dataTransfer.files[0] }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, cvFile: e.target.files[0] }));
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, cvFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('Welcome aboard! Information submitted successfully.');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderProgress = () => (
    <div className='flex justify-center gap-2 mb-6'>
      {[1, 2, 3, 4].map((s) => (
        <motion.div
          key={s}
          initial={false}
          animate={{
            backgroundColor: s <= step ? '#f59e0b' : '#e5e7eb',
            scale: s === step ? 1.2 : 1,
          }}
          className='w-2 h-2 rounded-full transition-colors duration-300'
        />
      ))}
    </div>
  );

  return (
    <div className='w-full flex justify-center items-start pt-8'>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative w-full max-w-[380px] p-6 rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden'
      >
        {/* Animated Lightbulb Header */}
        <div className='flex justify-center mb-4 relative z-10'>
          <motion.div
            className={`p-4 rounded-full transition-colors duration-500 ${
              isPlugged ? 'bg-amber-50' : 'bg-slate-50'
            }`}
            animate={
              isPlugged
                ? {
                    boxShadow: [
                      '0 0 0px rgba(251, 191, 36, 0)',
                      '0 0 50px rgba(251, 191, 36, 0.8)',
                      '0 0 0px rgba(251, 191, 36, 0)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Lightbulb
              className={`w-10 h-10 transition-all duration-500 ${
                isPlugged ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
              }`}
            />
          </motion.div>
        </div>

        {step > 1 && renderProgress()}

        <AnimatePresence mode='wait' custom={step}>
          {/* STEP 1: SVG PLUG INTERACTION */}
          {step === 1 && (
            <motion.div
              key='step1'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='text-center space-y-6'
            >
              <div>
                <h2 className='text-xl font-bold text-gray-800'>
                  {isPlugged ? 'System Online' : 'Connect to Start'}
                </h2>
                <p className='text-xs text-gray-500 mt-2 px-4 leading-relaxed'>
                  {isPlugged
                    ? "Power level optimal. Let's configure your profile."
                    : 'Drag the plug into the socket to power up the system.'}
                </p>
              </div>

              {/* SVG INTERACTIVE AREA */}
              <div
                className='relative w-full h-32 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center'
                ref={constraintsRef}
              >
                {!isPlugged && (
                  <span className='absolute left-0 right-0 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none animate-pulse'>
                    Drag to Connect
                  </span>
                )}

                <svg className='absolute top-0 left-0 w-full h-full pointer-events-none z-0'>
                  {/* The Dynamic Wire */}
                  <motion.path
                    d={wirePath}
                    stroke='#475569'
                    strokeWidth='4'
                    fill='none'
                    strokeLinecap='round'
                  />
                </svg>

                {/* The Wall Socket (Target) */}
                <div className='absolute right-6 top-1/2 -translate-y-1/2 z-0'>
                  <div className='w-10 h-14 bg-slate-200 rounded-md border border-slate-300 shadow-sm flex flex-col items-center justify-center gap-3 relative'>
                    {/* Socket Holes */}
                    <div className='w-1.5 h-3 bg-slate-400 rounded-full shadow-inner'></div>
                    <div className='w-1.5 h-3 bg-slate-400 rounded-full shadow-inner'></div>

                    {/* Spark Effect when plugged */}
                    {isPlugged && (
                      <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className='absolute inset-0 flex items-center justify-center'
                      >
                        <Zap className='w-8 h-8 text-amber-400 fill-amber-400' />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Draggable Plug Head */}
                <motion.div
                  drag='x'
                  dragConstraints={constraintsRef}
                  dragElastic={0.1}
                  dragMomentum={false}
                  animate={plugControls}
                  onDragEnd={handlePlugDragEnd}
                  // FIX: Replaced y:10 with precise top positioning to align with wire center
                  // Container is 128px (h-32). Plug is 40px. Center top is (128-40)/2 = 44px.
                  style={{ x: plugX, top: 44 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ cursor: 'grabbing' }}
                  className='absolute left-0 z-10 cursor-grab active:cursor-grabbing'
                >
                  {/* Custom SVG Plug Head */}
                  <svg width='60' height='40' viewBox='0 0 60 40'>
                    {/* Prongs */}
                    <rect
                      x='45'
                      y='12'
                      width='12'
                      height='6'
                      rx='1'
                      fill='#cbd5e1'
                    />
                    <rect
                      x='45'
                      y='22'
                      width='12'
                      height='6'
                      rx='1'
                      fill='#cbd5e1'
                    />
                    {/* Plug Body */}
                    <path
                      d='M 0 10 Q 5 10 10 5 L 35 5 Q 45 5 45 15 L 45 25 Q 45 35 35 35 L 10 35 Q 5 30 0 30 Z'
                      fill='#334155'
                    />
                    {/* Grip Lines */}
                    <rect
                      x='20'
                      y='12'
                      width='2'
                      height='16'
                      rx='1'
                      fill='#475569'
                    />
                    <rect
                      x='25'
                      y='12'
                      width='2'
                      height='16'
                      rx='1'
                      fill='#475569'
                    />
                    <rect
                      x='30'
                      y='12'
                      width='2'
                      height='16'
                      rx='1'
                      fill='#475569'
                    />
                  </svg>
                </motion.div>
              </div>

              {/* CONTINUE BUTTON (Appears only when plugged) */}
              <div className='h-12'>
                {isPlugged && (
                  <motion.button
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep}
                    className='w-full py-3.5 rounded-xl shadow-lg shadow-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2'
                  >
                    Start Journey <ArrowRight className='w-4 h-4' />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: ROLE INFO */}
          {step === 2 && (
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
                    onChange={handleInputChange}
                    placeholder='Job Title (e.g. Engineer)'
                    className='w-full pl-9 pr-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-xs font-medium'
                  />
                </div>

                <div className='relative'>
                  <Calendar className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <select
                    name='experience'
                    value={formData.experience}
                    onChange={handleInputChange}
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
                  onClick={prevStep}
                  className='p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500'
                >
                  <ArrowLeft className='w-4 h-4' />
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.jobRole}
                  className='flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50'
                >
                  Next Step
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: BIO */}
          {step === 3 && (
            <motion.div
              key='step3'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='space-y-4'
            >
              <div className='text-center'>
                <h3 className='text-lg font-bold text-gray-800'>About You</h3>
                <p className='text-[10px] text-gray-400'>
                  In 140 characters or less
                </p>
              </div>

              <textarea
                name='bio'
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder='I love coding because...'
                className='w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-xs font-medium resize-none'
              />

              <div className='flex gap-2 pt-2'>
                <button
                  onClick={prevStep}
                  className='p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500'
                >
                  <ArrowLeft className='w-4 h-4' />
                </button>
                <button
                  onClick={nextStep}
                  className='flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800'
                >
                  Next Step
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: UPLOAD */}
          {step === 4 && (
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

              {!formData.cvFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed transition-all duration-200 ${
                    dragActive
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 bg-gray-50 hover:border-amber-300'
                  }`}
                >
                  <UploadCloud
                    className={`w-6 h-6 mb-2 ${
                      dragActive ? 'text-amber-500' : 'text-gray-400'
                    }`}
                  />
                  <p className='text-[10px] text-gray-500 font-bold'>
                    Drag & Drop or Click
                  </p>
                  <input
                    ref={fileInputRef}
                    type='file'
                    className='hidden'
                    accept='.pdf,.doc,.docx'
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className='flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg'>
                  <div className='flex items-center gap-2 overflow-hidden'>
                    <FileText className='w-4 h-4 text-green-600' />
                    <span className='text-xs font-bold text-green-800 truncate max-w-[150px]'>
                      {formData.cvFile.name}
                    </span>
                  </div>
                  <button
                    onClick={removeFile}
                    className='text-gray-400 hover:text-red-500'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              )}

              <div className='flex gap-2 pt-2'>
                <button
                  onClick={prevStep}
                  className='p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500'
                >
                  <ArrowLeft className='w-4 h-4' />
                </button>
                <button
                  onClick={handleSubmit}
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
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
