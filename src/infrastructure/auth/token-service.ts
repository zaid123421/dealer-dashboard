import Cookies from 'js-cookie';
import type { Role } from '@/shared/config/roles';

const REFRESH_TOKEN_KEY = 'refresh-token';
const ACCESS_TOKEN_KEY = 'access-token';
/** اسم الـ cookie للدور — يُستخدم في الـ middleware أيضاً */
export const USER_ROLE_KEY = 'user-role';

function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

function removeRefreshToken() {
  Cookies.remove(REFRESH_TOKEN_KEY);
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(USER_ROLE_KEY);
}

function setRefreshToken(token: string) {
  Cookies.set(REFRESH_TOKEN_KEY, token);
}

function getRole(): Role | null {
  const value = Cookies.get(USER_ROLE_KEY);
  if (value === 'admin' || value === 'supplier' || value === 'user') return value;
  return null;
}

function setRole(role: Role) {
  Cookies.set(USER_ROLE_KEY, role);
}

function removeRole() {
  Cookies.remove(USER_ROLE_KEY);
}

const TokenService = {
  getRefreshToken,
  removeRefreshToken,
  setRefreshToken,
  getRole,
  setRole,
  removeRole,
};

export default TokenService;

