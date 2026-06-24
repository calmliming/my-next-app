'use client';

import Link from 'next/link';
import {
  IconBowl,
  IconBook,
  IconChevronRight,
  IconChili,
  IconSparkle,
} from '@/components/ui/icons';

const highlights = [
  { name: '辣椒炒肉', note: '湘菜灵魂' },
  { name: '剁椒鱼头', note: '鲜辣爽口' },
  { name: '小炒黄牛肉', note: '下饭神器' },
  { name: '长沙臭豆腐', note: '外酥里嫩' },
];

const Home: React.FC = () => {
  return (
    <div className='min-h-screen bg-paper pb-28'>
      {/* Hero */}
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-b from-ember-soft/70 via-paper to-paper' />
        <div className='relative mx-auto max-w-2xl px-5 pt-12 pb-8'>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-semibold text-gold'>
            <IconChili className='h-3.5 w-3.5 text-ember' />
            地道湘味 · 辣得过瘾
          </span>
          <h1 className='font-display mt-4 text-4xl font-bold leading-tight tracking-tight text-ink'>
            洁洁的
            <br />
            美食小世界
          </h1>
          <p className='mt-3 max-w-sm text-sm leading-relaxed text-ink-soft'>
            一锅烟火气，半世湘江情。螺丝椒爆土猪肉、骨汤宽粉、炭火烧烤，
            现点现做，等你来尝。
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/order'
              className='inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-bold text-white shadow-card transition-transform active:scale-95'
            >
              <IconBowl className='h-5 w-5' />
              去点菜
            </Link>
            <Link
              href='/posts'
              className='inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-deep'
            >
              <IconBook className='h-5 w-5' />
              店家动态
            </Link>
          </div>
        </div>
      </section>

      {/* 招牌推荐 */}
      <section className='mx-auto max-w-2xl px-5'>
        <div className='mb-3 flex items-center gap-2'>
          <IconSparkle className='h-4 w-4 text-gold' />
          <h2 className='font-display text-lg font-bold text-ink'>招牌推荐</h2>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          {highlights.map((dish) => (
            <Link
              key={dish.name}
              href='/order'
              className='group flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-card transition-all active:scale-[0.98]'
            >
              <div className='min-w-0'>
                <div className='truncate font-semibold text-ink'>{dish.name}</div>
                <div className='mt-0.5 text-xs text-ink-soft'>{dish.note}</div>
              </div>
              <IconChevronRight className='h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-ember' />
            </Link>
          ))}
        </div>
      </section>

      {/* 管理入口 */}
      <section className='mx-auto mt-8 max-w-2xl px-5'>
        <Link
          href='/login'
          className='flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line-strong px-4 py-3 text-xs font-medium text-ink-faint transition-colors hover:text-ink-soft'
        >
          商家 / 后厨管理入口
          <IconChevronRight className='h-3.5 w-3.5' />
        </Link>
      </section>
    </div>
  );
};

export default Home;
