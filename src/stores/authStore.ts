import Cookies from 'js-cookie'
import { create } from 'zustand'

const ACCESS_TOKEN = 'shadcn'

interface AuthUser {
  accountNo?: string
  email: string
  role?: string[]
  exp?: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = Cookies.get(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  const userInfo = Cookies.get('user_info')
  const initUser = userInfo ? JSON.parse(userInfo) : null
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) Cookies.set('user_info', JSON.stringify(user), { expires: 7 })
          else Cookies.remove('user_info')
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken), { expires: 7 }) // 设置7天过期时间
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

// export const useAuth = () => useAuthStore((state) => state.auth)
