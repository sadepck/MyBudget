import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const IncomeExpenses = ({ transactions }) => {
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const formatMoney = (amount) => {
    return `$${amount.toLocaleString('es-AR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Ingresos */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <ArrowUpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos</span>
        </div>
        <p className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {formatMoney(income)}
        </p>
      </div>

      {/* Gastos */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gastos</span>
        </div>
        <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
          {formatMoney(expenses)}
        </p>
      </div>
    </div>
  );
};

export default IncomeExpenses;
