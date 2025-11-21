import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Briefcase } from 'lucide-react';
import axiosInstance from '../security/axiosInstance';

const Backdrop = ({ onClick, children }) => (
  <div
    className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn'
    onClick={onClick}
  >
    <div className='absolute inset-0 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-slate-900/20 backdrop-blur-sm' />
    {children}
  </div>
);

export default function JobManager() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [formData, setFormData] = useState({
    job_id: '',
    job_name: '',
    job_details: '',
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 10,
  });

  const fetchJobs = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('jobs/', {
        params: { skip: pagination.skip, limit: pagination.limit },
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [pagination.skip, pagination.limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCreate = async () => {
    if (!formData.job_id || !formData.job_name || !formData.job_details) {
      alert('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('jobs/', formData);
      alert('Job created successfully');
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.job_name || !formData.job_details) {
      alert('Job name and details are required');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(`jobs/${currentJob.job_id}`, {
        job_id: currentJob.job_id,
        job_name: formData.job_name,
        job_details: formData.job_details,
      });
      alert('Job updated successfully');
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    setLoading(true);
    try {
      await axiosInstance.delete(`jobs/${jobId}`);
      alert('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentJob(null);
    setFormData({ job_id: '', job_name: '', job_details: '' });
    setShowModal(true);
  };

  const openEditModal = async (job) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`jobs/${job.job_id}`);
      setEditMode(true);
      setCurrentJob(response.data);
      setFormData({
        job_id: response.data.job_id,
        job_name: response.data.job_name,
        job_details: response.data.job_details,
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentJob(null);
    setFormData({ job_id: '', job_name: '', job_details: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (editMode) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6'>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .btn-hover {
          transition: all 0.2s ease;
        }
        .btn-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .btn-hover:active {
          transform: translateY(0);
        }
        .card-hover {
          transition: all 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        .input-focus {
          transition: all 0.2s ease;
        }
        .input-focus:focus {
          transform: translateY(-1px);
        }
      `}</style>

      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-8 animate-slideUp'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg'>
              <Briefcase className='text-white' size={28} />
            </div>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent'>
                Job Management
              </h1>
              <p className='text-sm text-slate-500 mt-1'>
                Manage your job listings
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 btn-hover font-medium'
          >
            <Plus size={20} />
            Create Job
          </button>
        </div>

        {loading && (
          <div className='text-center py-8 animate-fadeIn'>
            <div className='inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin' />
          </div>
        )}

        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200/50 animate-slideUp card-hover'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50'>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Job ID
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Job Name
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Details
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Created At
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {jobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className='hover:bg-slate-50/50 transition-colors duration-150'
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className='px-6 py-4'>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium'>
                        {job.job_id}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm font-medium text-slate-900'>
                      {job.job_name}
                    </td>
                    <td className='px-6 py-4 text-sm text-slate-600 max-w-xs truncate'>
                      {job.job_details}
                    </td>
                    <td className='px-6 py-4 text-sm text-slate-500'>
                      {new Date(job.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={() => openEditModal(job)}
                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150 btn-hover'
                          title='Edit job'
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(job.job_id)}
                          className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 btn-hover'
                          title='Delete job'
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='flex justify-between items-center mt-6 animate-slideUp'>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                skip: Math.max(0, prev.skip - prev.limit),
              }))
            }
            disabled={pagination.skip === 0}
            className='px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed btn-hover font-medium shadow-sm'
          >
            Previous
          </button>
          <span className='text-sm text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200'>
            Showing {pagination.skip + 1} - {pagination.skip + jobs.length}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                skip: prev.skip + prev.limit,
              }))
            }
            disabled={jobs.length < pagination.limit}
            className='px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed btn-hover font-medium shadow-sm'
          >
            Next
          </button>
        </div>

        {showModal && (
          <Backdrop
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <div
              className='bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200/50 animate-scaleIn relative'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold text-slate-800'>
                  {editMode ? 'Edit Job' : 'Create New Job'}
                </h2>
                <button
                  onClick={resetForm}
                  className='p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-150'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-semibold text-slate-700 mb-1'>
                      Job ID
                    </label>
                    <input
                      type='text'
                      name='job_id'
                      value={formData.job_id}
                      onChange={handleInputChange}
                      disabled={editMode}
                      placeholder='e.g., JOB001'
                      className='w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-all input-focus'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-slate-700 mb-1'>
                      Job Name
                    </label>
                    <input
                      type='text'
                      name='job_name'
                      value={formData.job_name}
                      onChange={handleInputChange}
                      placeholder='e.g., Software Engineer'
                      className='w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all input-focus'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-semibold text-slate-700 mb-1'>
                    Job Details
                  </label>
                  <textarea
                    name='job_details'
                    value={formData.job_details}
                    onChange={handleInputChange}
                    rows='3'
                    placeholder='Describe the job requirements and responsibilities...'
                    className='w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all input-focus'
                  />
                </div>

                <div className='flex gap-2 pt-2'>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className='flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed btn-hover font-semibold shadow-lg shadow-blue-500/30'
                  >
                    {loading
                      ? 'Saving...'
                      : editMode
                      ? 'Update Job'
                      : 'Create Job'}
                  </button>
                  <button
                    onClick={resetForm}
                    className='flex-1 bg-slate-100 text-slate-700 py-2 text-sm rounded-lg hover:bg-slate-200 btn-hover font-semibold'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </Backdrop>
        )}
      </div>
    </div>
  );
}
