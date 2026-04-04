import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiAward, FiBriefcase, FiDownload } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { reportsAPI } from '../services/api';
import { Loader } from '../components/Loader';
import { calculatePercentage } from '../utils/helpers';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.get();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const companyRows = Object.entries(data?.company_wise_placements || {})
      .map(([name, count]) => `<tr><td>${name}</td><td>${count}</td></tr>`).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Placement Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1f2937; padding: 40px; }
          .header { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 32px 40px; border-radius: 16px; margin-bottom: 32px; }
          .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
          .header p { font-size: 14px; opacity: 0.85; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
          .stat-card { padding: 20px; border-radius: 12px; color: white; }
          .stat-card h2 { font-size: 32px; font-weight: 800; }
          .stat-card p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
          .blue  { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
          .green { background: linear-gradient(135deg, #10b981, #059669); }
          .purple{ background: linear-gradient(135deg, #8b5cf6, #ec4899); }
          .orange{ background: linear-gradient(135deg, #f59e0b, #ef4444); }
          .section { background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb; }
          .section h3 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #6366f1; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
          th:first-child { border-radius: 8px 0 0 8px; }
          th:last-child  { border-radius: 0 8px 8px 0; }
          td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
          tr:last-child td { border-bottom: none; }
          tr:nth-child(even) td { background: #f9fafb; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .summary-item { padding: 16px; background: white; border-radius: 10px; border-left: 4px solid #6366f1; }
          .summary-item.green-border { border-left-color: #10b981; }
          .summary-item.purple-border { border-left-color: #8b5cf6; }
          .summary-item h4 { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .summary-item p { font-size: 28px; font-weight: 800; color: #111827; margin-top: 4px; }
          .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #9ca3af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Internship & Placement Report</h1>
          <p>Generated on ${date} &nbsp;|&nbsp; IP Tracker — Admin Report</p>
        </div>

        <div class="stats">
          <div class="stat-card blue"><h2>${data?.total_students || 0}</h2><p>Total Students</p></div>
          <div class="stat-card green"><h2>${data?.placed_students || 0}</h2><p>Placed Students</p></div>
          <div class="stat-card purple"><h2>${placementRate}%</h2><p>Placement Rate</p></div>
          <div class="stat-card orange"><h2>${data?.internship_count || 0}</h2><p>Total Internships</p></div>
        </div>

        <div class="section">
          <h3>🏢 Company-wise Placements</h3>
          <table>
            <thead><tr><th>Company Name</th><th>Placements</th></tr></thead>
            <tbody>${companyRows || '<tr><td colspan="2">No data available</td></tr>'}</tbody>
          </table>
        </div>

        <div class="section">
          <h3>📈 Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <h4>Students Remaining</h4>
              <p>${(data?.total_students || 0) - (data?.placed_students || 0)}</p>
            </div>
            <div class="summary-item green-border">
              <h4>Success Rate</h4>
              <p style="color:#10b981">${placementRate}%</p>
            </div>
            <div class="summary-item purple-border">
              <h4>Active Companies</h4>
              <p>${companyData.length}</p>
            </div>
          </div>
        </div>

        <div class="footer">IP Tracker &copy; ${new Date().getFullYear()} &nbsp;|&nbsp; Confidential — Admin Use Only</div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  if (loading) return <Loader />;

  const placementRate = calculatePercentage(
    data?.placed_students || 0,
    data?.total_students || 1
  );

  const companyData = Object.entries(data?.company_wise_placements || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const stats = [
    {
      label: 'Total Students',
      value: data?.total_students || 0,
      icon: FiUsers,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Placed Students',
      value: data?.placed_students || 0,
      icon: FiAward,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Placement Rate',
      value: `${placementRate}%`,
      icon: FiTrendingUp,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Total Internships',
      value: data?.internship_count || 0,
      icon: FiBriefcase,
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Home / Reports</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Analytics & Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">Comprehensive placement and internship analytics</p>
          </div>
          <motion.button onClick={downloadReport}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-sm w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <FiDownload className="w-4 h-4" /> Download Report
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div key={index}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }} whileHover={{ y: -3 }}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Company Distribution</h3>
                <p className="text-xs text-gray-400 mt-0.5">Placements by company</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <FiBriefcase className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Placement Overview</h3>
                <p className="text-xs text-gray-400 mt-0.5">Students vs placed vs internships</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FiAward className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Total Students', value: data?.total_students || 0 },
                  { name: 'Placed', value: data?.placed_students || 0 },
                  { name: 'Internships', value: data?.internship_count || 0 },
                ]}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-violet-500"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <p className="text-xs text-gray-500 font-medium">Students Remaining</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{(data?.total_students || 0) - (data?.placed_students || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">Yet to be placed</p>
          </motion.div>
          <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-emerald-500"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <p className="text-xs text-gray-500 font-medium">Success Rate</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{placementRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Placement success</p>
          </motion.div>
          <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-blue-500"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <p className="text-xs text-gray-500 font-medium">Active Companies</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{companyData.length}</p>
            <p className="text-xs text-gray-400 mt-1">Hiring partners</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
