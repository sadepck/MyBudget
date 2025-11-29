import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EXPENSE_CATEGORIES, getCategoryById } from '../constants/categories';
import { formatCurrency } from '../utils';

const API_URL = '/api/budgets';

const BudgetProgress = ({ transactions }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Cargar presupuestos
  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(API_URL, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setBudgets(data.data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular gastos del mes actual por categoría
  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const expenses = {};
    transactions.forEach(t => {
      if (t.amount < 0) {
        const transactionDate = new Date(t.date || t.createdAt);
        if (transactionDate >= startOfMonth) {
          const cat = t.category || 'other';
          expenses[cat] = (expenses[cat] || 0) + Math.abs(t.amount);
        }
      }
    });
    return expenses;
  }, [transactions]);

  // Categorías disponibles para agregar presupuesto (que no tengan uno ya)
  const availableCategories = useMemo(() => {
    const usedCategories = budgets.map(b => b.category);
    return EXPENSE_CATEGORIES.filter(c => !usedCategories.includes(c.id));
  }, [budgets]);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory || !limitAmount) {
      toast.error('Selecciona categoría y límite');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category: selectedCategory,
          limit: parseFloat(limitAmount)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setBudgets([...budgets.filter(b => b.category !== selectedCategory), data.data]);
        setSelectedCategory('');
        setLimitAmount('');
        setShowForm(false);
        toast.success('Presupuesto guardado');
      } else {
        toast.error(data.error || 'Error al guardar presupuesto');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const response = await fetch(`${API_URL}/${budgetId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setBudgets(budgets.filter(b => b._id !== budgetId));
        toast.success('Presupuesto eliminado');
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getProgressBg = (percentage) => {
    if (percentage >= 100) return 'bg-red-100 dark:bg-red-900/30';
    if (percentage >= 80) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-emerald-100 dark:bg-emerald-900/30';
  };

  if (loading) return null;

  const selectedCategoryData = EXPENSE_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Presupuestos del Mes
          </h3>
        </div>
        {availableCategories.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Formulario para agregar presupuesto */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddBudget}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
              {/* Selector de categoría */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-left flex items-center justify-between"
                >
                  {selectedCategoryData ? (
                    <span className="flex items-center gap-2">
                      <span className={`p-1 rounded ${selectedCategoryData.bg}`}>
                        <selectedCategoryData.icon className={`w-4 h-4 ${selectedCategoryData.color}`} />
                      </span>
                      <span className="text-gray-800 dark:text-gray-100">{selectedCategoryData.name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Selecciona categoría</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdown && (
                  <div className="absolute z-20 w-full mt-1 py-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-100 dark:border-gray-600 max-h-40 overflow-y-auto">
                    {availableCategories.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setShowDropdown(false);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <span className={`p-1 rounded ${cat.bg}`}>
                            <Icon className={`w-4 h-4 ${cat.color}`} />
                          </span>
                          <span className="text-gray-700 dark:text-gray-200 text-sm">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input de límite */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="Límite mensual"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              >
                Guardar Presupuesto
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Lista de presupuestos */}
      {budgets.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
          No tienes presupuestos configurados
        </p>
      ) : (
        <div className="space-y-4">
          {budgets.map(budget => {
            const category = getCategoryById(budget.category);
            const spent = monthlyExpenses[budget.category] || 0;
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            const isOverBudget = spent > budget.limit;
            const CategoryIcon = category.icon;

            return (
              <div key={budget._id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${category.bg}`}>
                      <CategoryIcon className={`w-4 h-4 ${category.color}`} />
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {category.name}
                    </span>
                    {isOverBudget && (
                      <span className="flex items-center gap-1 text-xs text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        ¡Excedido!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                    </span>
                    <button
                      onClick={() => handleDeleteBudget(budget._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className={`h-3 rounded-full ${getProgressBg(percentage)} overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${getProgressColor(percentage)}`}
                  />
                </div>
                
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
                  {percentage.toFixed(0)}% usado
                </p>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default BudgetProgress;
