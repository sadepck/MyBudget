import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Plus, X, Trash2, Calendar, TrendingUp,
  AlertTriangle, Power, PowerOff, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = '/api/subscriptions';

// Formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Categorías de suscripciones
const CATEGORIES = [
  'Streaming',
  'Música',
  'Gaming',
  'Software',
  'Almacenamiento',
  'Fitness',
  'Noticias',
  'Educación',
  'Otro'
];

// Iconos por categoría
const getCategoryIcon = (category) => {
  const icons = {
    'Streaming': '📺',
    'Música': '🎵',
    'Gaming': '🎮',
    'Software': '💻',
    'Almacenamiento': '☁️',
    'Fitness': '💪',
    'Noticias': '📰',
    'Educación': '📚',
    'Otro': '📦'
  };
  return icons[category] || '📦';
};

// Componente de tarjeta de suscripción
const SubscriptionCard = ({ subscription, onToggle, onDelete }) => {
  const isActive = subscription.isActive;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`
        p-4 rounded-xl border-l-4 group flex items-center justify-between
        ${isActive 
          ? 'bg-white dark:bg-gray-700/50 border-red-500' 
          : 'bg-gray-100 dark:bg-gray-800/50 border-gray-400 opacity-60'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getCategoryIcon(subscription.category)}</span>
        <div>
          <h4 className={`font-semibold ${isActive ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 line-through'}`}>
            {subscription.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
              {subscription.category}
            </span>
            <span>
              {subscription.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`font-bold ${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
            {formatCurrency(subscription.monthlyAmount)}
            <span className="text-xs font-normal">/mes</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(subscription.yearlyAmount)}/año
          </p>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(subscription._id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isActive 
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200'
            }`}
            title={isActive ? 'Pausar' : 'Reactivar'}
          >
            {isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(subscription._id)}
            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SubscriptionsSection = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totals, setTotals] = useState({ monthly: 0, yearly: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    category: 'Streaming'
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(API_URL, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data);
        setTotals(data.totals);
      }
    } catch (error) {
      toast.error('Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount) {
      toast.error('Nombre y monto son requeridos');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          amount: Number(formData.amount),
          billingCycle: formData.billingCycle,
          category: formData.category
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptions([data.data, ...subscriptions]);
        // Recalcular totales
        const newMonthly = totals.monthly + data.data.monthlyAmount;
        const newYearly = totals.yearly + data.data.yearlyAmount;
        setTotals({ monthly: newMonthly, yearly: newYearly, count: totals.count + 1 });
        
        setFormData({ name: '', amount: '', billingCycle: 'monthly', category: 'Streaming' });
        setShowForm(false);
        toast.success('Suscripción agregada');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleToggle = async (subId) => {
    try {
      const response = await fetch(`${API_URL}/${subId}/toggle`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptions(subscriptions.map(s => 
          s._id === subId ? data.data : s
        ));
        // Refetch para actualizar totales
        fetchSubscriptions();
        toast.success(data.data.isActive ? 'Suscripción reactivada' : 'Suscripción pausada');
      }
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (subId) => {
    if (!window.confirm('¿Eliminar esta suscripción?')) return;

    try {
      const response = await fetch(`${API_URL}/${subId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptions(subscriptions.filter(s => s._id !== subId));
        // Refetch para actualizar totales
        fetchSubscriptions();
        toast.success('Suscripción eliminada');
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const pausedSubscriptions = subscriptions.filter(s => !s.isActive);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              Gastos Vampiro
              <span className="text-lg">🧛</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Suscripciones que drenan tu dinero
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`
            p-2 rounded-xl transition-all duration-200
            ${showForm 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rotate-45' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
            }
          `}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* Panel de Métricas - Dashboard Destacado */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Tarjeta 1: Gasto Mensual */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Gasto Mensual
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {formatCurrency(totals.monthly)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totals.count} suscripciones activas
          </p>
        </motion.div>

        {/* Tarjeta 2: Proyección Anual (El Impacto) */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-10">
            <AlertTriangle className="w-20 h-20 -mt-4 -mr-4" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-white/80" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
              Proyección Anual
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(totals.yearly)}
          </p>
          <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
            <span className="text-lg">🧛</span> Costo vampiro anual
          </p>
        </motion.div>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Nueva suscripción
              </span>
            </div>

            <input
              type="text"
              placeholder="Nombre del servicio (ej: Netflix)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Monto"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />

              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryIcon(cat)} {cat}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Agregar Suscripción
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Lista de suscripciones */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activeSubscriptions.length > 0 && (
          <>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Activas ({activeSubscriptions.length})
            </p>
            <AnimatePresence mode="popLayout">
              {activeSubscriptions.map(sub => (
                <SubscriptionCard
                  key={sub._id}
                  subscription={sub}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </>
        )}

        {pausedSubscriptions.length > 0 && (
          <>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-4">
              Pausadas ({pausedSubscriptions.length})
            </p>
            <AnimatePresence mode="popLayout">
              {pausedSubscriptions.map(sub => (
                <SubscriptionCard
                  key={sub._id}
                  subscription={sub}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </>
        )}

        {subscriptions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No tienes suscripciones registradas</p>
            <p className="text-sm">Agrega tus servicios recurrentes</p>
          </motion.div>
        )}
      </div>

      {/* Tip */}
      {subscriptions.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Tip:</strong> Revisa tus suscripciones cada mes. 
              ¿Realmente usas todos estos servicios? Pausar una suscripción 
              de {formatCurrency(totals.monthly > 0 ? totals.monthly / totals.count : 0)} te ahorra {formatCurrency(totals.yearly > 0 ? totals.yearly / totals.count : 0)} al año.
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default SubscriptionsSection;
