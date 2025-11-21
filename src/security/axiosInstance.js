import axios from 'axios';
const ENV = window.location.hostname; // Get current environment
// console.log('environment', ENV);
let baseURL = '';
const apiBaseUrlDev = import.meta.env.VITE_API_BASE_URL_DEV;

switch (ENV) {
  case 'localhost':
    baseURL = apiBaseUrlDev;
    break;
  default:
    throw new Error('Unknown environment');
}

const axiosInstance = axios.create({
  baseURL,
});

// Attach token dynamically before each request
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const idToken = localStorage.getItem('token'); // direct token string
      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`; // or `Bearer ${idToken}` if backend expects that
      }
    } catch (error) {
      console.error('Error setting auth header:', error);
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
