export function Alert({ variant = 'error', children }) {
  const styles = {
    error:
      'border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200',
    success:
      'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200',
    info: 'border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}>{children}</div>
  );
}
