import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { getUserDetail } from '../api/client'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function UserDetailPage() {
  const { id } = useParams()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    getUserDetail(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner className="h-10 w-10" /></div>
  if (error)   return <p className="p-8 text-red-600">{error}</p>

  const { user, sites, payments } = data
  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="px-8 py-8 max-w-[1000px] mx-auto space-y-6">
      {/* Back */}
      <Link to="/users" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition font-medium">
        ← Back to Users
      </Link>

      {/* Profile card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          {user.picture ? (
            <img src={user.picture} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-100" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-3xl font-bold text-indigo-600">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{user.name || '(no name)'}</h1>
              {user.isAdmin && <Badge label="Admin" variant="admin" />}
              <Badge label={user.authType === 'google' ? 'Google' : 'Email'} variant={user.authType} />
            </div>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <p className="text-slate-400 text-xs mt-1">
              Joined {format(new Date(user.createdAt), 'd MMMM yyyy')}
            </p>
          </div>
          {/* Quick stats */}
          <div className="flex gap-6 text-center">
            {[
              { label: 'Sites',    value: sites.length },
              { label: 'Live',     value: sites.filter((s) => s.status === 'live').length },
              { label: 'Credits',  value: user.publishingCredits },
              { label: 'Revenue',  value: `$${totalRevenue.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sites */}
      <Section title={`Sites (${sites.length})`}>
        {sites.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400 text-center">No sites yet.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {sites.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50 transition">
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.category} · Created {format(new Date(s.createdAt), 'd MMM yyyy')}</p>
                  {s.deploymentUrl && (
                    <a href={s.deploymentUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline break-all">
                      {s.customSubdomain ? `${s.customSubdomain}.placetopage.com` : s.deploymentUrl}
                    </a>
                  )}
                </div>
                <Badge label={s.status} variant={s.status} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Payments */}
      <Section title={`Payments (${payments.length})`}>
        {payments.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400 text-center">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Credits</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-500 text-xs">{format(new Date(p.createdAt), 'd MMM yyyy')}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{p.productType}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">${p.amount.toFixed(2)}</td>
                    <td className="px-5 py-3 text-slate-600">+{p.creditsGranted}</td>
                    <td className="px-5 py-3"><Badge label={p.status} variant={p.status} /></td>
                    <td className="px-5 py-3 text-slate-500 capitalize">{p.method || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  )
}
