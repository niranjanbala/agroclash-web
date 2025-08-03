'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { SupabaseAuthService } from '@/lib/services/auth.service'
import { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<User>
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<User>
  sendOTP: (phoneNumber: string) => Promise<void>
  verifyOTP: (phoneNumber: string, otp: string) => Promise<User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = new SupabaseAuthService()

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial user:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true)
    try {
      const user = await authService.signUp(email, password, userData)
      setUser(user)
      return user
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const user = await authService.signIn(email, password)
      setUser(user)
      return user
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in')
    }

    try {
      const updatedUser = await authService.updateProfile(user.id, updates)
      setUser(updatedUser)
      return updatedUser
    } catch (error) {
      throw error
    }
  }

  const sendOTP = async (phoneNumber: string) => {
    return authService.sendOTP(phoneNumber)
  }

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    setLoading(true)
    try {
      const user = await authService.verifyOTP(phoneNumber, otp)
      setUser(user)
      return user
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    sendOTP,
    verifyOTP
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}