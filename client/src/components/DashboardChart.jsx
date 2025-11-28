import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const DashboardChart = ({ transactions }) => {
  const { isDark } = useTheme();
  
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const expenses = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => acc + t.amount, 0)
  );

  const data = [
    { name: 'Ingresos', value: income, color: '#10b981' },
    { name: 'Gastos', value: expenses, color: '#ef4444' },
  ];

  const total = income + expenses;

  // Si no hay datos, mostrar placeholder
  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Distribución
        </h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Agrega transacciones para ver el gráfico
          </p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {data.name}
          </p>
          <p className="text-lg font-bold" style={{ color: data.payload.color }}>
            ${data.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {((data.value / total) * 100).toFixed(1)}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy }) => {
    const percentage = total > 0 ? ((income / total) * 100).toFixed(0) : 0;
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-gray-800 dark:fill-gray-200"
      >
        <tspan x={cx} dy="-0.5em" className="text-2xl font-bold">
          {percentage}%
        </tspan>
        <tspan x={cx} dy="1.5em" className="text-xs fill-gray-500 dark:fill-gray-400">
          Ingresos
        </tspan>
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Distribución
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={isDark ? '#1f2937' : '#ffffff'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
