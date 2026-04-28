import { useEffect, useState } from 'react'
import api from '../../shared/api'

export type CurrentUser = {
  ID: number
  empresaId?: number
  NOMBRE: string
  APELLIDO?: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get<CurrentUser & Record<string, unknown>>('/auth/me')
        if (!cancelled && data?.ID) {
          setUser({
            ID: data.ID,
            empresaId: typeof data.empresaId === 'number' ? data.empresaId : 1,
            NOMBRE: data.NOMBRE,
            APELLIDO: data.APELLIDO,
          })
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const displayName = user
    ? `${user.NOMBRE}${user.APELLIDO ? ` ${user.APELLIDO}` : ''}`.trim()
    : ''

  return {
    user,
    loading,
    empresaId: user?.empresaId ?? 1,
    userId: user?.ID ?? null,
    displayName,
  }
}
