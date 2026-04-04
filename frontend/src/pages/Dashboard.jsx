import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiBriefcase, FiBookmark, FiAward,
  FiCalendar, FiTrendingUp, FiTrendingDown,
} from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { dashboardAPI } from '../services/api';
import { Loader } from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatDate } from '../utils/helpers';

const COLORS = ['#7c3aed', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

// Dummy sparkline data for each stat card
const sparkData = {
  students:    [{ v: 80 }, { v: 95 }, { v: 88 }, { v: 110 }, { v: 105 }, { v: 120 }],
  companies:   [{ v: 20 }, { v: 28 }, { v: 25 }, { v: 35 }, { v: 30 }, { v: 40 }],
  internships: [{ v: 10 }, { v: 18 }, { v: 15 }, { v: 22 }, { v: 20 }, { v: 28 }],
  placements:  [{ v: 30 }, { v: 45 }, { v: 40 }, { v: 60 }, { v: 55 }, { v: 75 }],
};

const StatCard = ({ title, value, icon: Icon, gradient, trend, trendUp, sparkKey, delay }) => (
  <motion.div
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden relative"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -3 }}
  >
    {/* Background glow */}
    <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {trendUp ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
          {trend}
        </span>
      </div>

      <p className="text-3xl font-extrabold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{title}</p>

      {/* Sparkline */}
      <div className="mt-3 -mx-1">
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={sparkData[sparkKey]}>
            <defs>
              <linearGradient id={`spark-${sparkKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2}
              fill={`url(#spark-${sparkKey})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </motion.div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.get();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const stats = [
    { title: 'Total Students',     value: data?.stats?.total_students ?? 0, icon: FiUsers,     gradient: 'from-violet-500 to-purple-600', trend: '+12%', trendUp: true,  sparkKey: 'students' },
    { title: 'Companies',          value: data?.total_companies ?? 0,        icon: FiBriefcase, gradient: 'from-pink-500 to-rose-600',     trend: '+8%',  trendUp: true,  sparkKey: 'companies' },
    { title: 'Active Internships', value: data?.ongoing_internships ?? 0,    icon: FiBookmark,  gradient: 'from-amber-500 to-orange-600',  trend: '-3%',  trendUp: false, sparkKey: 'internships' },
    { title: 'Placements',         value: data?.total_placements ?? 0,       icon: FiAward,     gradient: 'from-emerald-500 to-teal-600',  trend: '+15%', trendUp: true,  sparkKey: 'placements' },
  ];

  const placementData = data?.recent_placements?.map(p => ({
    name: p.students?.name?.split(' ')[0] || 'Unknown',
    package: p.package ? parseInt(p.package) / 100000 : 0,
  })) || [];

  const companyData = data?.recent_placements?.reduce((acc, p) => {
    const company = p.companies?.name || 'Unknown';
    const existing = acc.find(item => item.name === company);
    if (existing) existing.value += 1;
    else acc.push({ name: company, value: 1 });
    return acc;
  }, []) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-7">

        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Live Dashboard</span>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} delay={i * 0.08} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">

          {/* Bar Chart — spans 2 cols */}
          <motion.div
            className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Placement Packages</h3>
                <p className="text-xs text-gray-400 mt-0.5">Recent placement salary overview (LPA)</p>
              </div>
              <span className="text-xs bg-violet-50 text-violet-700 font-semibold px-3 py-1 rounded-full border border-violet-100">
                This Year
              </span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={placementData} barSize={32}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false}
                  label={{ value: 'LPA', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 }}
                  formatter={(v) => [`₹${v} LPA`, 'Package']}
                />
                <Bar dataKey="package" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          >
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900">Company Split</h3>
              <p className="text-xs text-gray-400 mt-0.5">Placements by company</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={companyData} cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  dataKey="value" animationBegin={0} animationDuration={800}
                  labelLine={false}
                >
                  {companyData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-3 space-y-1.5">
              {companyData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 truncate max-w-[100px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Placements Table */}
        {data?.recent_placements?.length > 0 && (
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Latest Placements</h3>
                <p className="text-xs text-gray-400 mt-0.5">Most recent placement records</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-100">
                {data.recent_placements.length} records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/70">
                    {['Student', 'Company', 'Role', 'Package', 'Date'].map(h => (
                      <th key={h} className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recent_placements.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      className="hover:bg-violet-50/30 transition-colors"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }}
                    >
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {p.students?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{p.students?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{p.students?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{p.companies?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{p.companies?.industry || ''}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <span className="text-sm text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                          {p.role || '—'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(p.package)}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-xs text-gray-400 whitespace-nowrap">{formatDate(p.created_at)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
