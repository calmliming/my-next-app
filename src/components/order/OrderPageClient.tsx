'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, getCategoryName, type MenuItem } from '@/lib/menu';

type Cart = Record<string, number>;

function formatPrice(price: number) {
  return price.toFixed(2);
}

type ToastState = { visible: boolean; message: string; tone: 'success' | 'error' };

export default function OrderPageClient() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>('');

  const [cart, setCart] = useState<Cart>({});
  const [activeCategory, setActiveCategory] = useState<string>('stirfry');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
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
    if (change > 0) showToast('已添加到购物车', 'success');
  };

  const clearCart = () => {
    if (!confirm('确定要清空购物车吗？')) return;
    setCart({});
    setIsCartOpen(false);
  };

  const placeOrder = async () => {
    if (totalCount <= 0 || isPlacingOrder) return;
    setIsPlacingOrder(true);
    try {
      const items = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '点菜失败');

      setCart({});
      setIsCartOpen(false);
      const suffix =
        typeof json?.data?.id === 'string' ? json.data.id.slice(-6) : '';
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
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col overflow-hidden pb-20'>
      <header className='bg-white shadow-sm z-20'>
        <div className='max-w-6xl mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>洁洁的美食小世界 🌶️</h1>
              <p className='text-xs text-gray-500'>地道湘味，辣得过瘾</p>
            </div>
            <div className='text-sm bg-red-100 text-red-600 px-2  py-1 rounded-lg font-bold'>
              🔥 火热营业中
            </div>
          </div>

          {/* 移动端：顶部横向 tabs */}
          <div className='mt-3 md:hidden'>
            <div className='flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [scrollbar-width]:none'>
              {categoriesWithItems.map((cat) => (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => scrollToCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-gray-100 text-gray-700 hover:bg-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className='flex-1 overflow-hidden'>
        <div className='max-w-6xl mx-auto px-4 h-full flex overflow-hidden'>
          {/* PC：左侧 tabs */}
          <aside className='hidden md:flex w-52 shrink-0 flex-col border-r border-gray-200 bg-white'>
            <div className='p-3 text-xs text-gray-500 font-bold'>分类</div>
            <div className='flex-1 overflow-y-auto p-2 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [scrollbar-width]:none'>
              {categoriesWithItems.map((cat) => (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => scrollToCategory(cat.id)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          <main
            ref={mainRef}
            className='flex-1 overflow-y-auto p-4 md:p-6 pb-24 scroll-smooth'
          >
            {loading ? (
              <div className='text-sm text-gray-500'>菜品加载中…</div>
            ) : loadError ? (
              <div className='rounded-xl bg-white p-4 shadow-sm'>
                <div className='text-sm font-bold text-gray-900'>加载失败</div>
                <div className='mt-1 text-sm text-gray-500'>{loadError}</div>
                <button
                  type='button'
                  onClick={() => window.location.reload()}
                  className='mt-3 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white'
                >
                  刷新重试
                </button>
              </div>
            ) : menuItems.length === 0 ? (
              <div className='text-sm text-gray-500'>暂无菜品</div>
            ) : (
              categoriesWithItems.map((cat) => {
                const items = menuItems.filter(
                  (i) => i.isActive && i.categoryId === cat.id
                );
                if (items.length === 0) return null;
                return (
                  <section key={cat.id} id={`cat-${cat.id}`} className='mb-6'>
                    <div className='flex items-end justify-between px-1'>
                      <h3 className='text-base md:text-lg font-extrabold text-gray-900'>
                        {cat.name}
                      </h3>
                      <span className='text-xs text-gray-400'>{items.length} 道</span>
                    </div>

                    <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4'>
                      {items.map((item) => {
                        const count = cart[item.id] ?? 0;
                        return (
                          <div
                            key={item.id}
                            className='bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100'
                          >
                            <div className='flex p-3 gap-3'>
                              <div className='relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-200'>
                                <Image
                                  src={item.img}
                                  alt={item.name}
                                  fill
                                  sizes='80px'
                                  className='object-cover'
                                />
                              </div>

                              <div className='flex-1 min-w-0 flex flex-col justify-between'>
                                <div className='min-w-0'>
                                  <div className='flex items-start justify-between gap-2'>
                                    <h4 className='font-extrabold text-gray-900 truncate'>
                                      {item.name}
                                    </h4>
                                    <span className='shrink-0 text-red-600 font-extrabold'>
                                      ¥{item.price}
                                    </span>
                                  </div>
                                  <p className='mt-1 text-xs text-gray-500 line-clamp-2'>
                                    {item.desc}
                                  </p>
                                </div>

                                <div className='mt-3 flex items-center justify-end'>
                                  <div className='flex items-center gap-2'>
                                    {count > 0 ? (
                                      <>
                                        <button
                                          type='button'
                                          onClick={() => updateCart(item.id, -1)}
                                          className='w-7 h-7 rounded-full border border-red-600 text-red-600 flex items-center justify-center active:scale-95 transition-transform'
                                          aria-label={`减少 ${item.name}`}
                                        >
                                          −
                                        </button>
                                        <span className='text-sm font-extrabold w-5 text-center select-none'>
                                          {count}
                                        </span>
                                      </>
                                    ) : null}
                                    <button
                                      type='button'
                                      onClick={() => updateCart(item.id, 1)}
                                      className='w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center active:scale-95 transition-transform shadow'
                                      aria-label={`添加 ${item.name}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </main>
        </div>
      </div>

      {/* 底部栏 */}
      <div className='fixed bottom-20 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40'>
        <div className='max-w-6xl mx-auto px-4 flex items-center justify-between py-4'>
          <button
            type='button'
            className='flex items-center flex-1 text-left'
            onClick={() => {
              if (totalCount > 0) setIsCartOpen(true);
            }}
          >
            <div className='relative'>
              <div className='w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg -mt-8 border-4 border-gray-100'>
                🛒
              </div>
              {totalCount > 0 ? (
                <div className='absolute -top-6 -right-1 bg-yellow-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center'>
                  {totalCount}
                </div>
              ) : null}
            </div>
            <div className='ml-4'>
              <div className='text-lg font-extrabold text-gray-900'>
                ¥ <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className='text-xs text-gray-500'>洁洁为您现炒现做</div>
            </div>
          </button>

          <button
            type='button'
            onClick={placeOrder}
            disabled={totalCount <= 0 || isPlacingOrder}
            className='bg-red-600 text-white px-8 py-2.5 rounded-full font-extrabold shadow-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform'
          >
            {totalCount > 0 ? (isPlacingOrder ? '点菜中…' : '点菜') : '未选购'}
          </button>
        </div>
      </div>

      {/* 购物车弹窗 */}
      {isCartOpen ? (
        <div
          className='fixed inset-0 bg-black/50 z-40 flex flex-col justify-end'
          onClick={() => setIsCartOpen(false)}
          role='dialog'
          aria-modal='true'
          aria-label='购物车'
        >
          <div
            className='bg-white rounded-t-2xl p-4 max-h-[60vh] flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center border-b pb-3 mb-2'>
              <span className='text-sm text-gray-500'>已选菜品</span>
              <button type='button' className='text-sm text-red-500' onClick={clearCart}>
                🗑️ 清空购物车
              </button>
            </div>

            <div className='overflow-y-auto flex-1'>
              {cartItemIds.length === 0 ? (
                <div className='text-center text-gray-400 py-8 text-sm'>购物车是空的</div>
              ) : (
                cartItemIds.map((id) => {
                  const item = menuById.get(id);
                  const qty = cart[id] ?? 0;
                  if (!item || qty <= 0) return null;
                  return (
                    <div
                      key={id}
                      className='flex justify-between items-center py-3 border-b border-gray-100 last:border-0'
                    >
                      <div className='flex-1'>
                        <div className='text-sm font-bold text-gray-800'>{item.name}</div>
                        <div className='text-xs text-gray-400'>
                          ¥{item.price * qty}（{getCategoryName(item.categoryId)}）
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button
                          type='button'
                          onClick={() => updateCart(item.id, -1)}
                          className='w-6 h-6 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center active:scale-95 transition-transform'
                          aria-label={`减少 ${item.name}`}
                        >
                          −
                        </button>
                        <span className='text-sm w-4 text-center'>{qty}</span>
                        <button
                          type='button'
                          onClick={() => updateCart(item.id, 1)}
                          className='w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center active:scale-95 transition-transform'
                          aria-label={`添加 ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className='h-20' />
          </div>
          <div className='flex-1' />
        </div>
      ) : null}

      {/* Toast */}
      {toast.visible ? (
        <div
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-sm z-50 shadow-lg ${
            toast.tone === 'success' ? 'bg-black/80 text-white' : 'bg-red-700 text-white'
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
