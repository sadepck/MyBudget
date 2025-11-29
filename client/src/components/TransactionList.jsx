import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions, onDelete, onEdit, onDuplicate }) => {
  if (transactions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center transition-colors duration-300"
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 font-medium">No hay transacciones</h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Agrega tu primera transacción</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-4 transition-colors duration-300"
    >
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
        Historial ({transactions.length})
      </h3>
      <ul className="space-y-3">
        <AnimatePresence mode="popLayout">
          {transactions.map(transaction => (
            <TransactionItem 
              key={transaction._id || transaction.id} 
              transaction={transaction} 
              onDelete={onDelete}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
            />
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
};

export default TransactionList;
