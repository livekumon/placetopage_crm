import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { getUserDetail } from '../api/client'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import AddCreditsModal from '../components/AddCreditsModal'

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function UserDetailPage() {
  const { id } = useParams()
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [showCredits, setShowCredits] = useState(false)

  useEffect(() => {
    getUserDetail(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function handleCreditsClose(updatedCredits) {
    if (updatedCredits !== undefined) {
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, publishingCredits: updatedCredits },
      }))
    }
    setShowCredits(false)
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner className="h-10 w-10" /></div>
  if (error)   return <p className="p-6 text-red-600">{error}</p>

  const { user, sites, payments } = data
  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1000px] mx-auto space-y-5">

      {/* Back */}
      <Link to="/users" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition font-medium">
        ← Back to Users
      </Link>

      {/* Profile card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start gap-4 sm:gap-5">
          {/* Avatar */}
          {user.picture ? (
            <img src={user.picture} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100 sm:h-20 sm:w-20" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600 sm:h-20 sm:w-20 sm:text-3xl">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
          )}

          {/* Name / email */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{user.name || '(no name)'}</h1>
              {user.isAdmin && <Badge label="Admin" variant="admin" />}
              <Badge label={user.authType === 'google' ? 'Google' : 'Email'} variant={user.authType} />
            </div>
            <p className="text-slate-500 text-sm break-all">{user.email}</p>
            <p className="text-slate-400 text-xs mt-1">
              Joined {format(new Date(user.createdAt), 'd MMMM yyyy')}
            </p>
          </div>

          {/* Quick stats — 2×2 grid on mobile, row on desktop */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:items-start sm:gap-6 text-center w-full sm:w-auto">
            {[
              { label: 'Sites',   value: sites.length },
              { label: 'Live',    value: sites.filter((s) => s.status === 'live').length },
              { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xl font-bold text-slate-900 sm:text-2xl">{value}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
              </div>
            ))}
            {/* Credits with manage button */}
            <div className="flex flex-col items-center gap-1.5">
              <p className={`text-xl font-bold sm:text-2xl ${user.publishingCredits > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {user.publishingCredits ?? 0}
              </p>
              <p className="text-xs text-slate-400 font-medium">Credits</p>
              <button
                onClick={() => setShowCredits(true)}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition whitespace-nowrap"
              >
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sites */}
      <Section title={`Sites (${sites.length})`}>
        {sites.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No sites yet.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {sites.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50 transition sm:px-6 sm:py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {s.category} · Created {format(new Date(s.createdAt), 'd MMM yyyy')}
                  </p>
                  {s.deploymentUrl && (
                    <a
                      href={s.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline break-all line-clamp-1"
                    >
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

      {showCredits && (
        <AddCreditsModal user={user} onClose={handleCreditsClose} />
      )}

      {/* Payments */}
      <Section title={`Payments (${payments.length})`}>
        {payments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Status</th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">Product</th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Credits</th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap sm:px-5">
                      {format(new Date(p.createdAt), 'd MMM yy')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap sm:px-5">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <Badge label={p.status} variant={p.status} />
                    </td>
                    <td className="hidden px-5 py-3 font-medium text-slate-800 sm:table-cell">{p.productType}</td>
                    <td className="hidden px-5 py-3 text-slate-600 md:table-cell">+{p.creditsGranted}</td>
                    <td className="hidden px-5 py-3 text-slate-500 capitalize md:table-cell">{p.method || '—'}</td>
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
