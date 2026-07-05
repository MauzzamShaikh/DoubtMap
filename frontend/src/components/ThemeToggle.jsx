import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getSystemTheme, applyTheme } from '../utils/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getSystemTheme());

  useEffect(() => {
    // Keep internal state aligned if changed externally
    const interval = setInterval(() => {
      const active = getSystemTheme();
      if (active !== theme) {
        setTheme(active);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md duration-300"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '15s' }} />
      ) : (
        <Moon className="w-5 h-5 text-indigo-400" />
      )}
    </button>
  );
}
