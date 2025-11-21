export const useMockAuth = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  return {
    isAuthenticated: !!token,
    user,
    role: user?.role || 'user',
    token,
  };
};
