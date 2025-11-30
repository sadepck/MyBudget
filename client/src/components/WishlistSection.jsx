import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Plus, X, ShoppingCart, Heart, HeartOff, 
  Clock, CheckCircle, Archive, Trash2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = '/api/wishes';

// Formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Calcular días desde que se agregó
const getDaysSince = (date) => {
  const now = new Date();
  const added = new Date(date);
  const diffTime = Math.abs(now - added);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Componente de tarjeta de deseo
const WishCard = ({ wish, onBuy, onArchive, onDelete }) => {
  const days = getDaysSince(wish.addedAt);
  const isReady = days >= 30;
  const progress = Math.min((days / 30) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`
        p-4 rounded-xl border-l-4 group relative
        ${wish.status === 'bought' 
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 opacity-70'
          : wish.status === 'archived'
            ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-400 opacity-60'
            : isReady
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-500'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Gift className={`w-4 h-4 ${isReady ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className={`font-semibold ${
              wish.status !== 'active' 
                ? 'text-gray-500 dark:text-gray-400 line-through' 
                : 'text-gray-800 dark:text-gray-100'
            }`}>
              {wish.name}
            </span>
            {wish.status === 'bought' && (
              <span className="text-xs bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                Comprado
              </span>
            )}
            {wish.status === 'archived' && (
              <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                Archivado
              </span>
            )}
          </div>

          {wish.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">
              {wish.description}
            </p>
          )}

          {/* Barra de progreso solo para activos */}
          {wish.status === 'active' && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-medium ${isReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {days} días esperando
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {isReady ? '¡Listo!' : `${30 - days} días restantes`}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    isReady 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                      : 'bg-gradient-to-r from-amber-400 to-yellow-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`
            text-lg font-bold whitespace-nowrap
            ${wish.status !== 'active' 
              ? 'text-gray-400 dark:text-gray-500' 
              : 'text-gray-800 dark:text-gray-100'
            }
          `}>
            {formatCurrency(wish.price)}
          </span>

          {/* Acciones solo para deseos activos */}
          {wish.status === 'active' && (
            <div className="flex gap-1">
              {isReady && (
                <button
                  onClick={() => onBuy(wish._id)}
                  className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  title="¡Comprar!"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onArchive(wish._id)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                title="Me arrepentí"
              >
                <HeartOff className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Botón eliminar para archivados/comprados */}
          {wish.status !== 'active' && (
            <button
              onClick={() => onDelete(wish._id)}
              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const WishlistSection = ({ onTransactionCreated }) => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      const response = await fetch(API_URL, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setWishes(data.data);
      }
    } catch (error) {
      toast.error('Error al cargar la wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      toast.error('Nombre y precio son requeridos');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          price: Number(formData.price),
          description: formData.description.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setWishes([data.data, ...wishes]);
        setFormData({ name: '', price: '', description: '' });
        setShowForm(false);
        toast.success('¡Deseo agregado! Espera 30 días antes de decidir');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleBuy = async (wishId) => {
    if (!window.confirm('¿Confirmas la compra? Se creará una transacción de gasto.')) return;

    try {
      const response = await fetch(`${API_URL}/${wishId}/buy`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setWishes(wishes.map(w => 
          w._id === wishId ? data.data.wish : w
        ));
        toast.success('¡Compra registrada! 🎉');
        if (onTransactionCreated) {
          onTransactionCreated();
        }
      }
    } catch (error) {
      toast.error('Error al procesar la compra');
    }
  };

  const handleArchive = async (wishId) => {
    try {
      const response = await fetch(`${API_URL}/${wishId}/archive`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setWishes(wishes.map(w => 
          w._id === wishId ? data.data : w
        ));
        toast.success('Deseo archivado. ¡Ahorraste dinero! 💪');
      }
    } catch (error) {
      toast.error('Error al archivar');
    }
  };

  const handleDelete = async (wishId) => {
    if (!window.confirm('¿Eliminar este deseo del historial?')) return;

    try {
      const response = await fetch(`${API_URL}/${wishId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setWishes(wishes.filter(w => w._id !== wishId));
        toast.success('Deseo eliminado');
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const activeWishes = wishes.filter(w => w.status === 'active');
  const historyWishes = wishes.filter(w => w.status !== 'active');
  const readyCount = activeWishes.filter(w => getDaysSince(w.addedAt) >= 30).length;
  const totalSaved = historyWishes
    .filter(w => w.status === 'archived')
    .reduce((sum, w) => sum + w.price, 0);

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
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
            <Gift className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Lista de Deseos</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Evita compras impulsivas
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`
            p-2 rounded-xl transition-all duration-200
            ${showForm 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rotate-45' 
              : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50'
            }
          `}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {activeWishes.length}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">En espera</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {readyCount}
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Listos</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-300">Ahorrado</p>
        </div>
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
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                ¿Qué deseas comprar?
              </span>
            </div>

            <input
              type="text"
              placeholder="Nombre del producto"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />

            <input
              type="number"
              placeholder="Precio estimado"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />

            <input
              type="text"
              placeholder="Descripción o link (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Agregar a la lista
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Espera 30 días antes de decidir si realmente lo necesitas
            </p>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Activos ({activeWishes.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Historial ({historyWishes.length})
        </button>
      </div>

      {/* Lista de deseos */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activeTab === 'active' ? (
            activeWishes.length > 0 ? (
              activeWishes.map(wish => (
                <WishCard
                  key={wish._id}
                  wish={wish}
                  onBuy={handleBuy}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                <Gift className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No tienes deseos pendientes</p>
                <p className="text-sm">Agrega algo que quieras comprar</p>
              </motion.div>
            )
          ) : (
            historyWishes.length > 0 ? (
              historyWishes.map(wish => (
                <WishCard
                  key={wish._id}
                  wish={wish}
                  onBuy={handleBuy}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                <Archive className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Sin historial aún</p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WishlistSection;
