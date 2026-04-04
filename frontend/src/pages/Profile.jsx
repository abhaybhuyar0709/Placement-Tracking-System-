import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiCamera, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const fileRef = useRef();

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: reader.result });
      toast.success('Profile picture updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setSavingName(true);
    updateProfile({ name: name.trim() });
    toast.success('Name updated!');
    setSavingName(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
    setSavingPwd(true);
    try {
      await changePassword(newPwd);
      toast.success('Password changed successfully!');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-500 mt-1">Manage your account details</p>
        </motion.div>

        {/* Avatar + basic info */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : getInitials(user?.name || user?.email || 'U')
                }
              </div>
              <motion.button
                onClick={() => fileRef.current.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-md hover:bg-primary-700 transition-colors"
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              >
                <FiCamera className="w-4 h-4" />
              </motion.button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Name + email + role */}
            <div className="flex-1 space-y-1">
              <p className="text-xl font-bold text-gray-900">{user?.name || 'User'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiMail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  user?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <FiShield className="inline w-3 h-3 mr-1" />
                  {user?.role || 'student'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit name */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <motion.button
                onClick={handleSaveName}
                disabled={savingName}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-600 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                <FiCheck className="w-4 h-4" /> Save
              </motion.button>
            </div>
          </div>

          {/* Read-only fields */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-500 text-sm">
                <FiMail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-500 text-sm capitalize">
                <FiShield className="w-4 h-4 shrink-0" />
                <span>{user?.role || 'student'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <FiLock className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-500">Use a strong password of at least 6 characters</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPwd && newPwd !== confirmPwd && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={savingPwd}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              {savingPwd ? 'Updating...' : 'Update Password'}
            </motion.button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
