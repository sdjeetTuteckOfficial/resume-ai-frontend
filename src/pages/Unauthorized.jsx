import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className='flex flex-col items-center justify-center h-full text-center'>
      <Lock size={64} className='text-red-400 mb-4' />
      <h1 className='text-3xl font-bold text-gray-800'>Access Denied</h1>
      <p className='text-gray-600 mt-2'>
        You do not have permission to view this page.
      </p>
      <Link to='/' className='mt-6 text-blue-600 hover:underline'>
        Go back to Dashboard
      </Link>
    </div>
  );
}
