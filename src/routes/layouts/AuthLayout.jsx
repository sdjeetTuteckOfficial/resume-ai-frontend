import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 p-4'>
      <div className='w-full max-w-md bg-white rounded-xl shadow-2xl p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-slate-800'>Welcome Back</h1>
          <p className='text-gray-500'>Please sign in to continue</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
