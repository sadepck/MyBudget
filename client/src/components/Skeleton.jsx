// Skeleton base component
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

// Balance Skeleton
export const BalanceSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-12 w-48" />
  </div>
);

// Income/Expenses Skeleton
export const IncomeExpensesSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  </div>
);

// Chart Skeleton
export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
    <Skeleton className="h-4 w-24 mb-4" />
    <div className="h-48 flex items-center justify-center">
      <div className="w-36 h-36 rounded-full border-8 border-gray-200 dark:border-gray-700 animate-pulse" />
    </div>
  </div>
);

// Transaction Item Skeleton
export const TransactionSkeleton = () => (
  <li className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-6 w-20" />
    </div>
  </li>
);

// Transaction List Skeleton
export const TransactionListSkeleton = () => (
  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-4">
    <Skeleton className="h-4 w-20 mb-4 ml-2" />
    <ul className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <TransactionSkeleton key={i} />
      ))}
    </ul>
  </div>
);

// Full Page Loading Skeleton
export const PageSkeleton = () => (
  <div className="min-h-screen py-8 px-4">
    <div className="max-w-md mx-auto">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      
      <BalanceSkeleton />
      <IncomeExpensesSkeleton />
      <ChartSkeleton />
      
      {/* Form skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="flex-1 h-10 rounded-xl" />
          <Skeleton className="flex-1 h-10 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl mb-4" />
        <Skeleton className="h-12 w-full rounded-xl mb-5" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      
      <TransactionListSkeleton />
    </div>
  </div>
);

export default Skeleton;
