import { Search, List, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { getCategoryById } from '../constants/categories';

const TransactionFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType,
  filteredTransactions 
}) => {
  const filters = [
    { id: 'all', label: 'Todos', icon: List },
    { id: 'income', label: 'Ingresos', icon: TrendingUp },
    { id: 'expense', label: 'Gastos', icon: TrendingDown },
  ];

  // Preparar datos para CSV
  const csvData = filteredTransactions.map(t => ({
    Fecha: new Date().toLocaleDateString('es-AR'),
    Categoría: getCategoryById(t.category)?.name || t.text,
    Descripción: t.note || t.text,
    Tipo: t.amount > 0 ? 'Ingreso' : 'Gasto',
    Monto: t.amount.toFixed(2)
  }));

  const csvHeaders = [
    { label: 'Fecha', key: 'Fecha' },
    { label: 'Categoría', key: 'Categoría' },
    { label: 'Descripción', key: 'Descripción' },
    { label: 'Tipo', key: 'Tipo' },
    { label: 'Monto', key: 'Monto' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6 transition-colors duration-300">
      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar transacciones..."
          className="
            w-full pl-10 pr-4 py-2.5 rounded-xl 
            border border-gray-200 dark:border-gray-600
            bg-gray-50 dark:bg-gray-700 
            text-gray-800 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-200
          "
        />
      </div>

      {/* Filtros y Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tabs de filtro */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {filters.map(filter => {
            const Icon = filter.icon;
            const isActive = filterType === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Botón Exportar CSV */}
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename={`mybudget-${filterType}-${new Date().toISOString().split('T')[0]}.csv`}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-gradient-to-r from-emerald-500 to-teal-500
            hover:from-emerald-600 hover:to-teal-600
            text-white text-sm font-medium
            shadow-lg shadow-emerald-500/20
            transition-all duration-200 hover:scale-105
          "
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </CSVLink>
      </div>

      {/* Contador de resultados */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {filteredTransactions.length} transacción{filteredTransactions.length !== 1 ? 'es' : ''} encontrada{filteredTransactions.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default TransactionFilters;
