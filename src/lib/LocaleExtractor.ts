import Cookies from 'js-cookie';

const LocaleExtractor = async (isClient: boolean) => {
  if (isClient) {
    // في المتصفح: نستخدم js-cookie مباشرة
    return Cookies.get('NEXT_LOCALE') || 'ar';
  } else {
    // في السيرفر: نستخدم الديناميك إنبورت (Dynamic Import) لتجنب الخطأ
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies(); // في نكست 15 الكوكيز صارت Promise
      return cookieStore.get("NEXT_LOCALE")?.value || 'ar';
    } catch (error) {
      console.error("Error extracting locale on server:", error);
      return 'ar';
    }
  }
};

export default LocaleExtractor;