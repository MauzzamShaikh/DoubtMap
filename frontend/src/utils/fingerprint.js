export function getFingerprint() {
  let fp = localStorage.getItem('device_fingerprint');
  if (!fp) {
    fp = 'fp_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('device_fingerprint', fp);
  }
  return fp;
}