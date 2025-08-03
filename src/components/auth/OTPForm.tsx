'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { isValidPhoneNumber } from '@/lib/utils'

interface OTPFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function OTPForm({ onSuccess, onSwitchToLogin }: OTPFormProps) {
  const { sendOTP, verifyOTP, loading } = useAuth()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const validatePhoneNumber = () => {
    const newErrors: { [key: string]: string } = {}

    if (!phoneNumber) {
      newErrors.phone = 'Phone number is required'
    } else if (!isValidPhoneNumber(phoneNumber)) {
      newErrors.phone = 'Please enter a valid phone number with country code (e.g., +1234567890)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOTP = () => {
    const newErrors: { [key: string]: string } = {}

    if (!otp) {
      newErrors.otp = 'OTP is required'
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits'
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must contain only numbers'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePhoneNumber()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await sendOTP(phoneNumber)
      setStep('otp')
      setCountdown(60) // 60 second countdown
    } catch (error) {
      setErrors({
        phone: error instanceof Error ? error.message : 'Failed to send OTP. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateOTP()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await verifyOTP(phoneNumber, otp)
      onSuccess?.()
    } catch (error) {
      setErrors({
        otp: error instanceof Error ? error.message : 'Invalid OTP. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    setIsSubmitting(true)
    setErrors({})

    try {
      await sendOTP(phoneNumber)
      setCountdown(60)
      setOtp('')
    } catch (error) {
      setErrors({
        otp: error instanceof Error ? error.message : 'Failed to resend OTP. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '')
    
    // Ensure it starts with +
    if (cleaned && !cleaned.startsWith('+')) {
      return '+' + cleaned
    }
    
    return cleaned
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }))
    }
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }))
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'phone' ? 'Phone Sign In' : 'Verify OTP'}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === 'phone' 
              ? 'Enter your phone number to receive a verification code'
              : `Enter the 6-digit code sent to ${phoneNumber}`
            }
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1234567890"
                disabled={isSubmitting || loading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Include your country code (e.g., +1 for US, +91 for India)
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOTPChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.otp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123456"
                maxLength={6}
                disabled={isSubmitting || loading}
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify & Sign In'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isSubmitting || loading}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  'Resend OTP'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setErrors({})
                }}
                className="text-sm text-gray-600 hover:text-gray-500"
                disabled={isSubmitting || loading}
              >
                ← Change phone number
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Prefer email?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-500 font-medium"
              disabled={loading}
            >
              Sign in with email
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}