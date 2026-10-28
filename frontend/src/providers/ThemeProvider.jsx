import { useEffect, useState } from 'react';
import ThemeContext from '../context/ThemeContext.jsx';

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('imovies_theme') || 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('imovies_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
