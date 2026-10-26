import Link from './local-link';
import { localePath, type Locale } from '@/lib/locale';

export function LanguageSwitch({ locale, path, query = '' }: { locale: Locale; path: string; query?: string }) {
  return <nav className="language-switch" aria-label={locale === 'en' ? 'Language' : '语言'}>
    <Link href={localePath('zh', path, query)} hrefLang="zh-CN" lang="zh-CN" aria-current={locale === 'zh' ? 'page' : undefined}>中文</Link>
    <span aria-hidden="true">/</span>
    <Link href={localePath('en', path, query)} hrefLang="en" lang="en" aria-current={locale === 'en' ? 'page' : undefined}>EN</Link>
  </nav>;
}
