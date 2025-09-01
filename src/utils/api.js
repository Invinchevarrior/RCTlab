import axios from 'axios';

// 使用相对路径，让React开发服务器代理到后端
const API_URL = '';

console.log('API URL configured as:', API_URL || 'Using proxy to localhost:5000');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 添加超时设置
  timeout: 10000, // 10秒超时
});

// 添加请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`Making request to: ${config.baseURL}${config.url}`);
  console.log('Request config:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    timeout: config.timeout
  });
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// 添加响应拦截器
api.interceptors.response.use((response) => {
  console.log('Response received:', response.status);
  return response;
}, (error) => {
  console.error('Response error:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    config: error.config
  });
  
  if (error.code === 'ECONNABORTED') {
    console.error('Request timeout - server may be down');
  } else if (error.code === 'ERR_NETWORK') {
    console.error('Network error - check if backend server is running');
  }
  
  return Promise.reject(error);
});

export default api;
