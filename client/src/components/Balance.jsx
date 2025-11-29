import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils';

const Balance = ({ transactions }) => {
  const total = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  
  
  const isPositive = total >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Balance Total
        </h2>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>
      </div>
      <p className={`text-4xl md:text-5xl font-bold ${
        isPositive ? 'text-gray-800 dark:text-white' : 'text-red-500 dark:text-red-400'
      }`}>
        {formatCurrency(total, true)}
      </p>
    </div>
  );
};

export default Balance;
