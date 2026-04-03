const variants = {
  live:      'bg-emerald-100 text-emerald-700',
  draft:     'bg-slate-100   text-slate-600',
  archived:  'bg-amber-100   text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed:    'bg-rose-100    text-rose-700',
  created:   'bg-sky-100     text-sky-700',
  approved:  'bg-indigo-100  text-indigo-700',
  refunded:  'bg-orange-100  text-orange-700',
  google:    'bg-blue-100    text-blue-700',
  email:     'bg-slate-100   text-slate-600',
  admin:     'bg-violet-100  text-violet-700',
}

export default function Badge({ label, variant }) {
  const cls = variants[variant] || variants.draft
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
