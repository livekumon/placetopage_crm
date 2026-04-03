export default function StatCard({ label, value, sub, icon, color = 'indigo', trend }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50  text-amber-600',
    rose:    'bg-rose-50   text-rose-600',
    sky:     'bg-sky-50    text-sky-600',
    violet:  'bg-violet-50 text-violet-600',
  }
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value ?? '—'}</p>
          {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
          {trend != null && (
            <p className={`mt-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} vs last week
            </p>
          )}
        </div>
        {icon && (
          <div className={`rounded-xl p-3 ${colors[color] || colors.indigo}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
