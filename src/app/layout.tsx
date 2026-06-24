import type { Metadata, Viewport } from 'next';
import '@/app/styles/globals.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '洁洁的美食小世界 · 地道湘味',
    template: '%s · 洁洁的美食小世界',
  },
  description: '地道湘味，辣得过瘾。堂食点餐与后厨接单一体。',
  applicationName: '洁洁的美食小世界',
  openGraph: {
    title: '洁洁的美食小世界 · 地道湘味',
    description: '地道湘味，辣得过瘾。堂食点餐与后厨接单一体。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export const viewport: Viewport = {
  themeColor: '#f7f2ea',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='zh-CN'>
      <body className='antialiased'>
        <a href='#main-content' className='skip-link'>
          跳到主要内容
        </a>
        <div id='main-content'>{children}</div>
      </body>
    </html>
  );
}
