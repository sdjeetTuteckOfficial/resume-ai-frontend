import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Hash,
  CheckCircle2,
  Loader2,
  FileText,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import axiosInstance from '../../security/axiosInstance';

export default function BasicInfoStep({ formData, onChange, onNext, onPrev }) {
  // --- State ---
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 0, limit: 8 }); // Increased limit

  const [selectedJobData, setSelectedJobData] = useState(null);

  // --- Fetch Jobs ---
  const fetchJobs = React.useCallback(async () => {
    setLoading(true);
    try {
      const skip = pagination.page * pagination.limit;
      const params = { skip, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;

      const response = await axiosInstance.get('jobs/', { params });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setJobs(data);
    } catch (error) {
      console.error('System Error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, searchTerm, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  // --- Handlers ---
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleSelect = (job) => {
    setSelectedJobData(job);
    onChange({ target: { name: 'jobRole', value: job.job_name } });
  };

  const handlePageChange = (direction) => {
    setPagination((prev) => ({
      ...prev,
      page: direction === 'next' ? prev.page + 1 : Math.max(0, prev.page - 1),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='flex flex-col h-[600px] gap-4'
    >
      <div className='text-center shrink-0'>
        <h3 className='text-xl font-bold text-slate-800'>Select Position</h3>
        <p className='text-xs text-slate-500'>
          Find the open role you wish to apply for.
        </p>
      </div>

      {/* --- SPLIT VIEW LAYOUT --- */}
      <div className='flex-1 min-h-0 flex flex-col md:flex-row gap-4'>
        {/* LEFT PANEL: Job List */}
        <div className='flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden'>
          {/* Search Header */}
          <div className='p-3 bg-slate-50 border-b border-slate-200'>
            <div className='relative'>
              <Search className='absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
              <input
                type='text'
                placeholder='Search jobs...'
                value={searchTerm}
                onChange={handleSearch}
                className='w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              />
            </div>
          </div>

          {/* List Items */}
          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='h-full flex items-center justify-center'>
                <Loader2 className='h-6 w-6 text-blue-600 animate-spin' />
              </div>
            ) : jobs.length > 0 ? (
              <div className='divide-y divide-slate-100'>
                {jobs.map((job) => {
                  const isSelected = formData.jobRole === job.job_name;
                  return (
                    <div
                      key={job.id || job.job_id}
                      onClick={() => handleSelect(job)}
                      className={`
                        px-4 py-3 cursor-pointer transition-colors flex items-center justify-between group
                        ${
                          isSelected
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-slate-50 border-l-4 border-transparent'
                        }
                      `}
                    >
                      <div className='min-w-0'>
                        <h4
                          className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-blue-800' : 'text-slate-700'
                          }`}
                        >
                          {job.job_name}
                        </h4>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1'>
                            <Hash className='h-3 w-3' /> {job.job_id}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className='h-4 w-4 text-blue-600 shrink-0 ml-2' />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='h-full flex flex-col items-center justify-center text-slate-400 p-4'>
                <Briefcase className='h-8 w-8 opacity-20 mb-2' />
                <p className='text-xs'>No jobs found.</p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className='p-2 border-t border-slate-200 bg-slate-50 flex justify-between items-center'>
            <button
              onClick={() => handlePageChange('prev')}
              disabled={pagination.page === 0}
              className='p-1.5 hover:bg-slate-200 rounded-md disabled:opacity-30 transition-colors'
            >
              <ChevronLeft className='h-4 w-4 text-slate-600' />
            </button>
            <span className='text-xs font-medium text-slate-500'>
              Page {pagination.page + 1}
            </span>
            <button
              onClick={() => handlePageChange('next')}
              disabled={jobs.length < pagination.limit}
              className='p-1.5 hover:bg-slate-200 rounded-md disabled:opacity-30 transition-colors'
            >
              <ChevronRight className='h-4 w-4 text-slate-600' />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Description (Hidden on mobile if needed, but flex-col handles it) */}
        <div className='flex-[1.2] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden'>
          <div className='bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2'>
            <FileText className='h-4 w-4 text-slate-500' />
            <span className='text-xs font-bold text-slate-700 uppercase tracking-wide'>
              Job Description
            </span>
          </div>

          <div className='flex-1 overflow-y-auto p-5 bg-white'>
            <AnimatePresence mode='wait'>
              {selectedJobData ? (
                <motion.div
                  key={selectedJobData.id || selectedJobData.job_id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className='text-xl font-bold text-slate-900 mb-2'>
                    {selectedJobData.job_name}
                  </h2>
                  <div className='flex items-center gap-3 text-xs text-slate-500 mb-6 pb-4 border-b border-slate-100'>
                    <span className='bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium'>
                      ID: {selectedJobData.job_id}
                    </span>
                    <span>
                      Posted:{' '}
                      {new Date(
                        selectedJobData.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className='prose prose-sm prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed'>
                    {selectedJobData.job_details}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='h-full flex flex-col items-center justify-center text-slate-400 gap-3'
                >
                  <div className='p-4 bg-slate-50 rounded-full'>
                    <AlertCircle className='h-8 w-8 text-slate-300' />
                  </div>
                  <p className='text-sm font-medium'>
                    Select a job to view details
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- Footer Controls --- */}
      <div className='flex gap-3 pt-2 shrink-0'>
        <button
          onClick={onPrev}
          className='px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold transition-colors flex items-center gap-2'
        >
          <ArrowLeft className='w-4 h-4' />
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!formData.jobRole}
          className='flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200'
        >
          Confirm Selection & Continue
        </button>
      </div>
    </motion.div>
  );
}
