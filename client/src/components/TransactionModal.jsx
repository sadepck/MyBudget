import { useEffect } from 'react';
import { X } from 'lucide-react';
import AddTransaction from './AddTransaction';

const TransactionModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  onSave,
  mode = 'edit' // 'edit' | 'duplicate'
}) => {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const title = mode === 'edit' ? 'Editar Transacción' : 'Duplicar Transacción';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <AddTransaction 
            onAdd={onSave}
            initialData={transaction}
            isEditing={mode === 'edit'}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
