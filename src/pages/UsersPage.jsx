import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { getUsers } from '../api/client'
import Badge from '../components/Badge'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const LIMIT = 25

export default function UsersPage() {
  const [data, setData]       = useState(null)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [authType, setAuth]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    getUsers({ page, limit: LIMIT, search, authType })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, search, authType])

  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          {data && <p className="text-sm text-slate-500 mt-0.5">{data.total.toLocaleString()} total registered</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={handleSearch}
          className="w-72 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
        />
        <select
          value={authType}
          onChange={(e) => { setAuth(e.target.value); setPage(1) }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none"
        >
          <option value="">All auth types</option>
          <option value="google">Google</option>
          <option value="email">Email / Password</option>
        </select>
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
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">User</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Auth</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Sites</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Credits</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Registered</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img src={u.picture} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                              {(u.name?.[0] || u.email[0]).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{u.name || '—'}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                          {u.isAdmin && <Badge label="Admin" variant="admin" />}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={u.authType === 'google' ? 'Google' : 'Email'} variant={u.authType} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900">{u.sites.total}</span>
                        <span className="text-slate-400 text-xs ml-1">({u.sites.live} live)</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${u.publishingCredits > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {u.publishingCredits}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {format(new Date(u.createdAt), 'd MMM yyyy')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/users/${u.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data?.users.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No users found.</td></tr>
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
