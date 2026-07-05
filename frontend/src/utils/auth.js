export function saveTeacherAuth(token, teacher) {
  localStorage.setItem('teacher_token', token);
  localStorage.setItem('teacher_info', JSON.stringify(teacher));
}

export function getTeacherToken() {
  return localStorage.getItem('teacher_token');
}

export function getTeacherInfo() {
  const info = localStorage.getItem('teacher_info');
  return info ? JSON.parse(info) : null;
}

export function logoutTeacher() {
  localStorage.removeItem('teacher_token');
  localStorage.removeItem('teacher_info');
}