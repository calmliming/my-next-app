'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/local/order', label: '点菜', icon: '🌶️' },
  { href: '/local/order/history', label: '点菜记录', icon: '📋' },
  { href: '/local/admin/menu', label: '菜品管理', icon: '🧑‍🍳' },
  { href: '/local/posts', label: '文章', icon: '📚' },
  { href: '/', label: '菜单', icon: '🏠' },
];

export default function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='flex items-center justify-around h-16'>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
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
