'use client'

import { useEffect } from 'react'

export default function CapacitorBridge() {
  useEffect(() => {
    // Only run if running inside Capacitor native container
    async function initCapacitor() {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return

        // 1. Configure Status Bar
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar')
          await StatusBar.setStyle({ style: Style.Dark })
          await StatusBar.setBackgroundColor({ color: '#0b0f19' })
        } catch (e) {
          console.warn('StatusBar plugin not available:', e)
        }

        // 2. Configure Android Back Button
        try {
          const { App } = await import('@capacitor/app')
          App.addListener('backButton', ({ canGoBack }) => {
            if (window.history.length > 1 && canGoBack) {
              window.history.back()
            } else {
              App.minimizeApp()
            }
          })
        } catch (e) {
          console.warn('App backButton listener not available:', e)
        }

        // 3. Register for Push Notifications (if permission granted or requested)
        try {
          const { PushNotifications } = await import('@capacitor/push-notifications')
          const permStatus = await PushNotifications.checkPermissions()
          if (permStatus.receive === 'prompt') {
            await PushNotifications.requestPermissions()
          }
          if (permStatus.receive === 'granted') {
            await PushNotifications.register()
          }
        } catch (e) {
          console.warn('PushNotifications plugin not configured yet:', e)
        }
      } catch (err) {
        console.error('Failed to initialize Capacitor bridge:', err)
      }
    }

    initCapacitor()
  }, [])

  return null
}
