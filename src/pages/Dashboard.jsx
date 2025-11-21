import { useMockAuth } from '../services/authService';

export default function Dashboard() {
  const { user } = useMockAuth();
  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold text-gray-800'>Dashboard</h1>
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h2 className='text-xl font-semibold mb-2'>Hello, {user?.name}</h2>
        <p className='text-gray-600'>
          Your role is:{' '}
          <span className='font-mono bg-gray-100 px-2 py-1 rounded text-blue-600'>
            {user?.role}
          </span>
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='h-32 bg-blue-50 rounded-lg border border-blue-100 p-4'>
          Recent Chats
        </div>
        <div className='h-32 bg-purple-50 rounded-lg border border-purple-100 p-4'>
          System Status
        </div>
        <div className='h-32 bg-green-50 rounded-lg border border-green-100 p-4'>
          Tokens Left
        </div>
      </div>
    </div>
  );
}
