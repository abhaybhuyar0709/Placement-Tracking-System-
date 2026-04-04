import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiAward, FiX } from 'react-icons/fi';
import { Table } from '../components/Table';
import { placementsAPI, studentsAPI, companiesAPI } from '../services/api';
import { TableSkeleton } from '../components/Loader';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { addNotification } from '../utils/notifications';

export const Placements = () => {
  const { isAdmin } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ student_id: '', company_id: '', role: '', package: '', status: 'confirmed' });

  useEffect(() => { fetchPlacements(); }, []);

  const fetchPlacements = async () => {
    try {
      const [placRes, stuRes, comRes] = await Promise.all([
        placementsAPI.getAll(),
        studentsAPI.getAll(),
        companiesAPI.getAll(),
      ]);
      setPlacements(placRes.data || []);
      setStudents(stuRes.data || []);
      setCompanies(comRes.data || []);
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      toast.error('Failed to fetch placements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.company_id) {
      toast.error('Please select a student and company');
      return;
    }
    try {
      const payload = {
        ...formData,
        package: formData.package ? Number(formData.package) : null,
      };
      await placementsAPI.create(payload);
      const student = students.find(s => s.id === formData.student_id);
      const company = companies.find(c => c.id === formData.company_id);
      addNotification('placement', `New placement: ${student?.name || 'Student'} placed at ${company?.name || 'Company'} as ${formData.role}`);
      toast.success('Placement added successfully');
      setShowModal(false);
      setFormData({ student_id: '', company_id: '', role: '', package: '', status: 'confirmed' });
      fetchPlacements();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add placement');
    }
  };

  const columns = [
    {
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
            {row.students?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.students?.name || 'Unknown'}</p>
            <p className="text-sm text-gray-500">{row.students?.branch}</p>
          </div>
        </div>
      ),
    },
    {
      label: 'Company',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.companies?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-500">{row.companies?.industry}</p>
        </div>
      ),
    },
    {
      label: 'Role',
      key: 'role',
    },
    {
      label: 'Package',
      render: (row) => (
        <span className="font-semibold text-green-600">{formatCurrency(row.package)}</span>
      ),
    },
    {
      label: 'Status',
      key: 'status',
    },
  ];

  const avgPackage = placements.length
    ? (
        placements.reduce((sum, p) => sum + parseFloat(p.package || 0), 0) / placements.length
      ).toFixed(0)
    : 0;

  const stats = [
    {
      label: 'Total Placements',
      value: placements.length,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Confirmed',
      value: placements.filter((p) => p.status === 'confirmed').length,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Average Package',
      value: formatCurrency(avgPackage),
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
        <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Home / Placements</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Placements</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage student placement records</p>
          </div>
          {isAdmin && (
            <motion.button onClick={() => setShowModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <FiPlus className="w-4 h-4" /> Add Placement
            </motion.button>
          )}
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div key={index}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }} whileHover={{ y: -3 }}>
              <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
              <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.gradient} opacity-60`} />
            </motion.div>
          ))}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <Table columns={columns} data={placements} emptyMessage="No placements found" />
        )}

        {/* Add Placement Modal */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)} />
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                  <div className="bg-violet-600 p-5 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-lg font-bold text-white">Add Placement</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <FiX className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Student</label>
                      <select required value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm">
                        <option value="">Select student</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                      <select required value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm">
                        <option value="">Select company</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                        <input type="text" required placeholder="Software Engineer" value={formData.role}
                          onChange={e => setFormData({...formData, role: e.target.value})}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Package (₹)</label>
                        <input type="number" placeholder="1200000" value={formData.package}
                          onChange={e => setFormData({...formData, package: e.target.value})}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm">
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <motion.button type="submit"
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-semibold text-sm"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Add Placement</motion.button>
                      <motion.button type="button" onClick={() => setShowModal(false)}
                        className="px-5 py-2.5 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 text-sm"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Cancel</motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Placements;
