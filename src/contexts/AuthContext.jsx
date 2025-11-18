import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSupabase } from './SupabaseContext'
import { getUserProfile, createUserProfile } from '../lib/db'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const { supabase } = useSupabase()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始用户状态
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      // 确保 user_profiles 中存在对应记录，避免 posts 外键约束失败
      try {
        if (user) {
          const { data: profileData, error: profileError } = await getUserProfile(user.id)
          if (!profileData) {
            await createUserProfile({ id: user.id, email: user.email })
          }
        }
      } catch (err) {
        console.error('确保用户资料失败：', err)
      }
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null
        setUser(u)
        setLoading(false)
        // 登录/登出时也尝试确保 profile 存在
        try {
          if (u) {
            const { data: profileData } = await getUserProfile(u.id)
            if (!profileData) {
              await createUserProfile({ id: u.id, email: u.email })
            }
          }
        } catch (err) {
          console.error('确保用户资料失败：', err)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}