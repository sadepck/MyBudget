import { 
  Utensils, 
  Car, 
  Home, 
  Gamepad2, 
  Heart, 
  MoreHorizontal,
  Briefcase,
  ShoppingBag,
  Wifi,
  GraduationCap,
  Plane,
  Gift,
  DollarSign,
  TrendingUp
} from 'lucide-react';

// Categorías para gastos
export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Comida', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'transport', name: 'Transporte', icon: Car, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'home', name: 'Casa', icon: Home, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'entertainment', name: 'Entretenimiento', icon: Gamepad2, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 'health', name: 'Salud', icon: Heart, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'shopping', name: 'Compras', icon: ShoppingBag, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  { id: 'services', name: 'Servicios', icon: Wifi, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { id: 'education', name: 'Educación', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'travel', name: 'Viajes', icon: Plane, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { id: 'other', name: 'Otros', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' },
];

// Categorías para ingresos
export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salario', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { id: 'freelance', name: 'Freelance', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'gift', name: 'Regalo', icon: Gift, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 'investment', name: 'Inversión', icon: DollarSign, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'other_income', name: 'Otros', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' },
];

// Obtener todas las categorías
export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

// Helper para obtener categoría por ID
export const getCategoryById = (categoryId) => {
  return ALL_CATEGORIES.find(cat => cat.id === categoryId) || {
    id: 'unknown',
    name: 'Sin categoría',
    icon: MoreHorizontal,
    color: 'text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-700'
  };
};

// Helper para obtener categorías según tipo de transacción
export const getCategoriesByType = (isExpense) => {
  return isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
};
