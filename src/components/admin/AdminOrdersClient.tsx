'use client';

import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconReceipt } from '@/components/ui/icons';
import {
  ConfirmDialog,
  InlineNotice,
  type NoticeTone,
} from '@/components/ui/Feedback';

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
  updatedAt: string | null;
};

const statusMeta: Record<string, { label: string; cls: string }> = {
  new: { label: '待制作', cls: 'bg-ember-soft text-ember' },
  cooking: { label: '制作中', cls: 'bg-gold-soft text-gold' },
  done: { label: '已上菜', cls: 'bg-leaf-soft text-leaf' },
};

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [notice, setNotice] = useState<{ message: string; tone: NoticeTone }>({
    message: '',
    tone: 'info',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', { cache: 'no-store', credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '加载失败');
      setOrders((json?.data ?? []) as Order[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 统计：待处理订单数 / 今日营业额
  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status !== 'done').length;
    const revenue = orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
    return { pending, revenue, total: orders.length };
  }, [orders]);

  const patchStatus = async (id: string, status: 'new' | 'cooking' | 'done') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '更新失败');
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status,
                updatedAt:
                  typeof json?.data?.updatedAt === 'string' ? json.data.updatedAt : o.updatedAt,
              }
            : o
        )
      );
      setNotice({ message: '订单状态已更新', tone: 'success' });
    } catch (e) {
      setNotice({
        message: e instanceof Error ? e.message : '更新失败',
        tone: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || '删除失败');
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setNotice({ message: `订单 #${deleteTarget.id.slice(-6)} 已删除`, tone: 'success' });
      setDeleteTarget(null);
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : '删除失败',
        tone: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='min-h-screen bg-paper pb-24 text-ink'>
      <header className='sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4'>
          <div className='min-w-0'>
            <h1 className='font-display text-xl font-bold'>点菜记录</h1>
            <p className='text-xs text-ink-soft'>后厨接单、上菜与删单</p>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <Link
              href='/admin/menu'
              className='rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-paper'
            >
              菜品管理
            </Link>
            <Link
              href='/admin/posts'
              className='rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-paper'
            >
              店家动态
            </Link>
            <button
              type='button'
              onClick={() => load()}
              className='rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-opacity hover:opacity-90'
            >
              刷新
            </button>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-6xl px-4 py-5'>
        {/* 概览统计 */}
        {!loading && !error && orders.length > 0 && (
          <div className='mb-5 grid grid-cols-3 gap-3'>
            <div className='rounded-2xl border border-line bg-surface p-4 shadow-card'>
              <div className='text-xs text-ink-soft'>待处理</div>
              <div className='tnum mt-1 text-2xl font-bold text-ember'>{stats.pending}</div>
            </div>
            <div className='rounded-2xl border border-line bg-surface p-4 shadow-card'>
              <div className='text-xs text-ink-soft'>订单总数</div>
              <div className='tnum mt-1 text-2xl font-bold text-ink'>{stats.total}</div>
            </div>
            <div className='rounded-2xl border border-line bg-surface p-4 shadow-card'>
              <div className='text-xs text-ink-soft'>累计营业额</div>
              <div className='tnum mt-1 text-2xl font-bold text-gold'>
                ¥{stats.revenue.toFixed(0)}
              </div>
            </div>
          </div>
        )}

        {notice.message ? (
          <div className='mb-4'>
            <InlineNotice
              message={notice.message}
              tone={notice.tone}
              onDismiss={() => setNotice({ message: '', tone: 'info' })}
            />
          </div>
        ) : null}

        {loading ? (
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='rounded-2xl bg-surface p-5 shadow-card'>
                <div className='h-4 w-1/4 animate-pulse rounded bg-paper-deep' />
                <div className='mt-3 h-3 w-full animate-pulse rounded bg-paper-deep' />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='rounded-2xl bg-surface p-5 shadow-card'>
            <div className='font-bold'>加载失败</div>
            <div className='mt-1 text-sm text-ink-soft'>{error}</div>
          </div>
        ) : orders.length === 0 ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface/50 py-16 text-center'>
            <IconReceipt className='h-8 w-8 text-ink-faint' />
            <p className='text-sm text-ink-soft'>暂无点菜记录</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => {
              const meta = statusMeta[order.status] ?? {
                label: order.status,
                cls: 'bg-paper-deep text-ink-soft',
              };
              return (
                <div
                  key={order.id}
                  className='overflow-hidden rounded-2xl border border-line bg-surface shadow-card'
                >
                  <div className='flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3'>
                    <span className='tnum text-xs text-ink-soft'>
                      #{order.id.slice(-6)} · {formatDate(order.createdAt)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className='space-y-2 p-4'>
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.menuItemId}`}
                        className='flex justify-between text-sm'
                      >
                        <span className='text-ink'>
                          {item.name}
                          <span className='tnum ml-1 text-ink-faint'>×{item.quantity}</span>
                        </span>
                        <span className='tnum font-semibold text-ink-soft'>¥{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                  <div className='flex flex-col gap-3 bg-paper px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-sm font-semibold text-ink'>合计</span>
                      <span className='tnum text-xl font-bold text-ember'>¥{order.totalPrice}</span>
                    </div>
                    <div className='flex flex-wrap items-center justify-end gap-2'>
                      {order.status === 'new' && (
                        <button
                          type='button'
                          disabled={updatingId === order.id}
                          onClick={() => patchStatus(order.id, 'cooking')}
                          className='rounded-lg border border-gold/30 bg-gold-soft px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10 disabled:opacity-50'
                        >
                          {updatingId === order.id ? '处理中…' : '开始制作'}
                        </button>
                      )}
                      {(order.status === 'new' || order.status === 'cooking') && (
                        <button
                          type='button'
                          disabled={updatingId === order.id}
                          onClick={() => patchStatus(order.id, 'done')}
                          className='rounded-lg bg-leaf px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50'
                        >
                          {updatingId === order.id ? '处理中…' : '上菜'}
                        </button>
                      )}
                      <button
                        type='button'
                        onClick={() => setDeleteTarget(order)}
                        disabled={deletingId === order.id}
                        className='rounded-lg border border-ember/20 bg-ember-soft px-3 py-1.5 text-xs font-semibold text-ember hover:bg-ember/10 disabled:opacity-50'
                      >
                        {deletingId === order.id ? '删除中…' : '删除'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={deleteTarget != null}
        title='删除订单'
        description={
          deleteTarget
            ? `确定删除订单 #${deleteTarget.id.slice(-6)} 吗？后厨记录会同步移除。`
            : ''
        }
        confirmText='删除'
        danger
        loading={deleteTarget != null && deletingId === deleteTarget.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
