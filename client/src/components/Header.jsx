import { Wallet } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            MyBudget
          </h1>
        </div>
        <ThemeToggle />
      </div>
      <p className="text-white/70 text-sm md:text-base">
        Controla tus finanzas personales
      </p>
    </header>
  );
};

export default Header;
