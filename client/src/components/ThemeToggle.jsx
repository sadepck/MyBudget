import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative w-14 h-7 rounded-full p-1
        bg-gray-200 dark:bg-gray-700
        transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
      "
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {/* Track icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Sun className="w-4 h-4 text-amber-500" />
        <Moon className="w-4 h-4 text-indigo-400" />
      </div>
      
      {/* Thumb */}
      <div
        className={`
          relative z-10 w-5 h-5 rounded-full
          bg-white shadow-md
          transform transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-7' : 'translate-x-0'}
        `}
      />
    </button>
  );
};

export default ThemeToggle;
