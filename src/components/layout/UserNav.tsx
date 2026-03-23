'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/** 用户端底部导航（不含管理端入口） */
const navItems = [
  { href: '/order', label: '点菜', icon: '🌶️' },
  { href: '/posts', label: '文章', icon: '📚' },
  { href: '/me', label: '我的', icon: '👤' },
];

export default function UserNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='flex items-center justify-around h-16'>
          {!mounted
            ? navItems.map((item) => (
                <div
                  key={item.href}
                  className='relative flex flex-1 flex-col items-center justify-center gap-1 h-full'
                  aria-hidden
                >
                  <span className='text-xl opacity-30 select-none'>{item.icon}</span>
                  <span className='text-[10px] font-bold text-gray-300 select-none'>
                    {item.label}
                  </span>
                </div>
              ))
            : navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                      isActive
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className='text-xl'>{item.icon}</span>
                    <span className='text-xs font-bold'>{item.label}</span>
                    {isActive && (
                      <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-red-600 rounded-full' />
                    )}
                  </Link>
                );
              })}
        </div>
      </div>
    </nav>
  );
}
