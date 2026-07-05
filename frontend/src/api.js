import axios from 'axios';
import { getTeacherToken } from './utils/auth';
import { getStudentToken } from './utils/studentAuth';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const teacherToken = getTeacherToken();
  const studentToken = getStudentToken();

  if (teacherToken) {
    config.headers.Authorization = `Bearer ${teacherToken}`;
  } else if (studentToken) {
    config.headers.Authorization = `Bearer ${studentToken}`;
  }

  return config;
});

export default api;