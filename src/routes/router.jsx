import { createBrowserRouter } from 'react-router-dom';
import PublicRoute from './guards/PublicRoute';
import ProtectedRoute from './guards/ProtectedRoute';
import AdminRoute from './guards/AdminRoute.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import OTPPage from '../pages/OtpPage.jsx';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from '../pages/LoginPage.jsx';
import Dashboard from '../pages/Dashboard';
import Workspace from '../pages/Workspace';
import UserManager from '../pages/UserManager';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import JobManager from '../pages/JobDescriptionPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPassword.jsx';
import OnboardingPage from '../pages/EmployeeOnboarding/EmployeeOnboardingPage.jsx';
import AdminProctorView from '../pages/AdminProctorView/AdminProctorView.jsx';

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <RegisterPage /> },
          { path: '/otp-page', element: <OTPPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <OnboardingPage /> },
          { path: '/job-onboarding', element: <OnboardingPage /> },
          { path: '/chat/:id', element: <div>Chat Interface</div> },
          { path: '/unauthorized', element: <Unauthorized /> },
          {
            path: 'admin',
            element: <AdminRoute />,
            children: [
              { path: 'jobs', element: <JobManager /> },
              { path: 'admin-proctor-view', element: <AdminProctorView /> },
              { path: 'settings', element: <div>System Settings</div> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
