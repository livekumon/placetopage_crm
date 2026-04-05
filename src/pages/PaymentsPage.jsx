import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { getPayments } from '../api/client'
import Badge from '../components/Badge'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const LIMIT = 25
const STATUSES = ['', 'completed', 'created', 'approved', 'failed', 'refunded']

export default function PaymentsPage() {
  const [data, setData]       = useState(null)
  const [page, setPage]       = useState(1)
  const [status, setStatus]   = useState('completed')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    getPayments({ page, limit: LIMIT, status })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, status])

  const totalRevenue = data?.payments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + p.amount, 0) || 0

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Payments</h1>
          {data && (
            <p className="text-sm text-slate-500 mt-0.5">
              {data.total.toLocaleString()} transactions
              {status === 'completed' && ` · $${totalRevenue.toFixed(2)} on this page`}
            </p>
          )}
        </div>
      </div>

      {/* Status filter — scrollable on mobile */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition ${
              status === s
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Spinner /></div>
        ) : error ? (
          <p className="p-6 text-red-600">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5 sm:py-3.5">Date</th>
                    {/* Amount always visible */}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5 sm:py-3.5">Amount</th>
                    {/* Status always visible */}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5 sm:py-3.5">Status</th>
                    {/* Hidden columns */}
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">User</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Product</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Credits</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 lg:table-cell">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      {/* Date */}
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <span className="text-slate-400 text-xs whitespace-nowrap">
                          {format(new Date(p.createdAt), 'd MMM yy')}
                        </span>
                        {/* Show user inline on mobile */}
                        {p.user && (
                          <Link
                            to={`/users/${p.userId}`}
                            className="mt-0.5 block text-xs text-indigo-600 hover:underline truncate max-w-[110px] sm:hidden"
                          >
                            {p.user.name || p.user.email}
                          </Link>
                        )}
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <span className="font-bold text-slate-900 whitespace-nowrap">${p.amount.toFixed(2)}</span>
                        <span className="ml-1 text-[10px] text-slate-400">{p.currency}</span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <Badge label={p.status} variant={p.status} />
                      </td>
                      {/* User — hidden on mobile */}
                      <td className="hidden px-5 py-4 sm:table-cell">
                        {p.user ? (
                          <Link to={`/users/${p.userId}`} className="text-indigo-600 hover:underline text-xs font-medium">
                            {p.user.name || p.user.email}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">{p.payerEmail || '—'}</span>
                        )}
                      </td>
                      {/* Product */}
                      <td className="hidden px-5 py-4 font-medium text-slate-800 text-xs md:table-cell">{p.productType}</td>
                      {/* Credits */}
                      <td className="hidden px-5 py-4 text-slate-500 md:table-cell">+{p.creditsGranted}</td>
                      {/* Method */}
                      <td className="hidden px-5 py-4 text-slate-500 text-xs capitalize lg:table-cell">{p.method || '—'}</td>
                    </tr>
                  ))}
                  {data?.payments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400">No payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={data?.pages || 1} total={data?.total || 0} limit={LIMIT} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
