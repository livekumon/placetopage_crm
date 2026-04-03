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
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          {data && (
            <p className="text-sm text-slate-500 mt-0.5">
              {data.total.toLocaleString()} transactions
              {status === 'completed' && ` · $${totalRevenue.toFixed(2)} on this page`}
            </p>
          )}
        </div>
      </div>

      {/* Status filter */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold capitalize transition ${
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
          <p className="p-8 text-red-600">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">User</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Product</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Amount</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Credits</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Method</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {format(new Date(p.createdAt), 'd MMM yyyy, HH:mm')}
                      </td>
                      <td className="px-5 py-4">
                        {p.user ? (
                          <Link to={`/users/${p.userId}`} className="text-indigo-600 hover:underline text-xs font-medium">
                            {p.user.name || p.user.email}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">{p.payerEmail || '—'}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800 text-xs">{p.productType}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">${p.amount.toFixed(2)}</span>
                        <span className="ml-1 text-[10px] text-slate-400">{p.currency}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">+{p.creditsGranted}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs capitalize">{p.method || '—'}</td>
                      <td className="px-5 py-4"><Badge label={p.status} variant={p.status} /></td>
                    </tr>
                  ))}
                  {data?.payments.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">No payments found.</td></tr>
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
