import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiMapPin, FiMail, FiMoreVertical, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { companiesAPI } from '../services/api';
import { SkeletonLoader } from '../components/Loader';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { addNotification } from '../utils/notifications';

const INDUSTRY_COLORS = {
  'Technology':   'bg-purple-50 text-purple-600',
  'IT Services':  'bg-blue-50 text-blue-600',
  'E-Commerce':   'bg-green-50 text-green-600',
  'Finance':      'bg-yellow-50 text-yellow-600',
  'Healthcare':   'bg-red-50 text-red-600',
  'Startup':      'bg-orange-50 text-orange-600',
};

const getIndustryColor = (industry) =>
  INDUSTRY_COLORS[industry] || 'bg-gray-100 text-gray-600';

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

const getAvatarColor = (name) => {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

// 3-dot menu component
const ActionMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
        <FiMoreVertical className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <button onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <FiTrash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Company Card
const CompanyCard = ({ company, isAdmin, onEdit, onDelete, onView, index }) => {
  const domain = company.contact_email?.split('@')[1] || '';
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : '';
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Top row: avatar + name + tag + menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar / Logo */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${!logoUrl || logoFailed ? getAvatarColor(company.name) : 'bg-gray-50 border border-gray-100'}`}>
            {logoUrl && !logoFailed ? (
              <img src={logoUrl} alt={company.name} className="w-7 h-7 object-contain"
                onError={() => setLogoFailed(true)} />
            ) : (
              <span className="text-sm font-bold">{getInitials(company.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{company.name}</h3>
            {company.industry && (
              <span className={`inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${getIndustryColor(company.industry)}`}>
                {company.industry}
              </span>
            )}
          </div>
        </div>
        {isAdmin && <ActionMenu onEdit={() => onEdit(company)} onDelete={() => onDelete(company.id)} />}
      </div>

      {/* Middle: meta info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FiMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{company.location || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FiMail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{company.contact_email || '—'}</span>
        </div>
      </div>

      {/* Bottom: date + action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">
          Added {new Date(company.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        {!isAdmin && (
          <button onClick={() => onView(company)}
            className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors">
            View details →
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const Companies = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', industry: '', contact_email: '' });

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    let filtered = companies;
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterIndustry !== 'all') {
      filtered = filtered.filter(c => c.industry === filterIndustry);
    }
    setFilteredCompanies(filtered);
  }, [searchTerm, filterIndustry, companies]);

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getAll();
      setCompanies(response.data);
    } catch {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await companiesAPI.update(editingCompany.id, formData);
        toast.success('Company updated');
      } else {
        await companiesAPI.create(formData);
        addNotification('company', `New company added: ${formData.name} (${formData.industry || 'N/A'})`);
        toast.success('Company added');
      }
      fetchCompanies();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await companiesAPI.delete(id);
      toast.success('Company deleted');
      fetchCompanies();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const openModal = (company = null) => {
    setEditingCompany(company);
    setFormData(company
      ? { name: company.name || '', location: company.location || '', industry: company.industry || '', contact_email: company.contact_email || '' }
      : { name: '', location: '', industry: '', contact_email: '' }
    );
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingCompany(null); };

  const industries = ['all', ...new Set(companies.map(c => c.industry).filter(Boolean))];

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm bg-white";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-gray-400 font-medium mb-1">Home / Companies</p>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all registered companies</p>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search companies..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
          </div>

          {/* Filter */}
          <div className="relative">
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-700 cursor-pointer min-w-[160px]">
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind === 'all' ? 'All Industries' : ind}</option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          {isAdmin && (
            <motion.button onClick={() => openModal()}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <FiPlus className="w-4 h-4" /> Add Company
            </motion.button>
          )}
        </motion.div>

        {/* Results count */}
        <p className="text-xs text-gray-500 -mt-2">
          Showing <span className="font-semibold text-gray-700">{filteredCompanies.length}</span> {filteredCompanies.length === 1 ? 'company' : 'companies'}
        </p>

        {/* Grid */}
        {loading ? (
          <SkeletonLoader count={6} />
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏢</span>
            </div>
            <p className="text-gray-500 font-medium">No companies found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map((company, index) => (
              <CompanyCard
                key={company.id}
                company={company}
                isAdmin={isAdmin}
                index={index}
                onEdit={openModal}
                onDelete={handleDelete}
                onView={(c) => navigate(`/companies/${c.id}`, { state: { company: c } })}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={closeModal} />
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>

                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900">
                      {editingCompany ? 'Edit Company' : 'Add Company'}
                    </h3>
                    <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <FiX className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Modal Form */}
                  <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Company Name</label>
                      <input type="text" required value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className={inputCls} placeholder="e.g. Acme Corporation" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Industry</label>
                      <input type="text" required value={formData.industry}
                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                        className={inputCls} placeholder="e.g. Technology" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location</label>
                      <input type="text" required value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className={inputCls} placeholder="e.g. Bangalore, India" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Email</label>
                      <input type="email" value={formData.contact_email}
                        onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                        className={inputCls} placeholder="contact@company.com" />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button type="submit"
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        {editingCompany ? 'Save Changes' : 'Add Company'}
                      </motion.button>
                      <button type="button" onClick={closeModal}
                        className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
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

export default Companies;
