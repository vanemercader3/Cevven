import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, logout } from '../firebase'

const AuthContext = createContext()

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutos

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined)
  const timerRef = useRef(null)

  const limpiarTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const iniciarTimer = () => {
    limpiarTimer()
    timerRef.current = setTimeout(async () => {
      await logout()
    }, TIMEOUT_MS)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user)
      if (user) {
        iniciarTimer()
      } else {
        limpiarTimer()
      }
    })
    return () => {
      unsub()
      limpiarTimer()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ usuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)