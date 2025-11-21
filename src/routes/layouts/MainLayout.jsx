import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import {
  LogOut,
  LayoutDashboard,
  CircleUser,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// --- Mock Auth Hook (Kept from previous context) ---
// Revert to: import { useMockAuth } from '../../services/authService';
const useMockAuth = () => {
  return { user: { role: 'admin' } };
};

export default function MainLayout() {
  const { user } = useMockAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // navigate('/login'); // Recommended way with router
    window.location.href = '/login';
  };

  // Styles for the sidebar to match your Slate-900 theme
  const sidebarHex = '#0f172a'; // slate-900
  const activeHex = '#1e293b'; // slate-800 (active background)
  const hoverHex = '#334155'; // slate-700 (hover background)
  const textHex = '#94a3b8'; // slate-400 (default text)
  const activeTextHex = '#ffffff';

  const menuItemStyles = {
    button: ({ level, active, disabled }) => {
      return {
        color: active ? activeTextHex : textHex,
        backgroundColor: active ? activeHex : undefined,
        borderRadius: '8px',
        margin: '4px 8px',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: `${hoverHex} !important`,
          color: '#ffffff !important',
        },
      };
    },
    icon: {
      minWidth: '20px', // Ensure icons don't shrink
    },
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar
        collapsed={collapsed}
        backgroundColor={sidebarHex}
        rootStyles={{
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header / Toggle */}
        <div className='flex items-center justify-between p-6 h-20'>
          {!collapsed && (
            <h1 className='text-2xl font-bold text-blue-400 whitespace-nowrap overflow-hidden'>
              ResumeAI
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className='text-slate-400 hover:text-white transition-colors ml-auto p-1 rounded hover:bg-slate-800'
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <div className='flex-1 overflow-y-auto'>
          <Menu menuItemStyles={menuItemStyles}>
            <MenuItem
              component={<Link to='/' />}
              active={location.pathname === '/'}
              icon={<LayoutDashboard size={20} />}
            >
              Dashboard
            </MenuItem>

            <MenuItem
              component={<Link to='/workspace' />}
              active={location.pathname === '/workspace'}
              icon={<CircleUser size={20} />}
            >
              Workspace
            </MenuItem>

            {user?.role === 'admin' && (
              <MenuItem
                component={<Link to='/admin/jobs' />}
                active={location.pathname === '/admin/jobs'}
                icon={
                  <ShieldAlert
                    size={20}
                    className={
                      location.pathname === '/admin/jobs'
                        ? 'text-yellow-400'
                        : ''
                    }
                  />
                }
              >
                <span
                  className={
                    location.pathname === '/admin/jobs' ? 'text-yellow-400' : ''
                  }
                >
                  Jobs
                </span>
              </MenuItem>
            )}
          </Menu>
        </div>

        {/* Footer / Logout */}
        <div className='p-4 border-t border-slate-700 mt-auto'>
          <Menu menuItemStyles={menuItemStyles}>
            <MenuItem onClick={handleLogout} icon={<LogOut size={20} />}>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Sidebar>

      {/* Main Content Area */}
      <main className='flex-1 overflow-y-auto p-8'>
        <Outlet />
      </main>
    </div>
  );
}
