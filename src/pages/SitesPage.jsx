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
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Sites</h1>
          {data && (
            <p className="text-sm text-slate-500 mt-0.5">{data.total.toLocaleString()} total sites</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="search"
          placeholder="Search by site name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 sm:max-w-xs"
        />
        {/* Status pills — scrollable on very small screens */}
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5 sm:py-3.5">Site</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5 sm:py-3.5">Status</th>
                    {/* Hidden on mobile */}
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">Owner</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Category</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 lg:table-cell">Created</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.sites.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      {/* Site name */}
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <p className="font-semibold text-slate-900 max-w-[140px] truncate sm:max-w-none">{s.name}</p>
                        {/* Show owner inline on mobile */}
                        {s.user && (
                          <Link
                            to={`/users/${s.user.id}`}
                            className="mt-0.5 block text-xs text-indigo-600 hover:underline truncate sm:hidden"
                          >
                            {s.user.name || s.user.email}
                          </Link>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <Badge label={s.status} variant={s.status} />
                      </td>
                      {/* Owner — hidden on mobile */}
                      <td className="hidden px-5 py-4 sm:table-cell">
                        {s.user ? (
                          <Link to={`/users/${s.user.id}`} className="text-indigo-600 hover:underline text-xs font-medium">
                            {s.user.name || s.user.email}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      {/* Category */}
                      <td className="hidden px-5 py-4 text-slate-500 text-xs md:table-cell">{s.category || '—'}</td>
                      {/* Created */}
                      <td className="hidden px-5 py-4 text-slate-400 text-xs lg:table-cell">
                        {format(new Date(s.createdAt), 'd MMM yyyy')}
                      </td>
                      {/* URL */}
                      <td className="hidden px-5 py-4 md:table-cell">
                        {s.deploymentUrl ? (
                          <a
                            href={s.deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-indigo-600 hover:underline max-w-[160px] truncate"
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
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">No sites found.</td>
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
