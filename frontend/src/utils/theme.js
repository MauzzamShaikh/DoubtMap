export function getSystemTheme() {
  if (localStorage.getItem('theme') === 'light') {
    return 'light';
  }
  return 'dark'; // dark-mode first by default
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
    document.body.className = "bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500/10 selection:text-indigo-800 transition-colors duration-300";
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    document.body.className = "bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-300";
  }
  localStorage.setItem('theme', theme);
}
