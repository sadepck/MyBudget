import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import Balance from './components/Balance';
import IncomeExpenses from './components/IncomeExpenses';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import DashboardChart from './components/DashboardChart';
import TransactionFilters from './components/TransactionFilters';
import TransactionModal from './components/TransactionModal';
import BudgetProgress from './components/BudgetProgress';
import DebtsSection from './components/DebtsSection';
import WishlistSection from './components/WishlistSection';
import SubscriptionsSection from './components/SubscriptionsSection';
import { PageSkeleton } from './components/Skeleton';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getCategoryById } from './constants/categories';
import { RotateCcw, LogOut } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const API_URL = '/api/transactions';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageSkeleton />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para rutas públicas (login/register)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageSkeleton />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Dashboard principal
function Dashboard() {
  const { user, logout, deleteAccount } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  
  // Estados para modal de edición/duplicación
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' | 'duplicate'
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filtrar transacciones con useMemo para rendimiento
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filtro por tipo
      if (filterType === 'income' && transaction.amount <= 0) return false;
      if (filterType === 'expense' && transaction.amount >= 0) return false;
      
      // Filtro por búsqueda (busca en categoría, nota y texto legacy)
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const category = getCategoryById(transaction.category);
        const categoryName = category?.name?.toLowerCase() || '';
        const note = transaction.note?.toLowerCase() || '';
        const text = transaction.text?.toLowerCase() || '';
        
        return categoryName.includes(search) || note.includes(search) || text.includes(search);
      }
      
      return true;
    });
  }, [transactions, searchTerm, filterType]);

  // Cargar transacciones al iniciar
  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
  };

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      toast.success('Cuenta eliminada correctamente');
    }
    return result;
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      } else {
        toast.error('Error al cargar transacciones');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Agregar transacción
  const addTransaction = async (transaction) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(transaction),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactions([...transactions, data.data]);
        toast.success(`${transaction.amount > 0 ? 'Ingreso' : 'Gasto'} agregado correctamente`, {
          description: `${transaction.text}: $${Math.abs(transaction.amount).toFixed(2)}`
        });
      } else {
        toast.error(data.error || 'Error al agregar transacción');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
      console.error('Error adding transaction:', err);
    }
  };

  // Resetear todas las transacciones (Demo)
  const resetTransactions = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de eliminar TODAS las transacciones?\n\nEsta acción no se puede deshacer.'
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactions([]);
        toast.success('Datos reseteados', {
          description: `Se eliminaron ${data.deletedCount} transacciones`
        });
      } else {
        toast.error(data.error || 'Error al resetear datos');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
      console.error('Error resetting transactions:', err);
    }
  };

  // Actualizar transacción
  const updateTransaction = async (transaction) => {
    try {
      const response = await fetch(`${API_URL}/${transaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(transaction),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactions(transactions.map(t => 
          (t._id || t.id) === transaction._id ? data.data : t
        ));
        toast.success('Transacción actualizada');
        setModalOpen(false);
        setSelectedTransaction(null);
      } else {
        toast.error(data.error || 'Error al actualizar transacción');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
      console.error('Error updating transaction:', err);
    }
  };

  // Manejar edición
  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Manejar duplicación
  const handleDuplicate = (transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('duplicate');
    setModalOpen(true);
  };

  // Guardar desde modal
  const handleModalSave = async (transactionData) => {
    if (modalMode === 'edit') {
      await updateTransaction(transactionData);
    } else {
      // Duplicar = crear nueva
      await addTransaction(transactionData);
      setModalOpen(false);
      setSelectedTransaction(null);
    }
  };

  // Eliminar transacción (soporta _id de MongoDB y id legacy)
  const deleteTransaction = async (id) => {
    const transactionToDelete = transactions.find(t => (t._id || t.id) === id);
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactions(transactions.filter(t => (t._id || t.id) !== id));
        toast.success('Transacción eliminada', {
          description: transactionToDelete ? `"${transactionToDelete.text}" fue eliminada` : undefined
        });
      } else {
        toast.error(data.error || 'Error al eliminar transacción');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
      console.error('Error deleting transaction:', err);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        <Header user={user} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />
        {/* Balance e Ingresos/Gastos siempre muestran totales reales */}
        <Balance transactions={transactions} />
        <IncomeExpenses transactions={transactions} />
        
        {/* Filtros */}
        <TransactionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filteredTransactions={filteredTransactions}
        />
        
        {/* Gráfico y Lista usan datos filtrados */}
        <DashboardChart transactions={filteredTransactions} />
        <BudgetProgress transactions={transactions} />
        <SubscriptionsSection />
        <WishlistSection onTransactionCreated={fetchTransactions} />
        <DebtsSection />
        <AddTransaction onAdd={addTransaction} />
        <TransactionList 
          transactions={filteredTransactions} 
          onDelete={deleteTransaction}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
        />
        
        {/* Modal de Edición/Duplicación */}
        <TransactionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          onSave={handleModalSave}
          mode={modalMode}
        />
        
        {/* Footer con botón Reset Demo */}
        <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center">
            <button
              onClick={resetTransactions}
              className="
                flex items-center gap-2 px-4 py-2 rounded-lg
                text-sm text-gray-500 dark:text-gray-400
                hover:text-red-500 dark:hover:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20
                transition-all duration-200
              "
            >
              <RotateCcw className="w-4 h-4" />
              Resetear Datos Demo
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
            MyBudget • Expense Tracker
          </p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            toastOptions={{
              duration: 3000,
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
