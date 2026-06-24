'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, type MenuItem } from '@/lib/menu';
import {
  IconChili,
  IconClose,
  IconMinus,
  IconPlus,
  IconReceipt,
} from '@/components/ui/icons';
import { ConfirmDialog } from '@/components/ui/Feedback';
import { saveOrderHistory } from '@/lib/orderHistory';

type Cart = Record<string, number>;

const CART_STORAGE_KEY = 'order_cart_v1';

function formatPrice(price: number) {
  return price.toFixed(2);
}

type ToastState = { visible: boolean; message: string; tone: 'success' | 'error' };

export default function OrderPageClient() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>('');

  const [cart, setCart] = useState<Cart>({});
  const [cartHydrated, setCartHydrated] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('stirfry');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    tone: 'success',
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const menuById = useMemo(() => {
    const map = new Map<string, MenuItem>();
    for (const item of menuItems) map.set(item.id, item);
    return map;
  }, [menuItems]);

  const categoriesWithItems = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of menuItems) {
      if (!item.isActive) continue;
      counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    }
    return categories.filter((c) => (counts.get(c.id) ?? 0) > 0);
  }, [menuItems]);

  const { totalCount, totalPrice } = useMemo(() => {
    let count = 0;
    let price = 0;
    for (const [idStr, qty] of Object.entries(cart)) {
      const item = menuById.get(idStr);
      if (!item) continue;
      count += qty;
      price += item.price * qty;
    }
    return { totalCount: count, totalPrice: price };
  }, [cart, menuById]);

  // 读取本地暂存的购物车（刷新/返回不丢单）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Cart;
        if (parsed && typeof parsed === 'object') setCart(parsed);
      }
    } catch {
      // 忽略损坏数据
    } finally {
      setCartHydrated(true);
    }
  }, []);

  // 购物车变化时写回本地
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      if (Object.keys(cart).length === 0) localStorage.removeItem(CART_STORAGE_KEY);
      else localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // 忽略写入失败
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    if (Object.keys(cart).length === 0) setIsCartOpen(false);
  }, [cart]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const res = await fetch('/api/menu', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.msg || '加载菜品失败');
        const items = (json?.data ?? []) as MenuItem[];
        if (!cancelled) {
          setMenuItems(items);
          const first = categories.find((c) =>
            items.some((it) => it.isActive && it.categoryId === c.id)
          );
          if (first) setActiveCategory(first.id);
          // 清理本地购物车里已下架/已删除的菜品
          const validIds = new Set(
            items.filter((it) => it.isActive).map((it) => it.id)
          );
          setCart((prev) => {
            const next: Cart = {};
            let changed = false;
            for (const [id, qty] of Object.entries(prev)) {
              if (validIds.has(id) && qty > 0) next[id] = qty;
              else changed = true;
            }
            return changed ? next : prev;
          });
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : '加载菜品失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 监听滚动：自动高亮当前分类 tab（以 main 容器为 root）
  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    if (categoriesWithItems.length === 0) return;

    const targets = categoriesWithItems
      .map((c) => document.getElementById(`cat-${c.id}`))
      .filter(Boolean) as HTMLElement[];

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target?.id?.startsWith('cat-')) {
          const id = visible[0].target.id.replace('cat-', '');
          setActiveCategory(id);
        }
      },
      {
        root,
        threshold: [0.1, 0.2, 0.3, 0.4, 0.5],
        rootMargin: '-15% 0px -70% 0px',
      }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [categoriesWithItems]);

  const showToast = (message: string, tone: ToastState['tone']) => {
    setToast({ visible: true, message, tone });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      1200
    );
  };

  const updateCart = (itemId: string, change: number) => {
    setCart((prev) => {
      const next: Cart = { ...prev };
      const current = next[itemId] ?? 0;
      const updated = current + change;
      if (updated <= 0) delete next[itemId];
      else next[itemId] = updated;
      return next;
    });
    if (change > 0) showToast('已加入点单', 'success');
  };

  const clearCart = () => {
    setCart({});
    setIsCartOpen(false);
    setConfirmClearOpen(false);
  };

  const placeOrder = async () => {
    if (totalCount <= 0 || isPlacingOrder) return;
    const orderItems = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => {
        const item = menuById.get(id);
        if (!item) return null;
        return {
          menuItemId: id,
          name: item.name,
          quantity,
          subtotal: item.price * quantity,
        };
      })
      .filter(Boolean) as Array<{
      menuItemId: string;
      name: string;
      quantity: number;
      subtotal: number;
    }>;
    const snapshotTotalCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const snapshotTotalPrice = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    setIsPlacingOrder(true);
    try {
      const items = orderItems.map(({ menuItemId, quantity }) => ({
        menuItemId,
        quantity,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '点菜失败');

      const orderId =
        typeof json?.data?.id === 'string' ? json.data.id : `local-${Date.now()}`;
      saveOrderHistory({
        id: orderId,
        createdAt:
          typeof json?.data?.createdAt === 'string'
            ? json.data.createdAt
            : new Date().toISOString(),
        totalCount: snapshotTotalCount,
        totalPrice: snapshotTotalPrice,
        items: orderItems.map(({ name, quantity, subtotal }) => ({
          name,
          quantity,
          subtotal,
        })),
      });
      setCart({});
      setIsCartOpen(false);
      const suffix = orderId.startsWith('local-') ? '' : orderId.slice(-6);
      showToast(`点菜成功${suffix ? `（#${suffix}）` : ''}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '点菜失败', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    requestAnimationFrame(() => {
      document.getElementById(`cat-${catId}`)?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const cartItemIds = Object.keys(cart).filter((id) => (cart[id] ?? 0) > 0);

  return (
    <div className='min-h-screen bg-paper text-ink flex flex-col overflow-hidden pb-32'>
      {/* 顶栏：店名 + 堂食点餐 */}
      <header className='bg-surface/90 backdrop-blur border-b border-line z-20'>
        <div className='max-w-4xl mx-auto px-4 py-3.5'>
          <div className='flex justify-between items-center'>
            <div className='min-w-0'>
              <h1 className='font-display text-xl font-bold text-ink tracking-tight'>
                洁洁的美食小世界
              </h1>
              <p className='mt-0.5 flex items-center gap-1 text-xs text-ink-soft'>
                <IconChili className='h-3.5 w-3.5 text-ember' />
                地道湘味 · 辣得过瘾
              </p>
            </div>
            <span className='shrink-0 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-semibold text-gold'>
              堂食点餐
            </span>
          </div>

          {/* 移动端：分类横向滚动 */}
          <div className='mt-3 md:hidden'>
            <div className='no-scrollbar flex gap-2 overflow-x-auto pb-1'>
              {categoriesWithItems.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type='button'
                    onClick={() => scrollToCategory(cat.id)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-ember text-white shadow-card'
                        : 'bg-paper-deep text-ink-soft hover:text-ink'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div className='flex-1 overflow-hidden'>
        <div className='max-w-4xl mx-auto h-full flex overflow-hidden'>
          {/* PC：左侧分类（美团式窄栏） */}
          <aside className='hidden md:flex w-40 shrink-0 flex-col bg-surface border-r border-line'>
            <div className='no-scrollbar flex-1 overflow-y-auto py-3'>
              {categoriesWithItems.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type='button'
                    onClick={() => scrollToCategory(cat.id)}
                    className={`relative w-full text-left px-4 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-paper text-ember'
                        : 'text-ink-soft hover:bg-paper/60 hover:text-ink'
                    }`}
                  >
                    {active && (
                      <span className='absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-ember' />
                    )}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 菜品列表：美团式单列一行一菜 */}
          <main
            ref={mainRef}
            className='flex-1 overflow-y-auto bg-paper pb-32 scroll-smooth'
          >
            {loading ? (
              <div className='p-4 space-y-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex gap-3 rounded-2xl bg-surface p-3 shadow-card'
                  >
                    <div className='h-20 w-20 shrink-0 animate-pulse rounded-xl bg-paper-deep' />
                    <div className='flex-1 space-y-2 py-1'>
                      <div className='h-4 w-2/3 animate-pulse rounded bg-paper-deep' />
                      <div className='h-3 w-full animate-pulse rounded bg-paper-deep' />
                      <div className='h-4 w-16 animate-pulse rounded bg-paper-deep' />
                    </div>
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className='m-4 rounded-2xl bg-surface p-5 shadow-card'>
                <div className='text-sm font-bold text-ink'>加载失败</div>
                <div className='mt-1 text-sm text-ink-soft'>{loadError}</div>
                <button
                  type='button'
                  onClick={() => window.location.reload()}
                  className='mt-4 rounded-full bg-ember text-white px-5 py-2 text-sm font-semibold active:scale-95 transition-transform'
                >
                  刷新重试
                </button>
              </div>
            ) : menuItems.length === 0 ? (
              <div className='p-10 text-center text-sm text-ink-faint'>暂无菜品</div>
            ) : (
              <div className='p-3 md:p-4'>
                {categoriesWithItems.map((cat) => {
                  const items = menuItems.filter(
                    (i) => i.isActive && i.categoryId === cat.id
                  );
                  if (items.length === 0) return null;
                  return (
                    <section key={cat.id} id={`cat-${cat.id}`} className='mb-6'>
                      <div className='mb-2.5 flex items-center gap-2 px-1'>
                        <span className='h-3.5 w-1 rounded-full bg-ember' />
                        <h3 className='font-display text-base font-bold text-ink'>
                          {cat.name}
                        </h3>
                      </div>
                      <div className='overflow-hidden rounded-2xl bg-surface shadow-card'>
                        {items.map((item, idx) => {
                          const count = cart[item.id] ?? 0;
                          const isLast = idx === items.length - 1;
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 p-3 transition-colors ${
                                !isLast ? 'border-b border-line' : ''
                              }`}
                            >
                              <button
                                type='button'
                                onClick={() => setDetailItem(item)}
                                className='relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-deep'
                                aria-label={`查看 ${item.name} 详情`}
                              >
                                <Image
                                  src={item.img}
                                  alt={item.name}
                                  fill
                                  sizes='80px'
                                  className='object-cover'
                                />
                              </button>
                              <div className='flex-1 min-w-0'>
                                <button
                                  type='button'
                                  onClick={() => setDetailItem(item)}
                                  className='text-left w-full'
                                >
                                  <h4 className='font-semibold text-ink truncate'>
                                    {item.name}
                                  </h4>
                                  <p className='mt-0.5 text-xs text-ink-soft line-clamp-1'>
                                    {item.desc}
                                  </p>
                                </button>
                                <div className='mt-1.5 flex items-baseline gap-0.5 text-ember'>
                                  <span className='text-xs font-semibold'>¥</span>
                                  <span className='tnum text-lg font-bold leading-none'>
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                              </div>
                              <div className='flex items-center gap-2 shrink-0'>
                                {count > 0 ? (
                                  <>
                                    <button
                                      type='button'
                                      onClick={() => updateCart(item.id, -1)}
                                      className='flex h-8 w-8 items-center justify-center rounded-full border border-ember/40 text-ember active:scale-90 transition-transform'
                                      aria-label={`减少 ${item.name}`}
                                    >
                                      <IconMinus className='h-4 w-4' />
                                    </button>
                                    <span className='tnum w-5 text-center text-sm font-bold text-ink select-none'>
                                      {count}
                                    </span>
                                  </>
                                ) : null}
                                <button
                                  type='button'
                                  onClick={() => updateCart(item.id, 1)}
                                  className='flex h-8 w-8 items-center justify-center rounded-full bg-ember text-white shadow-card active:scale-90 transition-transform'
                                  aria-label={`添加 ${item.name}`}
                                >
                                  <IconPlus className='h-4 w-4' />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 底部点单栏（在全局底部导航之上） */}
      <div className='safe-bottom above-user-nav fixed left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur'>
        <div className='max-w-4xl mx-auto px-4 flex items-center gap-4 py-3'>
          <button
            type='button'
            className='flex items-center flex-1 min-w-0 text-left'
            onClick={() => {
              if (totalCount > 0) setIsCartOpen(true);
            }}
          >
            <div className='relative shrink-0'>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  totalCount > 0 ? 'bg-ember text-white' : 'bg-paper-deep text-ink-faint'
                }`}
              >
                <IconReceipt className='h-6 w-6' />
              </div>
              {totalCount > 0 && (
                <span className='tnum absolute -top-1 -right-1 flex h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-surface bg-gold px-1 text-[11px] font-bold text-white'>
                  {totalCount}
                </span>
              )}
            </div>
            <div className='ml-3 min-w-0'>
              <div className='flex items-baseline gap-0.5 text-ink'>
                <span className='text-sm font-semibold'>¥</span>
                <span className='tnum text-xl font-bold leading-none'>
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className='mt-0.5 text-xs text-ink-soft'>
                {totalCount > 0 ? `已点 ${totalCount} 道` : '还未点菜'}
              </div>
            </div>
          </button>
          <button
            type='button'
            onClick={placeOrder}
            disabled={totalCount <= 0 || isPlacingOrder}
            className='shrink-0 rounded-full bg-ember px-7 py-3 font-bold text-white shadow-card transition-all active:scale-95 disabled:bg-paper-deep disabled:text-ink-faint disabled:shadow-none'
          >
            {totalCount > 0 ? (isPlacingOrder ? '提交中…' : '下单') : '下单'}
          </button>
        </div>
      </div>

      {/* 已点菜品抽屉 */}
      {isCartOpen && (
        <div
          className='fixed inset-0 z-50 flex flex-col justify-end bg-ink/40 animate-fade-in'
          onClick={() => setIsCartOpen(false)}
          role='dialog'
          aria-modal='true'
          aria-label='已点菜品'
        >
          <div
            className='flex max-h-[65vh] flex-col rounded-t-3xl bg-surface shadow-float animate-slide-up'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between border-b border-line px-5 py-4'>
              <span className='font-display text-base font-bold text-ink'>已点菜品</span>
              <button
                type='button'
                className='text-sm font-medium text-ink-soft hover:text-ember'
                onClick={() => setConfirmClearOpen(true)}
              >
                清空
              </button>
            </div>
            <div className='flex-1 overflow-y-auto px-5'>
              {cartItemIds.length === 0 ? (
                <div className='py-12 text-center text-sm text-ink-faint'>还未点菜</div>
              ) : (
                <ul className='py-2'>
                  {cartItemIds.map((id) => {
                    const item = menuById.get(id);
                    const qty = cart[id] ?? 0;
                    if (!item || qty <= 0) return null;
                    return (
                      <li
                        key={id}
                        className='flex items-center gap-3 border-b border-line py-3 last:border-0'
                      >
                        <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-paper-deep'>
                          <Image
                            src={item.img}
                            alt={item.name}
                            fill
                            sizes='56px'
                            className='object-cover'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium text-ink truncate'>{item.name}</div>
                          <div className='tnum mt-0.5 text-xs text-ember font-semibold'>
                            ¥{formatPrice(item.price)} × {qty}
                          </div>
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          <button
                            type='button'
                            onClick={() => updateCart(item.id, -1)}
                            className='flex h-7 w-7 items-center justify-center rounded-full border border-line-strong text-ink-soft active:scale-90 transition-transform'
                            aria-label={`减少 ${item.name}`}
                          >
                            <IconMinus className='h-3.5 w-3.5' />
                          </button>
                          <span className='tnum w-5 text-center text-sm font-semibold text-ink'>
                            {qty}
                          </span>
                          <button
                            type='button'
                            onClick={() => updateCart(item.id, 1)}
                            className='flex h-7 w-7 items-center justify-center rounded-full bg-ember text-white active:scale-90 transition-transform'
                            aria-label={`添加 ${item.name}`}
                          >
                            <IconPlus className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className='border-t border-line p-4'>
              <button
                type='button'
                onClick={() => {
                  setIsCartOpen(false);
                  placeOrder();
                }}
                disabled={totalCount <= 0 || isPlacingOrder}
                className='flex w-full items-center justify-center gap-2 rounded-full bg-ember py-3.5 font-bold text-white shadow-card transition-all active:scale-[0.98] disabled:opacity-50'
              >
                确认点菜
                <span className='tnum'>¥{formatPrice(totalPrice)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 菜品详情弹窗 */}
      {detailItem && (
        <div
          className='fixed inset-0 z-[55] flex items-center justify-center px-4 bg-ink/40 animate-fade-in'
          onClick={() => setDetailItem(null)}
          role='dialog'
          aria-modal='true'
          aria-label='菜品详情'
        >
          <div
            className='w-full max-w-sm overflow-hidden rounded-3xl bg-surface shadow-float animate-pop-in'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='relative h-48 w-full bg-paper-deep'>
              <Image
                src={detailItem.img}
                alt={detailItem.name}
                fill
                sizes='(max-width: 768px) 100vw, 400px'
                className='object-cover'
              />
              <div className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/30 to-transparent' />
              <button
                type='button'
                onClick={() => setDetailItem(null)}
                className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/50 text-white backdrop-blur'
                aria-label='关闭'
              >
                <IconClose className='h-4 w-4' />
              </button>
            </div>
            <div className='space-y-2 p-5'>
              <div className='flex items-start justify-between gap-3'>
                <h3 className='font-display min-w-0 break-words text-lg font-bold text-ink'>
                  {detailItem.name}
                </h3>
                <div className='tnum shrink-0 text-xl font-bold text-ember'>
                  ¥{formatPrice(detailItem.price)}
                </div>
              </div>
              <p className='text-sm leading-relaxed text-ink-soft'>{detailItem.desc}</p>
            </div>
            <div className='flex gap-3 px-5 pb-5 pt-1'>
              <button
                type='button'
                onClick={() => setDetailItem(null)}
                className='flex-1 rounded-full border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper'
              >
                返回
              </button>
              <button
                type='button'
                onClick={() => {
                  updateCart(detailItem.id, 1);
                  setDetailItem(null);
                }}
                className='flex-1 rounded-full bg-ember px-4 py-2.5 text-sm font-bold text-white shadow-card transition-transform active:scale-95'
              >
                加入点单
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-float animate-pop-in ${
            toast.tone === 'success' ? 'bg-ink text-paper' : 'bg-ember text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
      <ConfirmDialog
        open={confirmClearOpen}
        title='清空已点菜品'
        description='确定清空当前点单吗？已经选择的菜品会从购物车移除。'
        confirmText='清空'
        danger
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={clearCart}
      />
    </div>
  );
}
