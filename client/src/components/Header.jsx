import { useState } from 'react';
import { Wallet, LogOut, UserX, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Header = ({ user, onLogout, onDeleteAccount }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await onDeleteAccount();
    setIsDeleting(false);
    
    if (!result.success) {
      alert(result.error || 'Error al eliminar la cuenta');
    }
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              MyBudget
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="
                    p-2 rounded-xl
                    bg-white/10 hover:bg-white/20
                    text-white/70 hover:text-white
                    transition-all duration-200
                  "
                  title="Opciones"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Menú desplegable */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <button
                        onClick={() => {
                          onLogout();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Cerrar sesión</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        <span className="text-sm">Eliminar cuenta</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        {user ? (
          <p className="text-white/70 text-sm md:text-base">
            Hola, <span className="text-white font-medium">{user.name}</span> 👋
          </p>
        ) : (
          <p className="text-white/70 text-sm md:text-base">
            Controla tus finanzas personales
          </p>
        )}
      </header>

      {/* Modal de confirmación para eliminar cuenta */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                ¿Eliminar tu cuenta?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Esta acción es <span className="font-semibold text-red-600 dark:text-red-400">permanente</span>. 
                Se eliminarán todos tus datos: transacciones, presupuestos y deudas. 
                No podrás recuperar tu cuenta.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    'Sí, eliminar'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar menú */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)} 
        />
      )}
    </>
  );
};

export default Header;
