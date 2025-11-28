import { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import Balance from './components/Balance';
import IncomeExpenses from './components/IncomeExpenses';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import DashboardChart from './components/DashboardChart';
import TransactionFilters from './components/TransactionFilters';
import { PageSkeleton } from './components/Skeleton';
import { ThemeProvider } from './context/ThemeContext';
import { getCategoryById } from './constants/categories';

const API_URL = '/api/transactions';

function AppContent() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'

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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
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

  // Eliminar transacción (soporta _id de MongoDB y id legacy)
  const deleteTransaction = async (id) => {
    const transactionToDelete = transactions.find(t => (t._id || t.id) === id);
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
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
        <Header />
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
        <AddTransaction onAdd={addTransaction} />
        <TransactionList 
          transactions={filteredTransactions} 
          onDelete={deleteTransaction} 
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          duration: 3000,
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
