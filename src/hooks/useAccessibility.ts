import { useState, useEffect, useCallback, useRef } from 'react'

interface AccessibilityPreferences {
  reduceMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  focusVisible: boolean
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: false,
    focusVisible: true
  })

  useEffect(() => {
    // Detect system preferences
    const detectPreferences = () => {
      const newPreferences: AccessibilityPreferences = {
        reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        largeText: window.matchMedia('(prefers-reduced-data: reduce)').matches,
        screenReader: detectScreenReader(),
        keyboardNavigation: false, // Will be detected on first tab
        focusVisible: true
      }

      setPreferences(prev => ({ ...prev, ...newPreferences }))
    }

    if (typeof window !== 'undefined') {
      detectPreferences()

      // Listen for changes
      const mediaQueries = [
        window.matchMedia('(prefers-reduced-motion: reduce)'),
        window.matchMedia('(prefers-contrast: high)'),
        window.matchMedia('(prefers-reduced-data: reduce)')
      ]

      mediaQueries.forEach(mq => {
        mq.addEventListener('change', detectPreferences)
      })

      return () => {
        mediaQueries.forEach(mq => {
          mq.removeEventListener('change', detectPreferences)
        })
      }
    }
  }, [])

  const detectScreenReader = useCallback(() => {
    // Basic screen reader detection
    return !!(
      navigator.userAgent.match(/NVDA|JAWS|VoiceOver|TalkBack|Dragon/i) ||
      window.speechSynthesis ||
      (window as any).speechSynthesis
    )
  }, [])

  const updatePreference = useCallback((key: keyof AccessibilityPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('accessibility_preferences') || '{}')
      saved[key] = value
      localStorage.setItem('accessibility_preferences', JSON.stringify(saved))
    }
  }, [])

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('accessibility_preferences') || '{}')
      setPreferences(prev => ({ ...prev, ...saved }))
    }
  }, [])

  return {
    preferences,
    updatePreference,
    detectScreenReader
  }
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    const handleFocus = (e: FocusEvent) => {
      setFocusedElement(e.target as HTMLElement)
    }

    const handleBlur = () => {
      setFocusedElement(null)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
    }
  }, [])

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return

      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isKeyboardUser,
    focusedElement,
    trapFocus
  }
}

// Hook for screen reader announcements
export function useScreenReader() {
  const announcementRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority)
      announcementRef.current.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])

  const AnnouncementRegion = useCallback(() => (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  ), [])

  return {
    announce,
    AnnouncementRegion
  }
}

// Hook for focus management
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [])

  const focusFirst = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    if (firstElement) {
      firstElement.focus()
    }
  }, [])

  return {
    saveFocus,
    restoreFocus,
    focusFirst
  }
}

// Hook for ARIA attributes
export function useARIA() {
  const generateId = useCallback((prefix: string = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const getARIAProps = useCallback((
    type: 'button' | 'dialog' | 'menu' | 'listbox' | 'tab' | 'tabpanel',
    options: {
      expanded?: boolean
      selected?: boolean
      disabled?: boolean
      describedBy?: string
      labelledBy?: string
      label?: string
      level?: number
      setSize?: number
      posInSet?: number
    } = {}
  ) => {
    const baseProps: Record<string, any> = {
      role: type
    }

    if (options.expanded !== undefined) baseProps['aria-expanded'] = options.expanded
    if (options.selected !== undefined) baseProps['aria-selected'] = options.selected
    if (options.disabled !== undefined) baseProps['aria-disabled'] = options.disabled
    if (options.describedBy) baseProps['aria-describedby'] = options.describedBy
    if (options.labelledBy) baseProps['aria-labelledby'] = options.labelledBy
    if (options.label) baseProps['aria-label'] = options.label
    if (options.level) baseProps['aria-level'] = options.level
    if (options.setSize) baseProps['aria-setsize'] = options.setSize
    if (options.posInSet) baseProps['aria-posinset'] = options.posInSet

    return baseProps
  }, [])

  return {
    generateId,
    getARIAProps
  }
}

// Hook for color contrast checking
export function useColorContrast() {
  const checkContrast = useCallback((foreground: string, background: string) => {
    // Simple contrast ratio calculation
    const getLuminance = (color: string) => {
      const rgb = parseInt(color.replace('#', ''), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

    return {
      ratio,
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
      aaLarge: ratio >= 3
    }
  }, [])

  return { checkContrast }
}

// Hook for text scaling
export function useTextScaling() {
  const [textScale, setTextScale] = useState(1)

  useEffect(() => {
    const saved = localStorage.getItem('text_scale')
    if (saved) {
      setTextScale(parseFloat(saved))
    }
  }, [])

  const updateTextScale = useCallback((scale: number) => {
    setTextScale(scale)
    localStorage.setItem('text_scale', scale.toString())
    document.documentElement.style.fontSize = `${scale * 16}px`
  }, [])

  const getScaledSize = useCallback((baseSize: number) => {
    return baseSize * textScale
  }, [textScale])

  return {
    textScale,
    updateTextScale,
    getScaledSize
  }
}