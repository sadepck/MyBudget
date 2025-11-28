import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { getCategoryById } from '../constants/categories';

const TransactionItem = ({ transaction, onDelete }) => {
  // Soporta tanto _id (MongoDB) como id (legacy)
  const { _id, id, text, amount, category, note } = transaction;
  const transactionId = _id || id;
  const isIncome = amount > 0;
  
  // Obtener datos de la categoría
  const categoryData = getCategoryById(category);
  const CategoryIcon = categoryData.icon;

  const formatMoney = (amount) => {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(amount).toLocaleString('es-AR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  // Mostrar nota si existe, sino el nombre de categoría o texto legacy
  const displayText = note || categoryData.name || text;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      className={`
        bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 
        ${isIncome ? 'border-emerald-500' : 'border-red-500'}
        hover:shadow-md transition-all duration-200 group
      `}
    >
      <div className="flex items-center gap-3">
        {/* Icono de categoría */}
        <div className={`p-2 rounded-xl ${categoryData.bg} flex-shrink-0`}>
          <CategoryIcon className={`w-5 h-5 ${categoryData.color}`} />
        </div>
        
        {/* Información */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 dark:text-gray-100 font-medium truncate">
            {displayText}
          </p>
          {note && category && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {categoryData.name}
            </p>
          )}
        </div>
        
        {/* Monto y botón eliminar */}
        <div className="flex items-center gap-2">
          <span className={`
            font-semibold text-lg whitespace-nowrap
            ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
          `}>
            {formatMoney(amount)}
          </span>
          
          <button
            onClick={() => onDelete(transactionId)}
            className="
              opacity-0 group-hover:opacity-100
              w-8 h-8 flex items-center justify-center
              bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50
              text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300
              rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800
            "
            title="Eliminar transacción"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.li>
  );
};

export default TransactionItem;
