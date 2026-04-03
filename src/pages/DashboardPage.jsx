import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { getMetrics, getGrowthChart } from '../api/client'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'

const DAYS_OPTIONS = [7, 14, 30, 60, 90]

function fmtUsd(v) { return `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null)
  const [chart, setChart]     = useState(null)
  const [days, setDays]       = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getMetrics(), getGrowthChart(days)])
      .then(([m, c]) => { setMetrics(m); setChart(c) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  )
  if (error) return (
    <div className="p-8 text-red-600 font-medium">{error}</div>
  )

  const chartData = (chart?.days || []).map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'd MMM'),
  }))

  const { users, sites, purchases, logins } = metrics

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview as of {format(new Date(), 'd MMM yyyy, HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Range:</span>
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                days === d
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={users.total.toLocaleString()}
          sub={`+${users.registeredLast7Days} this week`}
          color="indigo"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <StatCard
          label="New Users (30d)"
          value={users.registeredLast30Days.toLocaleString()}
          sub={`${users.registeredLast7Days} in last 7 days`}
          color="sky"
          icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
        <StatCard
          label="Live Sites"
          value={sites.live.toLocaleString()}
          sub={`${sites.total} total · ${sites.draft} drafts`}
          color="emerald"
          icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
        />
        <StatCard
          label="Total Revenue"
          value={fmtUsd(purchases.completedRevenueUsd)}
          sub={`${purchases.completedCount} completed payments`}
          color="amber"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      {/* Secondary KPI row */}
      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Total Logins" value={logins.totalEvents.toLocaleString()} color="violet"
          icon="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        <StatCard label="Archived Sites" value={sites.archived.toLocaleString()} color="amber"
          icon="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        <StatCard label="Sites (7d)" value={sites.createdLast7Days.toLocaleString()} sub="new sites this week" color="sky"
          icon="M12 4v16m8-8H4" />
        <StatCard label="Revenue / User" value={users.total ? fmtUsd(purchases.completedRevenueUsd / users.total) : '$0'} sub="avg per registered user" color="rose"
          icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User & Site growth */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-bold text-slate-700 uppercase tracking-wider">User & Site Growth</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSites" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="users" name="New Users" stroke="#6366f1" fill="url(#gUsers)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="sites" name="New Sites" stroke="#10b981" fill="url(#gSites)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-bold text-slate-700 uppercase tracking-wider">Daily Revenue (USD)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}
                formatter={(v) => [`$${v}`, 'Revenue']}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { to: '/users',    label: 'View all users',    sub: `${users.total} registered`, icon: '👥' },
          { to: '/sites',    label: 'View all sites',    sub: `${sites.total} total`,       icon: '🌐' },
          { to: '/payments', label: 'View all payments', sub: `${purchases.completedCount} completed`, icon: '💳' },
        ].map(({ to, label, sub, icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition group"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition">{label}</p>
              <p className="text-sm text-slate-400">{sub}</p>
            </div>
            <svg className="ml-auto h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
