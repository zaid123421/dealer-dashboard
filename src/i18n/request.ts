import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const LOCALE_COOKIE = 'NEXT_LOCALE';
type Locale = 'ar' | 'en';

function isValidLocale(value: string | undefined): value is Locale {
  return value === 'ar' || value === 'en';
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isValidLocale(localeCookie) ? localeCookie : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});