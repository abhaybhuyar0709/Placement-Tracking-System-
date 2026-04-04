import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiUser, FiLogOut, FiBell, FiBookmark, FiAward, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '../utils/helpers';
import { getNotifications, markAllRead, getUnreadCount } from '../utils/notifications';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  // Refresh notifications every 5 seconds for students
  useEffect(() => {
    if (isAdmin) return;
    const refresh = () => {
      setNotifications(getNotifications());
      setUnread(getUnreadCount());
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setShowDropdown(false);
    if (!showNotifications) {
      markAllRead();
      setUnread(0);
    }
  };

  const typeIcon = (type) => {
    if (type === 'internship') return <FiBookmark className="w-4 h-4 text-orange-500" />;
    if (type === 'placement') return <FiAward className="w-4 h-4 text-green-500" />;
    return <FiBriefcase className="w-4 h-4 text-purple-500" />;
  };

  const timeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onMenuClick}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              <FiMenu className="w-6 h-6 text-gray-600" />
            </motion.button>

            <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  CampusHire
                </h1>
              </div>
            </motion.div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">

            {/* Notification bell — students only */}
            {!isAdmin && (
              <div className="relative">
                <motion.button
                  onClick={handleBellClick}
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  <FiBell className="w-5 h-5 text-gray-600" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </motion.button>

                {/* Notification panel */}
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                      <motion.div
                        className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      >
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          <span className="text-xs text-gray-400">{notifications.length} total</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-10 text-center text-gray-400 text-sm">
                              <FiBell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className={`px-4 py-3 border-b border-gray-50 flex items-start gap-3 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                  {typeIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.time)}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {user?.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : getInitials(user?.name || user?.email || 'U')
                  }
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'student'}</p>
                </div>
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                      </div>

                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                      >
                        <FiUser className="w-4 h-4" />
                        My Profile
                      </button>

                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => { logout(); setShowDropdown(false); }}
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
