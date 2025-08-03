'use client'

import React, { forwardRef, useRef, useEffect } from 'react'
import { useAccessibility, useKeyboardNavigation, useARIA, useFocusManagement } from '@/hooks/useAccessibility'
import { useI18n } from '@/hooks/useI18n'

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, icon, children, className = '', ...props }, ref) => {
    const { preferences } = useAccessibility()
    const { t } = useI18n()

    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variantClasses = {
      primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    const motionClasses = preferences.reduceMotion ? '' : 'transform hover:scale-105'
    const contrastClasses = preferences.highContrast ? 'ring-2 ring-current' : ''

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${motionClasses} ${contrastClasses} ${className}`}
        disabled={loading || props.disabled}
        aria-label={loading ? t('common.loading') : props['aria-label']}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// Accessible Modal Component
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function AccessibleModal({ isOpen, onClose, title, children, size = 'md', className = '' }: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const { trapFocus } = useKeyboardNavigation()
  const { saveFocus, restoreFocus, focusFirst } = useFocusManagement()
  const { generateId } = useARIA()
  const { t } = useI18n()

  const titleId = generateId('modal-title')
  const descriptionId = generateId('modal-description')

  useEffect(() => {
    if (isOpen) {
      saveFocus()
      if (modalRef.current) {
        focusFirst(modalRef.current)
      }
      const cleanup = trapFocus(modalRef)
      
      return () => {
        cleanup()
        restoreFocus()
      }
    }
  }, [isOpen, saveFocus, restoreFocus, focusFirst, trapFocus])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id={titleId} className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full p-1"
              aria-label={t('common.close')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div id={descriptionId} className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Accessible Form Input Component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
  required?: boolean
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, helpText, required, className = '', ...props }, ref) => {
    const { generateId } = useARIA()
    const { preferences } = useAccessibility()
    
    const inputId = props.id || generateId('input')
    const errorId = generateId('error')
    const helpId = generateId('help')

    const inputClasses = `
      block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
      ${error 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
      }
      ${preferences.highContrast ? 'ring-2 ring-current' : ''}
      ${className}
    `

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
          aria-required={required}
          {...props}
        />
        
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        
        {helpText && (
          <p id={helpId} className="text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

// Accessible Select Component
interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  error?: string
  helpText?: string
  required?: boolean
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ label, options, error, helpText, required, className = '', ...props }, ref) => {
    const { generateId } = useARIA()
    const { t } = useI18n()
    
    const selectId = props.id || generateId('select')
    const errorId = generateId('error')
    const helpId = generateId('help')

    const selectClasses = `
      block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
      ${error 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
      }
      ${className}
    `

    return (
      <div className="space-y-1">
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
          aria-required={required}
          {...props}
        >
          <option value="">{t('common.selectOption')}</option>
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        
        {helpText && (
          <p id={helpId} className="text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

AccessibleSelect.displayName = 'AccessibleSelect'

// Skip Link Component
export function SkipLink() {
  const { t } = useI18n()
  
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded-md z-50"
    >
      {t('accessibility.skipToMain')}
    </a>
  )
}

// Accessible Tabs Component
interface Tab {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

interface AccessibleTabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

export function AccessibleTabs({ tabs, defaultTab, onChange, className = '' }: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id)
  const { generateId } = useARIA()
  const tabsId = generateId('tabs')

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string, index: number) => {
    let newIndex = index

    switch (e.key) {
      case 'ArrowLeft':
        newIndex = index > 0 ? index - 1 : tabs.length - 1
        break
      case 'ArrowRight':
        newIndex = index < tabs.length - 1 ? index + 1 : 0
        break
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = tabs.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    const newTab = tabs[newIndex]
    if (!newTab.disabled) {
      handleTabChange(newTab.id)
      // Focus the new tab
      const tabElement = document.getElementById(`tab-${newTab.id}`)
      tabElement?.focus()
    }
  }

  return (
    <div className={className}>
      {/* Tab List */}
      <div role="tablist" aria-labelledby={tabsId} className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              disabled={tab.disabled}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      {tabs.map(tab => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="py-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}

// Accessible Alert Component
interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function AccessibleAlert({ 
  type, 
  title, 
  children, 
  dismissible = false, 
  onDismiss, 
  className = '' 
}: AccessibleAlertProps) {
  const { t } = useI18n()

  const typeConfig = {
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400'
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400'
    }
  }

  const config = typeConfig[type]

  return (
    <div
      role="alert"
      className={`rounded-md border p-4 ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={`text-lg ${config.iconColor}`} aria-hidden="true">
            {config.icon}
          </span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              {title}
            </h3>
          )}
          <div className={`${title ? 'mt-2' : ''} text-sm ${config.textColor}`}>
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${config.textColor} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent`}
              aria-label={t('common.dismiss')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}