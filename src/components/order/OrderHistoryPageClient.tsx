'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/Feedback';
import {
  IconBowl,
  IconChevronRight,
  IconNote,
  IconReceipt,
} from '@/components/ui/icons';
import {
  clearOrderHistory,
  loadOrderHistory,
  type SavedOrder,
} from '@/lib/orderHistory';

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(value: number) {
  return value.toFixed(2);
}

export default function OrderHistoryPageClient() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    setOrders(loadOrderHistory());
  }, []);

  const clearAll = () => {
    clearOrderHistory();
    setOrders([]);
    setConfirmClearOpen(false);
  };

  return (
    <div className='min-h-screen bg-paper pb-28 text-ink'>
      <header className='border-b border-line bg-surface/90 px-5 py-4 backdrop-blur'>
        <div className='mx-auto flex max-w-2xl items-center justify-between gap-3'>
          <div className='min-w-0'>
            <h1 className='font-display text-xl font-bold text-ink'>我的点菜记录</h1>
            <p className='mt-0.5 text-xs text-ink-soft'>本机保存最近 20 次堂食点单</p>
          </div>
          {orders.length > 0 ? (
            <button
              type='button'
              onClick={() => setConfirmClearOpen(true)}
              className='shrink-0 rounded-full border border-ember/25 bg-ember-soft px-4 py-2 text-sm font-semibold text-ember transition hover:bg-ember/10'
            >
              清空
            </button>
          ) : null}
        </div>
      </header>

      <div className='mx-auto max-w-2xl px-5 py-5'>
        {orders.length === 0 ? (
          <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong bg-surface/50 px-6 py-16 text-center'>
            <IconReceipt className='h-9 w-9 text-ink-faint' />
            <div>
              <p className='text-sm font-semibold text-ink'>还没有本机点菜记录</p>
              <p className='mt-1 text-xs text-ink-soft'>下单成功后会自动保存在这里。</p>
            </div>
            <Link
              href='/order'
              className='inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-white shadow-card transition active:scale-95'
            >
              <IconBowl className='h-4 w-4' />
              去点菜
            </Link>
          </div>
        ) : (
          <div className='space-y-3'>
            {orders.map((order) => (
              <article
                key={order.id}
                className='overflow-hidden rounded-2xl border border-line bg-surface shadow-card'
              >
                <div className='flex items-center justify-between gap-3 border-b border-line px-4 py-3'>
                  <div>
                    <div className='tnum text-xs font-semibold text-ink-soft'>
                      #{order.id.startsWith('local-') ? '本机记录' : order.id.slice(-6)}
                    </div>
                    <time className='mt-0.5 block text-xs text-ink-faint'>
                      {formatDate(order.createdAt)}
                    </time>
                  </div>
                  <div className='text-right'>
                    <div className='tnum text-lg font-bold text-ember'>
                      ¥{formatPrice(order.totalPrice)}
                    </div>
                    <div className='text-xs text-ink-faint'>{order.totalCount} 道菜</div>
                  </div>
                </div>
                <div className='divide-y divide-line px-4'>
                  {order.items.map((item, index) => (
                    <div
                      key={`${order.id}-${item.name}-${index}`}
                      className='flex items-center justify-between gap-3 py-3 text-sm'
                    >
                      <span className='min-w-0 truncate font-medium text-ink'>
                        {item.name}
                        <span className='tnum ml-1 text-ink-faint'>×{item.quantity}</span>
                      </span>
                      <span className='tnum shrink-0 font-semibold text-ink-soft'>
                        ¥{formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
                {order.note ? (
                  <div className='border-t border-line bg-paper/70 px-4 py-3'>
                    <div className='flex items-start gap-2 text-xs leading-relaxed text-ink-soft'>
                      <IconNote className='mt-0.5 h-4 w-4 shrink-0 text-gold' />
                      <span className='break-words'>{order.note}</span>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}

            <Link
              href='/order'
              className='flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line-strong px-4 py-3 text-sm font-semibold text-ink-soft transition hover:text-ink'
            >
              继续点菜
              <IconChevronRight className='h-4 w-4' />
            </Link>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title='清空点菜记录'
        description='确定清空本机保存的点菜记录吗？这不会影响后厨后台中的订单。'
        confirmText='清空'
        danger
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={clearAll}
      />
    </div>
  );
}
