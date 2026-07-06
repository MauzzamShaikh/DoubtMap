import axios from 'axios';
import { getTeacherToken } from './utils/auth';
import { getStudentToken } from './utils/studentAuth';

const api = axios.create({
  baseURL: 'https://doubtmap-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const teacherToken = getTeacherToken();
  const studentToken = getStudentToken();

  if (config.url.includes('/history') || config.url.includes('/student-auth')) {
    if (studentToken) config.headers.Authorization = `Bearer ${studentToken}`;
  } else if (teacherToken) {
    config.headers.Authorization = `Bearer ${teacherToken}`;
  } else if (studentToken) {
    config.headers.Authorization = `Bearer ${studentToken}`;
  }

  return config;
});

export default api;