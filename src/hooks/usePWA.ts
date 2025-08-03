import { useState, useEffect, useCallback } from 'react'

interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWACapabilities {
  isInstallable: boolean
  isInstalled: boolean
  isStandalone: boolean
  supportsNotifications: boolean
  supportsPush: boolean
  supportsBackgroundSync: boolean
  supportsPeriodicSync: boolean
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check if running as PWA
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      
      setIsStandalone(isStandaloneMode)
      setIsInstalled(isStandaloneMode)
    }

    checkStandalone()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as any)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Service Worker registration and updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('SW registration failed:', error)
        })

      // Listen for SW messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true)
        }
      })
    }
  }, [])

  const installApp = useCallback(async () => {
    if (!installPrompt) return false

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Install failed:', error)
      return false
    }
  }, [installPrompt])

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [])

  const getCapabilities = useCallback((): PWACapabilities => {
    return {
      isInstallable: !!installPrompt,
      isInstalled,
      isStandalone,
      supportsNotifications: 'Notification' in window,
      supportsPush: 'PushManager' in window,
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      supportsPeriodicSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype
    }
  }, [installPrompt, isInstalled, isStandalone])

  return {
    installPrompt: !!installPrompt,
    isInstalled,
    isStandalone,
    updateAvailable,
    isOnline,
    installApp,
    updateApp,
    capabilities: getCapabilities()
  }
}

// Hook for push notifications
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const subscribe = useCallback(async (vapidPublicKey: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported')
    }

    const registration = await navigator.serviceWorker.ready
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    })

    setSubscription(subscription)
    return subscription
  }, [])

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe()
      setSubscription(null)
    }
  }, [subscription])

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    isSupported: 'Notification' in window && 'PushManager' in window
  }
}

// Hook for background sync
export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(
      'serviceWorker' in navigator && 
      'sync' in window.ServiceWorkerRegistration.prototype
    )
  }, [])

  const registerSync = useCallback(async (tag: string) => {
    if (!isSupported) {
      throw new Error('Background sync not supported')
    }

    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(tag)
  }, [isSupported])

  return {
    isSupported,
    registerSync
  }
}

// Hook for app shortcuts
export function useAppShortcuts() {
  const [shortcuts, setShortcuts] = useState<any[]>([])

  useEffect(() => {
    // Load shortcuts from manifest
    fetch('/manifest.json')
      .then(response => response.json())
      .then(manifest => {
        if (manifest.shortcuts) {
          setShortcuts(manifest.shortcuts)
        }
      })
      .catch(console.error)
  }, [])

  const navigateToShortcut = useCallback((shortcutUrl: string) => {
    window.location.href = shortcutUrl
  }, [])

  return {
    shortcuts,
    navigateToShortcut
  }
}

// Hook for share functionality
export function useWebShare() {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('share' in navigator)
  }, [])

  const share = useCallback(async (data: ShareData) => {
    if (!isSupported) {
      // Fallback to clipboard or other sharing methods
      if (navigator.clipboard && data.url) {
        await navigator.clipboard.writeText(data.url)
        return { shared: false, copied: true }
      }
      throw new Error('Sharing not supported')
    }

    try {
      await navigator.share(data)
      return { shared: true, copied: false }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { shared: false, copied: false }
      }
      throw error
    }
  }, [isSupported])

  return {
    isSupported,
    share
  }
}

// Hook for file system access
export function useFileSystemAccess() {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('showOpenFilePicker' in window)
  }, [])

  const openFile = useCallback(async (options?: any) => {
    if (!isSupported) {
      throw new Error('File System Access API not supported')
    }

    const [fileHandle] = await (window as any).showOpenFilePicker(options)
    const file = await fileHandle.getFile()
    return { fileHandle, file }
  }, [isSupported])

  const saveFile = useCallback(async (data: string, filename: string) => {
    if (!isSupported) {
      // Fallback to download
      const blob = new Blob([data], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description: 'Text files',
        accept: { 'text/plain': ['.txt'] }
      }]
    })

    const writable = await fileHandle.createWritable()
    await writable.write(data)
    await writable.close()
  }, [isSupported])

  return {
    isSupported,
    openFile,
    saveFile
  }
}

// Hook for device capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    hasCamera: false,
    hasGeolocation: false,
    hasAccelerometer: false,
    hasGyroscope: false,
    hasBattery: false,
    hasVibration: false
  })

  useEffect(() => {
    const checkCapabilities = async () => {
      const newCapabilities = {
        hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        hasGeolocation: 'geolocation' in navigator,
        hasAccelerometer: 'DeviceMotionEvent' in window,
        hasGyroscope: 'DeviceOrientationEvent' in window,
        hasBattery: 'getBattery' in navigator,
        hasVibration: 'vibrate' in navigator
      }

      setCapabilities(newCapabilities)
    }

    checkCapabilities()
  }, [])

  return capabilities
}