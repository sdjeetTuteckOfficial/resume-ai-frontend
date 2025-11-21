import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className='text-center pt-20'>
      <h1 className='text-6xl font-bold text-gray-300'>404</h1>
      <p className='text-xl text-gray-600'>Page not found</p>
      <Link to='/' className='text-blue-500 hover:underline'>
        Go Home
      </Link>
    </div>
  );
}
