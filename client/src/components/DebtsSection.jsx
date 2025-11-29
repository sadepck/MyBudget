import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandCoins, 
  Plus, 
  X, 
  Check, 
  Trash2, 
  Mail, 
  User, 
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Undo2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../utils';

const API_URL = '/api/debts';

const DebtsSection = () => {
  const [debts, setDebts] = useState({ owedToMe: [], iOwe: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('owedToMe'); // 'owedToMe' | 'iOwe'
  const [showPaid, setShowPaid] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const response = await fetch(API_URL, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setDebts(data.data);
      }
    } catch (error) {
      console.error('Error fetching debts:', error);
      toast.error('Error al cargar deudas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar deudas pendientes y pagadas
  const filteredDebts = useMemo(() => {
    const list = activeTab === 'owedToMe' ? debts.owedToMe : debts.iOwe;
    if (showPaid) {
      return list;
    }
    return list.filter(d => !d.isPaid);
  }, [debts, activeTab, showPaid]);

  // Totales
  const totals = useMemo(() => {
    const owedToMePending = debts.owedToMe
      .filter(d => !d.isPaid)
      .reduce((sum, d) => sum + d.amount, 0);
    const iOwePending = debts.iOwe
      .filter(d => !d.isPaid)
      .reduce((sum, d) => sum + d.amount, 0);
    return { owedToMePending, iOwePending };
  }, [debts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.amount) {
      toast.error('Email y monto son requeridos');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setDebts(prev => ({
          ...prev,
          owedToMe: [data.data, ...prev.owedToMe]
        }));
        setFormData({ email: '', name: '', amount: '', description: '' });
        setShowForm(false);
        toast.success('Préstamo registrado');
      } else {
        toast.error(data.error || 'Error al registrar préstamo');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleMarkPaid = async (debtId) => {
    try {
      const response = await fetch(`${API_URL}/${debtId}/pay`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setDebts(prev => ({
          ...prev,
          owedToMe: prev.owedToMe.map(d => 
            d._id === debtId ? { ...d, isPaid: true, paidAt: new Date() } : d
          )
        }));
        toast.success('¡Deuda cobrada!');
      }
    } catch (error) {
      toast.error('Error al marcar como pagada');
    }
  };

  const handleUnmarkPaid = async (debtId) => {
    try {
      const response = await fetch(`${API_URL}/${debtId}/unpay`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setDebts(prev => ({
          ...prev,
          owedToMe: prev.owedToMe.map(d => 
            d._id === debtId ? { ...d, isPaid: false, paidAt: null } : d
          )
        }));
        toast.success('Deuda restaurada');
      }
    } catch (error) {
      toast.error('Error al restaurar deuda');
    }
  };

  const handleDelete = async (debtId) => {
    if (!window.confirm('¿Eliminar este préstamo?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${debtId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setDebts(prev => ({
          ...prev,
          owedToMe: prev.owedToMe.filter(d => d._id !== debtId)
        }));
        toast.success('Préstamo eliminado');
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Préstamos y Deudas
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
          title="Registrar préstamo"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Resumen de totales */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Por cobrar</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(totals.owedToMePending)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
          <p className="text-xs text-red-600 dark:text-red-400 mb-1">Por pagar</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">
            {formatCurrency(totals.iOwePending)}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registrar nuevo préstamo
              </h4>
              
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email del deudor *"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
                />
              </div>

              {/* Nombre */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre (opcional)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
                />
              </div>

              {/* Monto */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Monto *"
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
                />
              </div>

              {/* Descripción */}
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Concepto (opcional)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <HandCoins className="w-4 h-4" />
                Registrar Préstamo
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('owedToMe')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'owedToMe'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Por Cobrar ({debts.owedToMe.filter(d => !d.isPaid).length})
        </button>
        <button
          onClick={() => setActiveTab('iOwe')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'iOwe'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Por Pagar ({debts.iOwe.filter(d => !d.isPaid).length})
        </button>
      </div>

      {/* Toggle mostrar pagadas */}
      {((activeTab === 'owedToMe' && debts.owedToMe.some(d => d.isPaid)) ||
        (activeTab === 'iOwe' && debts.iOwe.some(d => d.isPaid))) && (
        <button
          onClick={() => setShowPaid(!showPaid)}
          className="w-full mb-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-1"
        >
          {showPaid ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showPaid ? 'Ocultar pagadas' : 'Mostrar pagadas'}
        </button>
      )}

      {/* Lista de deudas */}
      {filteredDebts.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-6">
          {activeTab === 'owedToMe' 
            ? 'No tienes préstamos pendientes por cobrar'
            : 'No tienes deudas pendientes'
          }
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredDebts.map(debt => (
              <DebtCard
                key={debt._id}
                debt={debt}
                type={activeTab}
                onMarkPaid={handleMarkPaid}
                onUnmarkPaid={handleUnmarkPaid}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

// Componente de tarjeta de deuda
const DebtCard = ({ debt, type, onMarkPaid, onUnmarkPaid, onDelete }) => {
  const isOwedToMe = type === 'owedToMe';
  const personName = isOwedToMe 
    ? (debt.debtorName || debt.debtorEmail)
    : (debt.creditor?.name || debt.creditor?.email || 'Usuario');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`
        p-4 rounded-xl border-l-4 group
        ${debt.isPaid 
          ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600 opacity-60' 
          : isOwedToMe
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${debt.isPaid ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
              {personName}
            </span>
            {debt.isPaid && (
              <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                Pagado
              </span>
            )}
          </div>
          {debt.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {debt.description}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatDate(debt.createdAt)}
            {debt.isPaid && debt.paidAt && ` • Pagado: ${formatDate(debt.paidAt)}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`
            text-lg font-bold whitespace-nowrap
            ${debt.isPaid 
              ? 'text-gray-400 dark:text-gray-500' 
              : isOwedToMe 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }
          `}>
            {formatCurrency(debt.amount)}
          </span>

          {/* Acciones solo para "Por Cobrar" */}
          {isOwedToMe && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {debt.isPaid ? (
                <button
                  onClick={() => onUnmarkPaid(debt._id)}
                  className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                  title="Restaurar como pendiente"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onMarkPaid(debt._id)}
                  className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                  title="Marcar como pagado"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(debt._id)}
                className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DebtsSection;
