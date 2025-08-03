'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLanguageSelector, useI18n } from '@/hooks/useI18n'
import { useKeyboardNavigation, useFocusManagement } from '@/hooks/useAccessibility'

interface LanguageSelectorProps {
  className?: string
  variant?: 'dropdown' | 'modal' | 'inline'
  showFlags?: boolean
}

export function LanguageSelector({ 
  className = '', 
  variant = 'dropdown',
  showFlags = true 
}: LanguageSelectorProps) {
  const {
    currentLanguage,
    supportedLanguages,
    isOpen,
    setIsOpen,
    handleLanguageSelect
  } = useLanguageSelector()
  
  const { isRTL } = useI18n()
  const { trapFocus } = useKeyboardNavigation()
  const { focusFirst } = useFocusManagement()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage)

  // Flag emojis for languages
  const flagEmojis: Record<string, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    hi: '🇮🇳',
    ar: '🇸🇦',
    zh: '🇨🇳'
  }

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      focusFirst(dropdownRef.current)
      const cleanup = trapFocus(dropdownRef)
      return cleanup
    }
  }, [isOpen, focusFirst, trapFocus])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, setIsOpen])

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {supportedLanguages.map(language => (
          <button
            key={language.code}
            onClick={() => handleLanguageSelect(language.code as any)}
            className={`px-3 py-1 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              currentLanguage === language.code
                ? 'bg-green-100 text-green-800 font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={currentLanguage === language.code}
          >
            {showFlags && flagEmojis[language.code] && (
              <span className="mr-2" aria-hidden="true">
                {flagEmojis[language.code]}
              </span>
            )}
            {language.nativeName}
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${className}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          {showFlags && flagEmojis[currentLanguage] && (
            <span className={`${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true">
              {flagEmojis[currentLanguage]}
            </span>
          )}
          {currentLang?.nativeName}
          <svg 
            className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
              
              <div
                ref={dropdownRef}
                className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
              >
                <h2 id="language-modal-title" className="text-lg font-semibold text-gray-900 mb-4">
                  Select Language
                </h2>
                
                <div className="space-y-2">
                  {supportedLanguages.map(language => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language.code as any)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        currentLanguage === language.code
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {showFlags && flagEmojis[language.code] && (
                        <span className={`${isRTL ? 'ml-3' : 'mr-3'}`} aria-hidden="true">
                          {flagEmojis[language.code]}
                        </span>
                      )}
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="font-medium">{language.nativeName}</div>
                        <div className="text-xs text-gray-500">{language.name}</div>
                      </div>
                      {currentLanguage === language.code && (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="language-selector-label"
      >
        <span id="language-selector-label" className="sr-only">
          Select language
        </span>
        {showFlags && flagEmojis[currentLanguage] && (
          <span className={`${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true">
            {flagEmojis[currentLanguage]}
          </span>
        )}
        {currentLang?.nativeName}
        <svg 
          className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-10 mt-1 w-56 bg-white border border-gray-300 rounded-md shadow-lg ${
            isRTL ? 'left-0' : 'right-0'
          }`}
          role="listbox"
          aria-labelledby="language-selector-label"
        >
          <div className="py-1">
            {supportedLanguages.map(language => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code as any)}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset ${
                  currentLanguage === language.code
                    ? 'bg-green-100 text-green-800 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="option"
                aria-selected={currentLanguage === language.code}
              >
                {showFlags && flagEmojis[language.code] && (
                  <span className={`${isRTL ? 'ml-3' : 'mr-3'}`} aria-hidden="true">
                    {flagEmojis[language.code]}
                  </span>
                )}
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-gray-500">{language.name}</div>
                </div>
                {currentLanguage === language.code && (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact language switcher for mobile
export function CompactLanguageSelector({ className = '' }: { className?: string }) {
  const { currentLanguage, supportedLanguages, handleLanguageSelect } = useLanguageSelector()
  
  const flagEmojis: Record<string, string> = {
    en: '🇺🇸',
    es: '🇪🇸', 
    fr: '🇫🇷',
    hi: '🇮🇳',
    ar: '🇸🇦',
    zh: '🇨🇳'
  }

  return (
    <select
      value={currentLanguage}
      onChange={(e) => handleLanguageSelect(e.target.value as any)}
      className={`text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
      aria-label="Select language"
    >
      {supportedLanguages.map(language => (
        <option key={language.code} value={language.code}>
          {flagEmojis[language.code] ? `${flagEmojis[language.code]} ` : ''}{language.nativeName}
        </option>
      ))}
    </select>
  )
}

// RTL direction toggle
export function DirectionToggle({ className = '' }: { className?: string }) {
  const { isRTL, currentLanguage } = useI18n()
  
  if (!isRTL) return null

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600">Text Direction:</span>
      <button
        onClick={() => {
          document.documentElement.dir = document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl'
        }}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
      >
        {document.documentElement.dir === 'rtl' ? 'RTL' : 'LTR'}
      </button>
    </div>
  )
}