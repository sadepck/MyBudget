import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Plus, ChevronDown, Save, X } from 'lucide-react';
import { getCategoriesByType, getCategoryById } from '../constants/categories';

// Obtener fecha de hoy en formato YYYY-MM-DD para el input date
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const AddTransaction = ({ onAdd, initialData, isEditing, onCancel }) => {
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [isExpense, setIsExpense] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Cargar datos iniciales para edición o duplicación
  useEffect(() => {
    if (initialData) {
      const isExp = initialData.amount < 0;
      setIsExpense(isExp);
      setCategory(initialData.category || '');
      setNote(initialData.note || '');
      setAmount(Math.abs(initialData.amount).toString());
      // Para duplicar, usar fecha de hoy; para editar, usar fecha original
      if (isEditing && initialData.date) {
        const d = new Date(initialData.date);
        setDate(d.toISOString().split('T')[0]);
      } else {
        setDate(getTodayDate());
      }
    }
  }, [initialData, isEditing]);

  // Obtener categorías según el tipo de transacción
  const categories = getCategoriesByType(isExpense);
  const selectedCategory = categories.find(c => c.id === category);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!category || !amount) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      return;
    }

    // Si es gasto, convertir a negativo
    const finalAmount = isExpense ? -Math.abs(numAmount) : Math.abs(numAmount);
    const categoryData = categories.find(c => c.id === category);

    const transactionData = {
      text: categoryData?.name || category,
      category: category,
      note: note.trim(),
      amount: finalAmount,
      date: date
    };

    // Si estamos editando, incluir el ID
    if (isEditing && initialData?._id) {
      transactionData._id = initialData._id;
    }

    onAdd(transactionData);

    // Solo limpiar si no estamos editando
    if (!isEditing) {
      setCategory('');
      setNote('');
      setAmount('');
      setDate(getTodayDate());
    }
  };

  // Cambiar tipo resetea la categoría
  const handleTypeChange = (expense) => {
    setIsExpense(expense);
    setCategory('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300">
      {!isEditing && !initialData && (
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
          Nueva Transacción
        </h3>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Tipo de transacción */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange(false)}
            className={`
              flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200
              ${!isExpense 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowUp className="w-4 h-4" />
              Ingreso
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange(true)}
            className={`
              flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200
              ${isExpense 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowDown className="w-4 h-4" />
              Gasto
            </span>
          </button>
        </div>

        {/* Selector de Categoría */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Categoría
          </label>
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="
              w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-700 text-left
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              transition-all duration-200 flex items-center justify-between
            "
          >
            {selectedCategory ? (
              <span className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${selectedCategory.bg}`}>
                  <selectedCategory.icon className={`w-4 h-4 ${selectedCategory.color}`} />
                </span>
                <span className="text-gray-800 dark:text-gray-100">{selectedCategory.name}</span>
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">Selecciona una categoría</span>
            )}
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown de categorías */}
          {showCategoryDropdown && (
            <div className="absolute z-20 w-full mt-2 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 max-h-48 overflow-y-auto">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setShowCategoryDropdown(false);
                    }}
                    className={`
                      w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-600
                      transition-colors ${category === cat.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
                    `}
                  >
                    <span className={`p-1.5 rounded-lg ${cat.bg}`}>
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                    </span>
                    <span className="text-gray-700 dark:text-gray-200">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Campo de nota opcional */}
        <div className="mb-4">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Nota <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Almuerzo con amigos, Netflix mensual..."
            className="
              w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200
            "
          />
        </div>

        {/* Campo de fecha */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="
              w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              transition-all duration-200
              [color-scheme:light] dark:[color-scheme:dark]
            "
          />
        </div>

        {/* Campo de monto */}
        <div className="mb-5">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Monto
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="
                w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Botones */}
        <div className={`flex gap-3 ${onCancel ? '' : ''}`}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="
                flex-1 py-3 px-4 rounded-xl font-semibold
                bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-600
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className={`
              ${onCancel ? 'flex-1' : 'w-full'} py-3.5 px-4 rounded-xl font-semibold text-white
              bg-gradient-to-r from-purple-600 to-indigo-600
              hover:from-purple-700 hover:to-indigo-700
              shadow-lg shadow-purple-500/30 dark:shadow-purple-900/30
              transition-all duration-200 transform hover:scale-[1.02]
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              flex items-center justify-center gap-2
            `}
          >
            {isEditing ? (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Agregar Transacción
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransaction;
