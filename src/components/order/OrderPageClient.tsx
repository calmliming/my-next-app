'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, type MenuItem } from '@/lib/menu';

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
    if (change > 0) showToast('已加入点单', 'success');
  };

  const clearCart = () => {
    if (!confirm('确定清空已点菜品吗？')) return;
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
    <div className='min-h-screen bg-[#f5f5f5] text-gray-800 flex flex-col overflow-hidden pb-32'>
      {/* 顶栏：店名 + 堂食点餐 */}
      <header className='bg-white border-b border-gray-100 z-20'>
        <div className='max-w-4xl mx-auto px-4 py-3'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-lg font-bold text-gray-900'>洁洁的美食小世界</h1>
              <p className='text-xs text-gray-500 mt-0.5'>地道湘味 · 辣得过瘾</p>
            </div>
            <span className='text-xs bg-amber-400 text-gray-900 px-2.5 py-1 rounded font-medium'>
              堂食点餐
            </span>
          </div>

          {/* 移动端：分类横向滚动 */}
          <div className='mt-3 md:hidden'>
            <div className='flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [scrollbar-width]:none'>
              {categoriesWithItems.map((cat) => (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => scrollToCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-amber-400 text-gray-900'
                      : 'bg-gray-100 text-gray-600'
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
        <div className='max-w-4xl mx-auto h-full flex overflow-hidden'>
          {/* PC：左侧分类（美团式窄栏） */}
          <aside className='hidden md:flex w-36 shrink-0 flex-col bg-white border-r border-gray-100'>
            <div className='flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:hidden'>
              {categoriesWithItems.map((cat) => (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => scrollToCategory(cat.id)}
                  className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-colors border-l-2 ${
                    activeCategory === cat.id
                      ? 'border-amber-400 bg-amber-50/80 text-gray-900'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* 菜品列表：美团式单列一行一菜 */}
          <main
            ref={mainRef}
            className='flex-1 overflow-y-auto bg-[#f5f5f5] pb-32 scroll-smooth'
          >
            {loading ? (
              <div className='p-4 text-sm text-gray-500'>加载中…</div>
            ) : loadError ? (
              <div className='m-4 rounded-xl bg-white p-4 shadow-sm'>
                <div className='text-sm font-bold text-gray-900'>加载失败</div>
                <div className='mt-1 text-sm text-gray-500'>{loadError}</div>
                <button
                  type='button'
                  onClick={() => window.location.reload()}
                  className='mt-3 rounded-full bg-amber-400 text-gray-900 px-4 py-2 text-sm font-bold'
                >
                  刷新重试
                </button>
              </div>
            ) : menuItems.length === 0 ? (
              <div className='p-4 text-sm text-gray-500'>暂无菜品</div>
            ) : (
              <div className='p-3 md:p-4'>
                {categoriesWithItems.map((cat) => {
                  const items = menuItems.filter(
                    (i) => i.isActive && i.categoryId === cat.id
                  );
                  if (items.length === 0) return null;
                  return (
                    <section key={cat.id} id={`cat-${cat.id}`} className='mb-5'>
                      <h3 className='text-sm font-bold text-gray-500 px-1 mb-2'>
                        {cat.name}
                      </h3>
                      <div className='space-y-0 overflow-hidden rounded-xl bg-white shadow-sm'>
                        {items.map((item, idx) => {
                          const count = cart[item.id] ?? 0;
                          const isLast = idx === items.length - 1;
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 p-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
                            >
                              <div className='relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100'>
                                <Image
                                  src={item.img}
                                  alt={item.name}
                                  fill
                                  sizes='80px'
                                  className='object-cover'
                                />
                              </div>
                              <div className='flex-1 min-w-0'>
                                <button
                                  type='button'
                                  onClick={() => setDetailItem(item)}
                                  className='text-left w-full'
                                >
                                  <h4 className='font-semibold text-gray-900 truncate'>
                                    {item.name}
                                  </h4>
                                  <p className='text-xs text-gray-500 line-clamp-1 mt-0.5'>
                                    {item.desc}
                                  </p>
                                  <p className='text-amber-600 font-bold mt-1'>
                                    ¥{formatPrice(item.price)}
                                  </p>
                                  <span className='mt-0.5 inline-block text-[11px] text-amber-600'>
                                    查看详情
                                  </span>
                                </button>
                              </div>
                              <div className='flex items-center gap-1.5 shrink-0'>
                                {count > 0 ? (
                                  <>
                                    <button
                                      type='button'
                                      onClick={() => updateCart(item.id, -1)}
                                      className='w-8 h-8 rounded-full border border-amber-400 text-amber-600 flex items-center justify-center text-lg leading-none active:scale-95'
                                      aria-label={`减少 ${item.name}`}
                                    >
                                      −
                                    </button>
                                    <span className='text-sm font-semibold w-5 text-center select-none'>
                                      {count}
                                    </span>
                                  </>
                                ) : null}
                                <button
                                  type='button'
                                  onClick={() => updateCart(item.id, 1)}
                                  className='w-8 h-8 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center text-lg leading-none font-bold active:scale-95'
                                  aria-label={`添加 ${item.name}`}
                                >
                                  +
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
      <div className='fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40'>
        <div className='max-w-4xl mx-auto px-4 flex items-center gap-4 py-3'>
          <button
            type='button'
            className='flex items-center flex-1 min-w-0 text-left'
            onClick={() => {
              if (totalCount > 0) setIsCartOpen(true);
            }}
          >
            <div className='relative shrink-0'>
              <div className='w-11 h-11 rounded-full bg-[#f5f5f5] flex items-center justify-center text-xl'>
                📋
              </div>
              {totalCount > 0 && (
                <span className='absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center'>
                  {totalCount}
                </span>
              )}
            </div>
            <div className='ml-3 min-w-0'>
              <div className='text-base font-bold text-gray-900'>
                ¥<span>{formatPrice(totalPrice)}</span>
              </div>
              <div className='text-xs text-gray-500'>
                {totalCount > 0 ? `已点 ${totalCount} 道` : '还未点菜'}
              </div>
            </div>
          </button>
          <button
            type='button'
            onClick={placeOrder}
            disabled={totalCount <= 0 || isPlacingOrder}
            className='shrink-0 bg-amber-400 text-gray-900 px-6 py-2.5 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform'
          >
            {totalCount > 0 ? (isPlacingOrder ? '提交中…' : '下单') : '下单'}
          </button>
        </div>
      </div>

      {/* 已点菜品抽屉 */}
      {isCartOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-50 flex flex-col justify-end'
          onClick={() => setIsCartOpen(false)}
          role='dialog'
          aria-modal='true'
          aria-label='已点菜品'
        >
          <div
            className='bg-white rounded-t-2xl shadow-xl max-h-[65vh] flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center px-4 py-3 border-b border-gray-100'>
              <span className='font-semibold text-gray-900'>已点菜品</span>
              <button
                type='button'
                className='text-sm text-amber-600'
                onClick={clearCart}
              >
                清空
              </button>
            </div>
            <div className='overflow-y-auto flex-1 px-4'>
              {cartItemIds.length === 0 ? (
                <div className='text-center text-gray-400 py-10 text-sm'>
                  还未点菜
                </div>
              ) : (
                <ul className='py-2'>
                  {cartItemIds.map((id) => {
                    const item = menuById.get(id);
                    const qty = cart[id] ?? 0;
                    if (!item || qty <= 0) return null;
                    return (
                      <li
                        key={id}
                        className='flex justify-between items-center py-3 border-b border-gray-100 last:border-0'
                      >
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium text-gray-900'>{item.name}</div>
                          <div className='text-xs text-gray-500'>
                            ¥{formatPrice(item.price)} × {qty}
                          </div>
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          <button
                            type='button'
                            onClick={() => updateCart(item.id, -1)}
                            className='w-7 h-7 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center active:scale-95'
                            aria-label={`减少 ${item.name}`}
                          >
                            −
                          </button>
                          <span className='text-sm w-5 text-center'>{qty}</span>
                          <button
                            type='button'
                            onClick={() => updateCart(item.id, 1)}
                            className='w-7 h-7 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center active:scale-95 font-medium'
                            aria-label={`添加 ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className='p-4 border-t border-gray-100'>
              <button
                type='button'
                onClick={() => {
                  setIsCartOpen(false);
                  placeOrder();
                }}
                disabled={totalCount <= 0 || isPlacingOrder}
                className='w-full py-3 rounded-full bg-amber-400 text-gray-900 font-bold disabled:opacity-50'
              >
                确认点菜 ¥{formatPrice(totalPrice)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 菜品详情弹窗 */}
      {detailItem && (
        <div
          className='fixed inset-0 bg-black/40 z-[55] flex items-center justify-center px-4'
          onClick={() => setDetailItem(null)}
          role='dialog'
          aria-modal='true'
          aria-label='菜品详情'
        >
          <div
            className='w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='relative w-full h-40 bg-gray-100'>
              <Image
                src={detailItem.img}
                alt={detailItem.name}
                fill
                sizes='(max-width: 768px) 100vw, 400px'
                className='object-cover'
              />
              <button
                type='button'
                onClick={() => setDetailItem(null)}
                className='absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center'
                aria-label='关闭'
              >
                ✕
              </button>
            </div>
            <div className='p-4 space-y-2'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h3 className='font-bold text-base text-gray-900 break-words'>
                    {detailItem.name}
                  </h3>
                </div>
                <div className='shrink-0 text-amber-600 font-extrabold'>
                  ¥{formatPrice(detailItem.price)}
                </div>
              </div>
              <p className='text-xs text-gray-500 leading-relaxed'>
                {detailItem.desc}
              </p>
            </div>
            <div className='px-4 pb-4 pt-1 flex gap-3'>
              <button
                type='button'
                onClick={() => setDetailItem(null)}
                className='flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
              >
                返回
              </button>
              <button
                type='button'
                onClick={() => {
                  updateCart(detailItem.id, 1);
                  setDetailItem(null);
                }}
                className='flex-1 rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-300 active:scale-95 transition-transform'
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
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-sm z-[60] shadow-lg ${
            toast.tone === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
