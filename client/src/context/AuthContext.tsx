"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  role: string
  name?: string
  email?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (savedToken && savedUser && savedUser.trim().charAt(0) === '{') {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch (error) {
        setUser(null)
        setToken(null)
      }
    } else {
      setUser(null)
      setToken(null)
    }
    setLoading(false)
  }, [])
  const setAuth = (user: User, token: string) => {
    setUser(user)
    setToken(token)
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
  }
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }
  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
