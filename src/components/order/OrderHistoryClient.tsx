'use client';

import { useEffect, useState } from 'react';

type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  categoryId: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  note: string;
  status: string;
  createdAt: string;
};

export default function OrderHistoryClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.msg || '加载失败');
        setOrders((json?.data ?? []) as Order[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusLabel: Record<string, string> = {
    new: '待制作',
    cooking: '制作中',
    done: '已完成',
  };

  return (
    <div className='min-h-screen bg-gray-100 text-gray-900 pb-24'>
      <header className='bg-white border-b border-gray-200 sticky top-0 z-20'>
        <div className='max-w-6xl mx-auto px-4 py-4'>
          <h1 className='text-lg font-extrabold text-gray-900'>点菜历史</h1>
          <p className='text-xs text-gray-500 mt-0.5'>查看历史点菜记录</p>
        </div>
      </header>

      <div className='max-w-6xl mx-auto px-4 py-4'>
        {loading ? (
          <div className='text-sm text-gray-500'>加载中…</div>
        ) : error ? (
          <div className='rounded-2xl bg-white p-4 shadow-sm'>
            <div className='font-bold text-gray-900'>加载失败</div>
            <div className='mt-1 text-sm text-gray-500'>{error}</div>
          </div>
        ) : orders.length === 0 ? (
          <div className='rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm'>
            暂无点菜记录
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => (
              <div
                key={order.id}
                className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
              >
                <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
                  <span className='text-xs text-gray-500'>
                    {formatDate(order.createdAt)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      order.status === 'new'
                        ? 'bg-amber-100 text-amber-700'
                        : order.status === 'cooking'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </div>
                <div className='p-4 space-y-2'>
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.menuItemId}`}
                      className='flex justify-between text-sm'
                    >
                      <span className='text-gray-800'>
                        {item.name} x{item.quantity}
                      </span>
                      <span className='text-red-600 font-bold'>
                        ¥{item.subtotal}
                      </span>
                    </div>
                  ))}
                </div>
                <div className='px-4 py-3 bg-gray-50 flex justify-between items-center'>
                  <span className='text-sm font-bold text-gray-900'>合计</span>
                  <span className='text-lg font-extrabold text-red-600'>
                    ¥{order.totalPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
