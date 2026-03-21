import Cookies from 'js-cookie';

const REFRESH_TOKEN_KEY = 'refresh-token';
const ACCESS_TOKEN_KEY = 'access-token'; // أضفناه للراحة

// جلب التوكن
function GetRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

// مسح التوكن (عند Logout)
function RemoveRefreshToken() {
  Cookies.remove(REFRESH_TOKEN_KEY);
  Cookies.remove(ACCESS_TOKEN_KEY);
}

// حفظ التوكن 
function SetRefreshToken(token: string) {
  Cookies.set(REFRESH_TOKEN_KEY, token);
}

const TokenLocalService = {
  GetRefreshToken,
  RemoveRefreshToken,
  SetRefreshToken,
};

export default TokenLocalService;