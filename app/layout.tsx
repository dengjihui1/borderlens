import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await headers()).get('x-borderlens-locale');
  return locale === 'en'
    ? { title: 'BorderLens | Travel document and entry-rule checker', description: 'Check document-specific entry rules and official sources, one border at a time. Not an entry permit or a guarantee.' }
    : { title: 'BorderLens｜多身份旅行证件路线图', description: '根据实际旅行证件和完整行程，逐段查询官方来源支持的入境规则。' };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await headers()).get('x-borderlens-locale');
  return (
    <html lang={locale === 'en' ? 'en' : 'zh-CN'}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
