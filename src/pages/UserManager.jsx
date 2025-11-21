import { ShieldAlert } from 'lucide-react';

export default function UserManager() {
  return (
    <div className='bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded shadow-sm'>
      <h2 className='text-2xl font-bold text-yellow-800 flex items-center gap-2'>
        <ShieldAlert /> Admin Area: User Manager
      </h2>
      <p className='mt-2 text-yellow-700'>
        Only users with role='ADMIN' can see this route.
      </p>
      <ul className='mt-4 space-y-2 bg-white p-4 rounded border border-yellow-200'>
        <li className='flex justify-between'>
          <span>User A</span> <span className='text-red-500'>Delete</span>
        </li>
        <li className='flex justify-between'>
          <span>User B</span> <span className='text-red-500'>Delete</span>
        </li>
      </ul>
    </div>
  );
}
