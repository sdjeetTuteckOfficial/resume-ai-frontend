export const useMockAuth = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  console.log('hi', user);

  return {
    isAuthenticated: !!token,
    user,
    role: user?.role || 'user',
    token,
  };
};
