import Link from 'next/link';
import { IconBowl, IconBook, IconChevronRight, IconChili } from '@/components/ui/icons';

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-paper px-5 py-16 text-ink'>
      <main className='w-full max-w-xl'>
        <div className='inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ember text-white shadow-card'>
          <IconChili className='h-7 w-7' />
        </div>
        <p className='tnum mt-8 text-sm font-bold text-ember'>404</p>
        <h1 className='font-display mt-2 text-4xl font-bold leading-tight text-ink'>
          这道菜暂时不在菜单上
        </h1>
        <p className='mt-3 max-w-md text-sm leading-relaxed text-ink-soft'>
          你访问的页面不存在，可能已经下架或地址写错了。先回到点菜页看看今天有什么热菜。
        </p>

        <div className='mt-8 grid gap-3 sm:grid-cols-2'>
          <Link
            href='/order'
            className='flex items-center justify-between rounded-2xl bg-ember px-5 py-4 font-bold text-white shadow-card transition active:scale-[0.98]'
          >
            <span className='inline-flex items-center gap-2'>
              <IconBowl className='h-5 w-5' />
              去点菜
            </span>
            <IconChevronRight className='h-4 w-4' />
          </Link>
          <Link
            href='/posts'
            className='flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 font-semibold text-ink shadow-card transition hover:bg-paper'
          >
            <span className='inline-flex items-center gap-2'>
              <IconBook className='h-5 w-5 text-gold' />
              看动态
            </span>
            <IconChevronRight className='h-4 w-4 text-ink-faint' />
          </Link>
        </div>

        <Link
          href='/'
          className='mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft transition hover:text-ink'
        >
          返回首页
          <IconChevronRight className='h-4 w-4' />
        </Link>
      </main>
    </div>
  );
}
