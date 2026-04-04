const KEY = 'ip_notifications';

export const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

export const addNotification = (type, message) => {
  const notifications = getNotifications();
  notifications.unshift({
    id: Date.now(),
    type,   // 'internship' | 'placement' | 'company'
    message,
    time: new Date().toISOString(),
    read: false,
  });
  // keep max 50
  localStorage.setItem(KEY, JSON.stringify(notifications.slice(0, 50)));
};

export const markAllRead = () => {
  const notifications = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(KEY, JSON.stringify(notifications));
};

export const getUnreadCount = () => getNotifications().filter((n) => !n.read).length;
