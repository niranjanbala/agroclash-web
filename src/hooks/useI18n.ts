import { useState, useEffect, useCallback } from 'react'
import { i18n, SupportedLanguage, Language } from '@/lib/i18n'

export function useI18n() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(i18n.getCurrentLanguage())
  const [isRTL, setIsRTL] = useState(i18n.isRTL())

  useEffect(() => {
    const unsubscribe = i18n.onLanguageChange((language) => {
      setCurrentLanguage(language)
      setIsRTL(i18n.isRTL())
    })

    return unsubscribe
  }, [])

  const changeLanguage = useCallback(async (languageCode: SupportedLanguage) => {
    try {
      await i18n.setLanguage(languageCode)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return i18n.translate(key, params)
  }, [currentLanguage]) // Re-run when language changes

  const pluralize = useCallback((key: string, count: number, params?: Record<string, string | number>) => {
    return i18n.pluralize(key, count, params)
  }, [currentLanguage])

  const formatNumber = useCallback((number: number) => {
    return i18n.formatNumber(number)
  }, [currentLanguage])

  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => {
    return i18n.formatDate(date, options)
  }, [currentLanguage])

  const formatCurrency = useCallback((amount: number, currency?: string) => {
    return i18n.formatCurrency(amount, currency)
  }, [currentLanguage])

  return {
    currentLanguage,
    isRTL,
    supportedLanguages: i18n.getSupportedLanguages(),
    changeLanguage,
    t,
    pluralize,
    formatNumber,
    formatDate,
    formatCurrency
  }
}

// Hook for language selection
export function useLanguageSelector() {
  const { currentLanguage, supportedLanguages, changeLanguage } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = useCallback(async (languageCode: SupportedLanguage) => {
    await changeLanguage(languageCode)
    setIsOpen(false)
  }, [changeLanguage])

  return {
    currentLanguage,
    supportedLanguages,
    isOpen,
    setIsOpen,
    handleLanguageSelect
  }
}

// Hook for RTL layout support
export function useRTL() {
  const { isRTL } = useI18n()

  const getDirectionClass = useCallback((baseClass: string = '') => {
    return `${baseClass} ${isRTL ? 'rtl' : 'ltr'}`
  }, [isRTL])

  const getTextAlign = useCallback(() => {
    return isRTL ? 'text-right' : 'text-left'
  }, [isRTL])

  const getMarginClass = useCallback((side: 'left' | 'right', size: string = '4') => {
    const actualSide = isRTL ? (side === 'left' ? 'right' : 'left') : side
    return `m${actualSide[0]}-${size}`
  }, [isRTL])

  const getPaddingClass = useCallback((side: 'left' | 'right', size: string = '4') => {
    const actualSide = isRTL ? (side === 'left' ? 'right' : 'left') : side
    return `p${actualSide[0]}-${size}`
  }, [isRTL])

  return {
    isRTL,
    getDirectionClass,
    getTextAlign,
    getMarginClass,
    getPaddingClass
  }
}

// Hook for number and date formatting
export function useFormatting() {
  const { formatNumber, formatDate, formatCurrency } = useI18n()

  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return formatDate(date, { month: 'short', day: 'numeric' })
  }, [formatDate])

  const formatFileSize = useCallback((bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = bytes / Math.pow(1024, i)
    
    return `${formatNumber(Math.round(size * 100) / 100)} ${sizes[i]}`
  }, [formatNumber])

  const formatPercentage = useCallback((value: number, decimals: number = 1) => {
    return `${formatNumber(Math.round(value * Math.pow(10, decimals + 2)) / Math.pow(10, decimals))}%`
  }, [formatNumber])

  return {
    formatNumber,
    formatDate,
    formatCurrency,
    formatRelativeTime,
    formatFileSize,
    formatPercentage
  }
}