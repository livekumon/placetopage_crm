import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { getSites } from '../api/client'
import Badge from '../components/Badge'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const LIMIT = 25
const STATUSES = ['', 'live', 'draft', 'archived']

export default function SitesPage() {
  const [data, setData]       = useState(null)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    getSites({ page, limit: LIMIT, search, status })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, search, status])

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sites</h1>
          {data && <p className="text-sm text-slate-500 mt-0.5">{data.total.toLocaleString()} total sites</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by site name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-72 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
        />
        <div className="flex gap-1.5">
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
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Site</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Owner</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Category</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Created</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.sites.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{s.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        {s.user ? (
                          <Link to={`/users/${s.user.id}`} className="text-indigo-600 hover:underline text-xs font-medium">
                            {s.user.name || s.user.email}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4"><Badge label={s.status} variant={s.status} /></td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{s.category || '—'}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{format(new Date(s.createdAt), 'd MMM yyyy')}</td>
                      <td className="px-5 py-4">
                        {s.deploymentUrl ? (
                          <a
                            href={s.deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-indigo-600 hover:underline max-w-[180px] truncate"
                          >
                            {s.customSubdomain ? `${s.customSubdomain}.placetopage.com` : 'View →'}
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">Not published</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data?.sites.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No sites found.</td></tr>
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
