'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          onRemove(notification.id)
        }, notification.duration)
        
        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onRemove])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success': 
        return 'from-green-400 to-green-600 border-green-300'
      case 'error': 
        return 'from-red-400 to-red-600 border-red-300'
      case 'warning': 
        return 'from-yellow-400 to-orange-500 border-yellow-300'
      case 'info': 
        return 'from-blue-400 to-blue-600 border-blue-300'
      default: 
        return 'from-gray-400 to-gray-600 border-gray-300'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="group relative animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* 🌟 Halo effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${getNotificationStyle(notification.type)} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity`}></div>
          
          {/* 📋 Notification card */}
          <div className={`relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border-2 ${getNotificationStyle(notification.type)} transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-start space-x-3">
              {/* 🎯 Icon */}
              <div className="text-2xl animate-pulse-slow">
                {getNotificationIcon(notification.type)}
              </div>
              
              {/* 📝 Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm">
                  {notification.title}
                </h3>
                <p className="text-gray-700 text-sm mt-1">
                  {notification.message}
                </p>
              </div>
              
              {/* ❌ Close button */}
              <button
                onClick={() => onRemove(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 📊 Progress bar */}
            {notification.duration && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-2xl overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getNotificationStyle(notification.type)} animate-progress`}
                  style={{ 
                    animation: `progress ${notification.duration}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Hook para usar el sistema de notificaciones
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Efecto de sonido (opcional)
    try {
      const audio = new Audio(`data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARAA=`)
      audio.volume = 0.1
      audio.play().catch(() => {}) // Ignorar errores de autoplay
    } catch (e) {}
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showSuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message })
  }

  const showError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message })
  }

  const showInfo = (title: string, message: string) => {
    addNotification({ type: 'info', title, message })
  }

  const showWarning = (title: string, message: string) => {
    addNotification({ type: 'warning', title, message })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    NotificationComponent: () => (
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification}
      />
    )
  }
}