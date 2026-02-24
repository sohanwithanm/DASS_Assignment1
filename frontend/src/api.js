import axios from 'axios';

// Detect if the app is running locally or in production
const isLocal = window.location.hostname === 'localhost';

// Set the Base URL accordingly
const API_BASE_URL = isLocal 
  ? 'http://localhost:5001/api' 
  : 'https://felicity-event-management-oqqg.onrender.com/api'; // Render backend
  

// Create an Axios instance with the base URL and credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Automatically add the token to every request if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;