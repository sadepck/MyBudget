import { motion } from 'framer-motion';
import { Trash2, Pencil, Copy } from 'lucide-react';
import { getCategoryById } from '../constants/categories';
import { formatCurrency, formatDate } from '../utils';

const TransactionItem = ({ transaction, onDelete, onEdit, onDuplicate }) => {
  // Soporta tanto _id (MongoDB) como id (legacy)
  const { _id, id, text, amount, category, note, date } = transaction;
  const transactionId = _id || id;
  const isIncome = amount > 0;
  
  // Obtener datos de la categoría
  const categoryData = getCategoryById(category);
  const CategoryIcon = categoryData.icon;

  
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
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
            {note && category && <span>{categoryData.name}</span>}
            {note && category && date && <span>•</span>}
            {date && <span>{formatDate(date)}</span>}
          </p>
        </div>
        
        {/* Monto y botones de acción */}
        <div className="flex items-center gap-1">
          <span className={`
            font-semibold text-lg whitespace-nowrap mr-1
            ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
          `}>
            {formatCurrency(amount, true)}
          </span>
          
          {/* Botón Duplicar */}
          <button
            onClick={() => onDuplicate(transaction)}
            className="
              opacity-0 group-hover:opacity-100
              w-8 h-8 flex items-center justify-center
              bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50
              text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300
              rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800
            "
            title="Duplicar transacción"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          {/* Botón Editar */}
          <button
            onClick={() => onEdit(transaction)}
            className="
              opacity-0 group-hover:opacity-100
              w-8 h-8 flex items-center justify-center
              bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50
              text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300
              rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-800
            "
            title="Editar transacción"
          >
            <Pencil className="w-4 h-4" />
          </button>
          
          {/* Botón Eliminar */}
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
