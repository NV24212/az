import Cookies from 'js-cookie'

const TOKEN_KEY = 'azhar_admin_token'

export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true })
}

export function clearToken() {
  Cookies.remove(TOKEN_KEY)
}
