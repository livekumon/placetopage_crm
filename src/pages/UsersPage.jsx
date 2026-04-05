import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { getUsers } from '../api/client'
import Badge from '../components/Badge'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import AddCreditsModal from '../components/AddCreditsModal'

const LIMIT = 25

export default function UsersPage() {
  const [data, setData]               = useState(null)
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [authType, setAuth]           = useState('')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [creditsUser, setCreditsUser] = useState(null)

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

  function handleCreditsClose(updatedCredits) {
    if (updatedCredits !== undefined && creditsUser) {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === creditsUser.id ? { ...u, publishingCredits: updatedCredits } : u
        ),
      }))
    }
    setCreditsUser(null)
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Users</h1>
          {data && (
            <p className="text-sm text-slate-500 mt-0.5">{data.total.toLocaleString()} total registered</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={handleSearch}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 sm:max-w-xs"
        />
        <select
          value={authType}
          onChange={(e) => { setAuth(e.target.value); setPage(1) }}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none sm:w-auto"
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
          <p className="p-6 text-red-600">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5 sm:py-3.5">User</th>
                    {/* Hidden on mobile */}
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">Auth</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Sites</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5 sm:py-3.5">Credits</th>
                    <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 lg:table-cell">Registered</th>
                    <th className="px-4 py-3 sm:px-5 sm:py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {/* User cell */}
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img src={u.picture} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 sm:h-9 sm:w-9" />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 sm:h-9 sm:w-9">
                              {(u.name?.[0] || u.email[0]).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 max-w-[120px] sm:max-w-none">
                              {u.name || '—'}
                            </p>
                            <p className="truncate text-xs text-slate-400 max-w-[120px] sm:max-w-none">{u.email}</p>
                            {/* Show auth badge inline on mobile */}
                            <div className="mt-0.5 sm:hidden">
                              <Badge label={u.authType === 'google' ? 'Google' : 'Email'} variant={u.authType} />
                            </div>
                          </div>
                          {u.isAdmin && (
                            <span className="hidden sm:inline-flex">
                              <Badge label="Admin" variant="admin" />
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Auth — hidden on mobile */}
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <Badge label={u.authType === 'google' ? 'Google' : 'Email'} variant={u.authType} />
                      </td>
                      {/* Sites — hidden on small screens */}
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="font-semibold text-slate-900">{u.sites.total}</span>
                        <span className="text-slate-400 text-xs ml-1">({u.sites.live} live)</span>
                      </td>
                      {/* Credits */}
                      <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className={`font-semibold tabular-nums ${u.publishingCredits > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {u.publishingCredits}
                          </span>
                          <button
                            onClick={() => setCreditsUser(u)}
                            title="Manage credits"
                            className="rounded-lg px-1.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition whitespace-nowrap"
                          >
                            + Credits
                          </button>
                        </div>
                      </td>
                      {/* Registered — hidden on small screens */}
                      <td className="hidden px-5 py-4 text-slate-500 text-xs lg:table-cell">
                        {format(new Date(u.createdAt), 'd MMM yyyy')}
                      </td>
                      {/* View link */}
                      <td className="px-4 py-3.5 text-right sm:px-5 sm:py-4">
                        <Link
                          to={`/users/${u.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data?.users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={data?.pages || 1} total={data?.total || 0} limit={LIMIT} onPage={setPage} />
          </>
        )}
      </div>

      {creditsUser && (
        <AddCreditsModal user={creditsUser} onClose={handleCreditsClose} />
      )}
    </div>
  )
}
