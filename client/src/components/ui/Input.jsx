const fieldClass =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500';

const dateFieldClass =
  'pr-10 [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2.5 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70';

export function Input({ label, error, className = '', type, ...props }) {
  const isDate = type === 'date' || type === 'datetime-local';
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      )}
      <input
        type={type}
        className={`${fieldClass} ${isDate ? `relative ${dateFieldClass}` : ''} ${error ? 'border-red-400 dark:border-red-500/60' : 'border-slate-300 dark:border-slate-600'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}

export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      )}
      <textarea
        rows={rows}
        className={`${fieldClass} resize-y ${error ? 'border-red-400 dark:border-red-500/60' : 'border-slate-300 dark:border-slate-600'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}

export function SearchInput({ label = 'Search', error, className = '', icon: Icon, ...props }) {
  const IconComponent = Icon;
  return (
    <label className={`block space-y-1.5 ${className}`}>
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      )}
      <div className="relative">
        {IconComponent && (
          <IconComponent
            className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            aria-hidden
          />
        )}
        <input
          type="search"
          className={`${fieldClass} ${IconComponent ? 'pl-10' : ''} ${error ? 'border-red-400 dark:border-red-500/60' : 'border-slate-300 dark:border-slate-600'}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      )}
      <select
        className={`${fieldClass} ${error ? 'border-red-400 dark:border-red-500/60' : 'border-slate-300 dark:border-slate-600'} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
