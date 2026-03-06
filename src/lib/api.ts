import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 1. Request Interceptor (إضافة التوكن لكل طلب) ---
api.interceptors.request.use(
  (config) => {
    // نجلب التوكن من LocalStorage (أو Cookies حسب نظامك)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. Response Interceptor (التعامل مع الردود والأخطاء) ---
api.interceptors.response.use(
  (response) => {
    // إذا كان الرد ناجحاً، نرجعه كما هو
    return response;
  },
  (error) => {
    // التعامل مع أخطاء معينة مثل 401 (غير مصرح له / انتهت الجلسة)
    if (error.response && error.response.status === 401) {
      console.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً");
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token'); // مسح التوكن القديم
        window.location.href = '/login';   // تحويله لصفحة الدخول
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;