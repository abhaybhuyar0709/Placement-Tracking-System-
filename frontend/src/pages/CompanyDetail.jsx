import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiMail, FiBriefcase, FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { companiesAPI } from '../services/api';
import { Loader } from '../components/Loader';
import { getRandomColor, getInitials } from '../utils/helpers';

const CompanyDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [company, setCompany] = useState(state?.company || null);
  const [loading, setLoading] = useState(!state?.company);

  useEffect(() => {
    if (!company) {
      companiesAPI.getById(id)
        .then((res) => setCompany(res.data))
        .catch(() => navigate('/companies'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Loader />;
  if (!company) return null;

  const domain = company.contact_email?.split('@')[1] || '';
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back button */}
        <motion.button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium transition-colors"
          whileHover={{ x: -3 }}
        >
          <FiArrowLeft className="w-5 h-5" />
          Back to Companies
        </motion.button>

        {/* Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header banner */}
          <div className={`h-36 bg-gradient-to-br ${getRandomColor()} relative`}>
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Logo overlapping */}
          <div className="relative px-8">
            <div className="absolute -top-10 left-8 w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={company.name}
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                className="text-2xl font-bold text-gray-700 w-full h-full items-center justify-center"
                style={{ display: logoUrl ? 'none' : 'flex' }}
              >
                {getInitials(company.name)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-14">
            <div className="flex items-start justify-between gap-3 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              {company.industry && (
                <span className="shrink-0 bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {company.industry}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
                  <FiMapPin className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Location</p>
                  <p className="text-gray-800 font-medium">{company.location || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FiMail className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Contact Email</p>
                  <p className="text-gray-800 font-medium">{company.contact_email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FiBriefcase className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Industry</p>
                  <p className="text-gray-800 font-medium">{company.industry || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  <FiCalendar className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Added On</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(company.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyDetail;
