export function saveStudentAuth(token, student) {
  localStorage.setItem('student_token', token);
  localStorage.setItem('student_info', JSON.stringify(student));
}

export function getStudentToken() {
  return localStorage.getItem('student_token');
}

export function getStudentInfo() {
  const info = localStorage.getItem('student_info');
  return info ? JSON.parse(info) : null;
}

export function logoutStudent() {
  localStorage.removeItem('student_token');
  localStorage.removeItem('student_info');
}