import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiUsers, FiBriefcase, FiBookmark,
  FiAward, FiBarChart2, FiX, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/dashboard',   label: 'Dashboard',   icon: FiHome,      roles: ['admin', 'student'] },
  { path: '/students',    label: 'Students',     icon: FiUsers,     roles: ['admin'] },
  { path: '/companies',   label: 'Companies',    icon: FiBriefcase, roles: ['admin', 'student'] },
  { path: '/internships', label: 'Internships',  icon: FiBookmark,  roles: ['admin', 'student'] },
  { path: '/placements',  label: 'Placements',   icon: FiAward,     roles: ['admin', 'student'] },
  { path: '/reports',     label: 'Reports',      icon: FiBarChart2, roles: ['admin'] },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role || 'student')
  );

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';
  const xPos = isDesktop ? 0 : (isOpen ? 0 : '-100%');

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 shadow-xl z-50
          transition-all duration-300 ease-in-out ${sidebarWidth}`}
        initial={false}
        animate={{ x: xPos }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
      >
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-5 border-b border-gray-100`}>
            {/* Logo — always visible */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md shrink-0">
                <span className="text-white font-black text-xs">CH</span>
              </div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <h2 className="font-extrabold text-gray-900 text-sm tracking-tight whitespace-nowrap">CampusHire</h2>
                    <p className="text-[10px] text-gray-400">v1.0.0</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collapse toggle — desktop only */}
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
            </motion.button>

            {/* Mobile close */}
            <motion.button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Nav label */}
          {!collapsed && (
            <p className="px-5 pt-5 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Main Menu
            </p>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
            {filteredNavItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              >
                {({ isActive }) => (
                  <motion.div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                      ${isActive
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                        : 'text-gray-600 hover:bg-violet-50 hover:text-violet-700'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: collapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.97 }}
                    title={collapsed ? item.label : ''}
                  >
                    {/* Active left bar */}
                    {isActive && !collapsed && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/60 rounded-r-full"
                        layoutId="activeBar"
                      />
                    )}

                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-violet-600'}`} />

                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          className="font-medium text-sm"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {isActive && !collapsed && (
                      <motion.div
                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      />
                    )}
                  </motion.div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <motion.div
              className="p-4 border-t border-gray-100"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3 border border-violet-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
                    <FiAward className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {user?.role === 'admin' ? 'Admin Panel' : 'Student Portal'}
                    </p>
                    <p className="text-[10px] text-gray-500">Powered by CampusHire</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Spacer for desktop only */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${sidebarWidth}`} />
    </>
  );
};

export default Sidebar;
