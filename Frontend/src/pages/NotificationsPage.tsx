import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { Notification } from '../types';

const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead } = useSocket();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.isRead
  );

  const getNotificationIcon = (type: string) => {
    const icons = {
      match_start: '⚽',
      deadline: '⏰',
      result: '🏆',
      contest: '🎯',
      payment: '💰',
      general: '📢'
    };
    return icons[type as keyof typeof icons] || '📢';
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
            className="input-field w-auto"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card cursor-pointer transition-all hover:shadow-md ${
              !notification.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50' : ''
            }`}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  <span className="text-sm text-gray-500">{getTimeAgo(notification.createdAt)}</span>
                </div>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                {!notification.isRead && (
                  <div className="mt-2">
                    <span className="inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="text-gray-600">
            {filter === 'unread' 
              ? 'You have no unread notifications.' 
              : 'Notifications will appear here when you have activity.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;