import { motion } from 'framer-motion';
import { getStatusColor } from '../utils/helpers';

export const Table = ({ columns, data, onRowClick, emptyMessage = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-sm p-12 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-gray-400 text-6xl mb-4">📭</div>
        <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, rowIndex) => (
              <motion.tr
                key={row.id || rowIndex}
                className={`hover:bg-violet-50/20 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick && onRowClick(row)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.03 }}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    {column.render ? (
                      column.render(row)
                    ) : column.key === 'status' ? (
                      <StatusBadge status={row[column.key]} />
                    ) : (
                      <span className="text-sm text-gray-700">{row[column.key] || '—'}</span>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-sm text-gray-400">-</span>;

  return (
    <motion.span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
        status
      )}`}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </motion.span>
  );
};

export const ActionButton = ({ onClick, icon: Icon, label, color = 'primary', variant = 'icon' }) => {
  const colorClasses = {
    primary: 'text-primary-600 hover:text-primary-700 hover:bg-primary-50',
    accent: 'text-accent-600 hover:text-accent-700 hover:bg-accent-50',
    success: 'text-green-600 hover:text-green-700 hover:bg-green-50',
    danger: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    warning: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50',
  };

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`p-2 rounded-lg transition-colors ${colorClasses[color]}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={label}
      >
        <Icon className="w-4 h-4" />
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colorClasses[color]}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </motion.button>
  );
};

export default Table;
