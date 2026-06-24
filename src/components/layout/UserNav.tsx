'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconBowl, IconBook, IconUser } from '@/components/ui/icons';

/** 用户端底部导航（不含管理端入口） */
const navItems = [
  { href: '/order', label: '点菜', Icon: IconBowl },
  { href: '/posts', label: '动态', Icon: IconBook },
  { href: '/me', label: '我的', Icon: IconUser },
];

export default function UserNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className='safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-surface/95 backdrop-blur'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='flex h-16 items-center justify-around'>
          {navItems.map(({ href, label, Icon }) => {
            const isActive = mounted && pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-ember' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                <Icon className='h-6 w-6' strokeWidth={isActive ? 1.9 : 1.6} />
                <span className='text-[11px] font-semibold'>{label}</span>
                {isActive && (
                  <span className='absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ember' />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
