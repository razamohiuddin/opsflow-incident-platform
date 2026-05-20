export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
      {Icon && (
        <Icon className="mb-4 h-12 w-12 text-slate-400 dark:text-slate-600" strokeWidth={1.25} />
      )}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
